import json
import re
import logging
import threading
from langchain_core.documents import Document
from backend.infrastructure.llm.llm import get_llm
from backend.infrastructure.vector_store.chroma import get_vector_store
from backend.modules.ai.prompt_builder import PromptBuilder, normalize_doc_type_label

logger = logging.getLogger(__name__)

_engine_instance = None
_lock = threading.Lock()

class RAGEngine:
    SIMILARITY_THRESHOLD = 0.75
    MAX_CHUNKS = 5
    DEFAULT_TOP_K = 5
    TYPE_CHUNKS = 3
    GENERAL_CHUNKS = 2

    def __init__(self):
        self.llm = get_llm()
        self.vector_store = get_vector_store()
        self.prompt_builder = PromptBuilder()

    def _select_chunks(
        self,
        results: list[tuple[Document, float]],
        limit: int,
        match_type: str,
    ) -> list[Document]:
        filtered = []
        for doc, score in results:
            if score <= self.SIMILARITY_THRESHOLD:
                doc.metadata["score"] = score
                doc.metadata["match_type"] = match_type
                filtered.append(doc)
        if len(filtered) < 2:
            filtered = []
            for doc, score in results[:2]:
                doc.metadata["score"] = score
                doc.metadata["match_type"] = match_type
                filtered.append(doc)
        return filtered[:limit]

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
        chunks.extend(self._select_chunks(general_results, self.GENERAL_CHUNKS, "general"))

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
        logger.info("[RAG] Tim duoc %d chunks (query=%s)", len(chunks), query[:50])
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
                [c.page_content for c in chunks],
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

            result["sources"] = sources
            result["rag_references"] = references
            logger.info("[RAG] Sources=%s references=%d", sources, len(references))
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
