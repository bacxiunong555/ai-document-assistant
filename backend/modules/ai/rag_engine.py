import json
import re
import logging
import threading
import unicodedata
from langchain_core.documents import Document
from backend.infrastructure.llm.llm import get_llm
from backend.infrastructure.vector_store.chroma import get_vector_store
from backend.modules.ai.prompt_builder import PromptBuilder, normalize_doc_type_label

logger = logging.getLogger(__name__)

_engine_instance = None
_lock = threading.Lock()

class RAGEngine:
    SIMILARITY_THRESHOLD = 0.75
    MAX_CHUNKS = 3
    DEFAULT_TOP_K = 5
    TYPE_CHUNKS = 2
    GENERAL_CHUNKS = 1
    MAX_CONTEXT_CHARS = 1200
    DOC_TYPE_TITLES = {
        "cong-van": "CÔNG VĂN",
        "quyet-dinh": "QUYẾT ĐỊNH",
        "nghi-quyet": "NGHỊ QUYẾT",
        "van-ban-co-ten-loai": "VĂN BẢN",
        "cong-dien": "CÔNG ĐIỆN",
        "giay-moi": "GIẤY MỜI",
        "giay-gioi-thieu": "GIẤY GIỚI THIỆU",
        "bien-ban": "BIÊN BẢN",
        "giay-nghi-phep": "GIẤY NGHỈ PHÉP",
        "to-trinh": "TỜ TRÌNH",
        "bao-cao": "BÁO CÁO",
        "ke-hoach": "KẾ HOẠCH",
        "thong-bao": "THÔNG BÁO",
    }

    def __init__(self):
        self.llm = get_llm()
        self.vector_store = get_vector_store()
        self.prompt_builder = PromptBuilder()

    def _select_chunks(
        self,
        results: list[tuple[Document, float]],
        limit: int,
        match_type: str,
        allow_fallback: bool = True,
    ) -> list[Document]:
        filtered = []
        for doc, score in results:
            if score <= self.SIMILARITY_THRESHOLD:
                doc.metadata["score"] = score
                doc.metadata["match_type"] = match_type
                filtered.append(doc)
        if allow_fallback and len(filtered) < 2:
            filtered = []
            for doc, score in results[:2]:
                doc.metadata["score"] = score
                doc.metadata["match_type"] = match_type
                filtered.append(doc)
        return filtered[:limit]

    def _title_case_vi(self, value: str) -> str:
        if not value:
            return value
        parts = re.split(r"(\s+|-)", value.strip().lower())
        return "".join(part[:1].upper() + part[1:] if part and not part.isspace() and part != "-" else part for part in parts)

    def _strip_accents(self, value: str) -> str:
        value = unicodedata.normalize("NFD", value or "")
        value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
        return value.replace("đ", "d").replace("Đ", "D")

    def _normalize_dia_danh_thoi_gian(self, value: str) -> str:
        if not value or "," not in value:
            return value
        dia_danh, rest = value.split(",", 1)
        return f"{self._title_case_vi(dia_danh)}, {rest.strip()}"

    def _normalize_noi_nhan(self, value) -> list[str]:
        if not value:
            return ["- Lưu: VT."]
        lines = value if isinstance(value, list) else str(value).splitlines()
        normalized = []
        for line in lines:
            text = str(line).strip()
            if not text:
                continue
            text = re.sub(r"^[-–•]\s*", "", text).strip()
            parts = [p.strip(" ;.") for p in re.split(r",\s*(?=Lưu|lưu)", text) if p.strip(" ;.")]
            for part in parts:
                plain_part = self._strip_accents(part).lower()
                if re.search(r"\bluu\b", plain_part):
                    item = "- Lưu: VT."
                else:
                    item = f"- {part};"
                if item not in normalized:
                    normalized.append(item)
        if not any("Lưu" in item for item in normalized):
            normalized.append("- Lưu: VT.")
        return normalized

    def _strip_signature_from_noi_dung(self, content: str, result: dict) -> str:
        if not content:
            return content

        ky_ten = result.get("ky_ten") or {}
        signer = str(ky_ten.get("ho_ten") or "").strip()
        title = str(ky_ten.get("chuc_vu") or "").strip()
        signature_starts = (
            "chủ tịch", "giám đốc", "phó giám đốc", "trưởng phòng",
            "kt.", "tm.", "quyền hạn", "thẩm quyền"
        )

        lines = content.replace("./.", "").splitlines()
        kept = []
        skip_next_name = False
        cutoff = max(0, int(len(lines) * 0.55))

        for idx, raw_line in enumerate(lines):
            line = raw_line.strip()
            comparable_line = line.strip(" .;,:")
            low = line.lower()
            if not line:
                kept.append(raw_line)
                continue

            signer_match = signer and comparable_line.lower() == signer.lower()
            title_match = title and comparable_line.lower() == title.lower()
            signature_like = idx >= cutoff and low.startswith(signature_starts)
            name_after_signature = skip_next_name and re.fullmatch(r"[\wÀ-ỹĐđ\s.]{6,}", line, flags=re.UNICODE)

            if signer_match or title_match or signature_like or name_after_signature:
                skip_next_name = signature_like or title_match
                continue

            skip_next_name = False
            kept.append(raw_line)

        cleaned = "\n".join(kept).strip()
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        cleaned = cleaned.rstrip(" ./")
        return f"{cleaned}./." if cleaned else "./."

    def _ensure_terminator(self, content: str) -> str:
        cleaned = (content or "").strip()
        cleaned = cleaned.replace("./.", "").rstrip(" ./")
        return f"{cleaned}./." if cleaned else "./."

    def _strip_footer_sections_from_noi_dung(self, content: str) -> str:
        if not content:
            return content
        lines = content.splitlines()
        kept = []
        for line in lines:
            plain = self._strip_accents(line).strip().lower()
            if plain.startswith(("noi nhan", "noi nhan:", "recipients")):
                break
            kept.append(line)
        cleaned = "\n".join(kept)
        return self._ensure_terminator(cleaned)

    def _ensure_contains_heading(self, content: str, heading: str) -> str:
        if re.search(rf"(^|\n)\s*{re.escape(heading)}\s*:?", content, flags=re.IGNORECASE):
            return content
        body = content.replace("./.", "").strip()
        return self._ensure_terminator(f"{heading}:\n\n{body}")

    def _ensure_min_sections(self, content: str, sections: list[str]) -> str:
        body = content.replace("./.", "").strip()
        missing = [section for section in sections if not re.search(rf"(^|\n)\s*{re.escape(section)}", body, flags=re.IGNORECASE)]
        if not missing:
            return self._ensure_terminator(body)
        append = "\n\n".join(f"{section}\n" for section in missing)
        return self._ensure_terminator(f"{body}\n\n{append}".strip())

    def _post_process_quyet_dinh(self, content: str) -> str:
        content = self._ensure_contains_heading(content, "QUYẾT ĐỊNH")
        if not re.search(r"(^|\n)\s*Điều\s+1[\.:]", content, flags=re.IGNORECASE):
            content = self._ensure_terminator(f"{content.replace('./.', '').strip()}\n\nĐiều 1. Nội dung quyết định.\n\nĐiều 2. Quyết định này có hiệu lực kể từ ngày ký.\n\nĐiều 3. Các đơn vị, cá nhân có liên quan chịu trách nhiệm thi hành Quyết định này")
        return content

    def _post_process_nghi_quyet(self, content: str) -> str:
        content = self._ensure_contains_heading(content, "QUYẾT NGHỊ")
        if not re.search(r"(^|\n)\s*Điều\s+1[\.:]", content, flags=re.IGNORECASE):
            content = self._ensure_terminator(f"{content.replace('./.', '').strip()}\n\nĐiều 1. Thông qua nội dung nghị quyết.\n\nĐiều 2. Tổ chức thực hiện nghị quyết này")
        return content

    def _post_process_giay_moi(self, content: str) -> str:
        return self._ensure_min_sections(content, ["Thời gian:", "Địa điểm:", "Thành phần:"])

    def _post_process_bien_ban(self, content: str) -> str:
        return self._ensure_min_sections(content, ["Thời gian:", "Địa điểm:", "Thành phần tham dự:", "Nội dung:", "Kết luận:"])

    def _post_process_giay_gioi_thieu(self, content: str) -> str:
        if re.search(r"\bgiới thiệu\b", content, flags=re.IGNORECASE):
            return self._ensure_terminator(content)
        return self._ensure_terminator(f"Giới thiệu ông/bà ........................................................ đến liên hệ công tác tại ........................................................\n\n{content.replace('./.', '').strip()}")

    def _post_process_giay_nghi_phep(self, content: str) -> str:
        return self._ensure_min_sections(content, ["Ông/bà:", "Chức vụ:", "Được nghỉ phép:", "Kể từ ngày:", "Đến hết ngày:"])

    def _post_process_muc_la_ma(self, content: str, sections: list[str]) -> str:
        return self._ensure_min_sections(content, sections)

    def _post_process_by_doc_type(self, result: dict, doc_type: str) -> dict:
        content = result.get("noi_dung")
        if not isinstance(content, str):
            return result

        content = self._strip_footer_sections_from_noi_dung(content)

        if doc_type == "quyet-dinh":
            content = self._post_process_quyet_dinh(content)
        elif doc_type == "nghi-quyet":
            content = self._post_process_nghi_quyet(content)
        elif doc_type == "giay-moi":
            content = self._post_process_giay_moi(content)
        elif doc_type == "bien-ban":
            content = self._post_process_bien_ban(content)
        elif doc_type == "giay-gioi-thieu":
            content = self._post_process_giay_gioi_thieu(content)
        elif doc_type == "giay-nghi-phep":
            content = self._post_process_giay_nghi_phep(content)
        elif doc_type == "to-trinh":
            content = self._post_process_muc_la_ma(content, ["I. SỰ CẦN THIẾT", "II. NỘI DUNG ĐỀ XUẤT", "III. KIẾN NGHỊ"])
        elif doc_type == "bao-cao":
            content = self._post_process_muc_la_ma(content, ["I. TÌNH HÌNH CHUNG", "II. KẾT QUẢ THỰC HIỆN", "III. TỒN TẠI, HẠN CHẾ", "IV. PHƯƠNG HƯỚNG, NHIỆM VỤ"])
        elif doc_type == "ke-hoach":
            content = self._post_process_muc_la_ma(content, ["I. MỤC ĐÍCH, YÊU CẦU", "II. NỘI DUNG", "III. TỔ CHỨC THỰC HIỆN"])
        elif doc_type == "thong-bao":
            content = self._ensure_terminator(content)
        elif doc_type == "cong-dien":
            content = self._ensure_terminator(content)

        result["noi_dung"] = content
        return result

    def _post_process_result(self, result: dict, metadata: dict) -> dict:
        doc_type = metadata.get("doc_type")

        if isinstance(result.get("dia_danh_thoi_gian"), str):
            result["dia_danh_thoi_gian"] = self._normalize_dia_danh_thoi_gian(result["dia_danh_thoi_gian"])

        ky_ten = result.get("ky_ten")
        if isinstance(ky_ten, dict):
            if ky_ten.get("chuc_vu"):
                ky_ten["chuc_vu"] = str(ky_ten["chuc_vu"]).strip().upper()
            if ky_ten.get("ho_ten"):
                ky_ten["ho_ten"] = self._title_case_vi(str(ky_ten["ho_ten"]))

        result["noi_nhan"] = self._normalize_noi_nhan(result.get("noi_nhan"))

        if isinstance(result.get("noi_dung"), str):
            result["noi_dung"] = self._strip_signature_from_noi_dung(result["noi_dung"], result)
            if doc_type == "cong-van":
                result["noi_dung"] = re.sub(
                    r"\n?\s*Kính mong sự hợp tác của Quý đơn vị[,.]?\s*",
                    "\n",
                    result["noi_dung"],
                    flags=re.IGNORECASE,
                )
                result["noi_dung"] = re.sub(
                    r"\n\s*(Nơi nhận|Nơi nhận:).*$",
                    "./.",
                    result["noi_dung"],
                    flags=re.IGNORECASE | re.DOTALL,
                )

        result = self._post_process_by_doc_type(result, doc_type)

        if doc_type in self.DOC_TYPE_TITLES:
            result["ten_loai"] = self.DOC_TYPE_TITLES[doc_type]

        if doc_type == "cong-van":
            trich_yeu = str(result.get("trich_yeu") or metadata.get("trich_yeu") or "").strip()
            result["trich_yeu"] = re.sub(r"^(V/v|Về việc)\s*", "V/v ", trich_yeu, flags=re.IGNORECASE)

        return result

    def _build_references(self, chunks: list[Document]) -> list[dict]:
        references = []
        for idx, chunk in enumerate(chunks, start=1):
            excerpt = re.sub(r"\s+", " ", chunk.page_content).strip()
            references.append({
                "rank": idx,
                "source": chunk.metadata.get("source", ""),
                "filename": chunk.metadata.get("filename", ""),
                "doc_type": chunk.metadata.get("doc_type", ""),
                "page": chunk.metadata.get("page"),
                "score": chunk.metadata.get("score"),
                "match_type": chunk.metadata.get("match_type", ""),
                "excerpt": excerpt[:500],
            })
        return references

    def _parse_json_response(self, raw_text: str) -> dict:
        raw_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()
        raw_text = re.sub(r"^```(?:json)?", "", raw_text.strip(), flags=re.IGNORECASE).strip()
        raw_text = re.sub(r"```$", "", raw_text).strip()

        match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
        clean_json_str = match.group(1).strip() if match else raw_text

        try:
            return json.loads(clean_json_str, strict=False)
        except json.JSONDecodeError:
            repaired = clean_json_str
            repaired = re.sub(r",\s*([}\]])", r"\1", repaired)
            repaired = re.sub(
                r'("|\}|\])\s*\n\s*("(?:ten_co_quan|quoc_hieu|so_ky_hieu|dia_danh_thoi_gian|ten_loai|trich_yeu|noi_dung|ky_ten|noi_nhan)")\s*:',
                r'\1,\n\2:',
                repaired,
            )
            return json.loads(repaired, strict=False)

    def retrieve(self, query: str, doc_type: str = None) -> list[Document]:
        chunks = []

        if doc_type and doc_type != "general":
            type_results = self.vector_store.similarity_search(
                query,
                k=self.DEFAULT_TOP_K,
                filter_dict={"doc_type": doc_type},
            )
            chunks.extend(self._select_chunks(type_results, self.TYPE_CHUNKS, "same_doc_type"))

        general_results = self.vector_store.similarity_search(
            query,
            k=self.DEFAULT_TOP_K,
            filter_dict={"doc_type": "general"},
        )
        chunks.extend(self._select_chunks(
            general_results,
            self.GENERAL_CHUNKS,
            "general",
            allow_fallback=False,
        ))

        seen = set()
        unique_chunks = []
        for chunk in chunks:
            key = (
                chunk.metadata.get("source"),
                chunk.metadata.get("page"),
                chunk.page_content[:120],
            )
            if key in seen:
                continue
            seen.add(key)
            unique_chunks.append(chunk)
            if len(unique_chunks) >= self.MAX_CHUNKS:
                break

        chunks = unique_chunks
        logger.warning("[RAG] Tim duoc %d chunks (doc_type=%s, query=%s)", len(chunks), doc_type, query[:80])
        return chunks

    def generate(self, metadata: dict, template_content: str) -> dict:
        try:
            trich_yeu = metadata.get("trich_yeu", "")
            yeu_cau = metadata.get("yeu_cau_them", "")
            doc_type = metadata.get("doc_type", "cong-van")
            doc_type_label = normalize_doc_type_label(doc_type)
            query = f"{doc_type_label} {trich_yeu} {yeu_cau}".strip()

            chunks = self.retrieve(query, doc_type=doc_type)
            sources = list({c.metadata.get("source", "") for c in chunks if c.metadata.get("source")})
            references = self._build_references(chunks)

            messages = self.prompt_builder.build_messages(
                metadata,
                [c.page_content[:self.MAX_CONTEXT_CHARS] for c in chunks],
                template_content,
            )

            # Invoke LLM
            response = self.llm.invoke(messages)
            raw_text = response.content
            result = self._parse_json_response(raw_text)

            # Validate 9 keys
            REQUIRED_KEYS = ["ten_co_quan", "quoc_hieu", "so_ky_hieu", "dia_danh_thoi_gian", "ten_loai", "trich_yeu", "noi_dung", "ky_ten", "noi_nhan"]
            missing_keys = [k for k in REQUIRED_KEYS if k not in result]
            if missing_keys:
                raise ValueError(f"Thiếu trường: {missing_keys}")

            result = self._post_process_result(result, metadata)
            result["sources"] = sources
            result["rag_references"] = references
            logger.warning("[RAG] Sources=%s references=%d", sources, len(references))
            return result

        except json.JSONDecodeError as e:
            logger.error("[RAG] Loi parse JSON: %s\nText: %s", str(e), raw_text)
            raise ValueError("LLM không trả về JSON hợp lệ")
        except Exception as e:
            logger.error("[RAG] Loi generate: %s", str(e))
            raise e

def get_rag_engine() -> RAGEngine:
    global _engine_instance
    if _engine_instance is None:
        with _lock:
            if _engine_instance is None:
                logger.info("[RAG] Khoi tao RAG Engine singleton")
                _engine_instance = RAGEngine()
    return _engine_instance
