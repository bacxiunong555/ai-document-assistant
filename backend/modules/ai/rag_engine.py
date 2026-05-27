import json
import re
import logging
import threading
from langchain_core.documents import Document
from backend.infrastructure.llm.llm import get_llm
from backend.infrastructure.vector_store.chroma import get_vector_store
from backend.modules.ai.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

_engine_instance = None
_lock = threading.Lock()

class RAGEngine:
    SIMILARITY_THRESHOLD = 0.75
    MAX_CHUNKS = 3
    DEFAULT_TOP_K = 5

    def __init__(self):
        self.llm = get_llm()
        self.vector_store = get_vector_store()
        self.prompt_builder = PromptBuilder()

    def retrieve(self, query: str, doc_type: str = None) -> list[Document]:
        filter_dict = {"doc_type": doc_type} if doc_type and doc_type != "general" else None
        results = self.vector_store.similarity_search(query, k=self.DEFAULT_TOP_K, filter_dict=filter_dict)

        filtered = [doc for doc, score in results if score <= self.SIMILARITY_THRESHOLD]
        if len(filtered) < 2:
            filtered = [doc for doc, _ in results[:2]]

        chunks = filtered[:self.MAX_CHUNKS]
        logger.info("[RAG] Tim duoc %d chunks (query=%s)", len(chunks), query[:50])
        return chunks

    def generate(self, metadata: dict, template_content: str) -> dict:
        try:
            trich_yeu = metadata.get("trich_yeu", "")
            yeu_cau = metadata.get("yeu_cau_them", "")
            doc_type = metadata.get("doc_type", "Công văn")
            query = f"{doc_type} {trich_yeu} {yeu_cau}".strip()

            chunks = self.retrieve(query, doc_type=doc_type)
            sources = list({c.metadata.get("source", "") for c in chunks if c.metadata.get("source")})

            messages = self.prompt_builder.build_messages(
                metadata,
                [c.page_content for c in chunks],
                template_content,
            )

            # Invoke LLM
            response = self.llm.invoke(messages)
            raw_text = response.content
            import re
            raw_text = re.sub(r'<think>.*?</think>', '', raw_text, flags=re.DOTALL).strip()

            # Parse JSON robustly
            raw_text = raw_text.strip()
            # Dùng regex tìm chuỗi JSON giữa { và } ngoài cùng
            match = re.search(r"(\{.*\})", raw_text, re.DOTALL)
            if match:
                clean_json_str = match.group(1).strip()
            else:
                clean_json_str = raw_text

            try:
                result = json.loads(clean_json_str, strict=False)
            except json.JSONDecodeError:
                # Fallback: remove markdown fence manually if regex missed it
                if clean_json_str.startswith("```"):
                    clean_json_str = re.sub(r"^```(?:json)?", "", clean_json_str)
                    clean_json_str = re.sub(r"```$", "", clean_json_str).strip()
                result = json.loads(clean_json_str, strict=False)

            # Validate 9 keys
            REQUIRED_KEYS = ["ten_co_quan", "quoc_hieu", "so_ky_hieu", "dia_danh_thoi_gian", "ten_loai", "trich_yeu", "noi_dung", "ky_ten", "noi_nhan"]
            missing_keys = [k for k in REQUIRED_KEYS if k not in result]
            if missing_keys:
                raise ValueError(f"Thiếu trường: {missing_keys}")

            result["sources"] = sources
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
