import threading
import logging
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from backend.config import Config

logger = logging.getLogger(__name__)

_store_instance = None
_lock = threading.Lock()


class ChromaVectorStore:
    def __init__(self):
        logger.info("[VectorStore] Khoi tao ChromaVectorStore singleton")
        self._embeddings = HuggingFaceEmbeddings(
            model_name=Config.EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        from chromadb.config import Settings
        
        self._db = Chroma(
            persist_directory=Config.CHROMA_PERSIST_DIR,
            embedding_function=self._embeddings,
            collection_name=Config.CHROMA_COLLECTION_NAME,
            client_settings=Settings(anonymized_telemetry=False)
        )

    def add_documents(self, documents: list[Document]) -> None:
        self._db.add_documents(documents)
        logger.info("[VectorStore] Da them %d documents", len(documents))

    def similarity_search(
        self,
        query: str,
        k: int = 5,
        filter_dict: dict = None,
    ) -> list[tuple[Document, float]]:
        kwargs = {"k": k}
        if filter_dict:
            kwargs["filter"] = filter_dict
        return self._db.similarity_search_with_score(query, **kwargs)

    def get_collection_count(self) -> int:
        return self._db._collection.count()


def get_vector_store() -> ChromaVectorStore:
    global _store_instance
    if _store_instance is None:
        with _lock:
            if _store_instance is None:
                _store_instance = ChromaVectorStore()
    return _store_instance
