import threading
import logging
import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from backend.config import Config

logger = logging.getLogger(__name__)

_store_instance = None
_lock = threading.Lock()


def _resolve_embedding_model_path(model_name: str) -> str:
    if os.path.exists(model_name):
        return model_name

    cache_root = os.path.join(
        os.path.expanduser("~"),
        ".cache",
        "huggingface",
        "hub",
        f"models--sentence-transformers--{model_name}",
        "snapshots",
    )
    if os.path.isdir(cache_root):
        snapshots = [
            os.path.join(cache_root, name)
            for name in os.listdir(cache_root)
            if os.path.isdir(os.path.join(cache_root, name))
        ]
        if snapshots:
            snapshots.sort(key=lambda path: os.path.getmtime(path), reverse=True)
            return snapshots[0]

    return model_name


class ChromaVectorStore:
    def __init__(self):
        logger.info("[VectorStore] Khoi tao ChromaVectorStore singleton")
        embedding_model = _resolve_embedding_model_path(Config.EMBEDDING_MODEL)
        if embedding_model != Config.EMBEDDING_MODEL:
            logger.info("[VectorStore] Dung embedding model local: %s", embedding_model)

        self._embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        import chromadb
        from chromadb.config import Settings

        self._client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
        self._db = Chroma(
            client=self._client,
            embedding_function=self._embeddings,
            collection_name=Config.CHROMA_COLLECTION_NAME,
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


def reset_vector_store() -> ChromaVectorStore:
    global _store_instance
    with _lock:
        import chromadb
        from chromadb.config import Settings

        new_store = ChromaVectorStore()
        client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
        try:
            client.delete_collection(Config.CHROMA_COLLECTION_NAME)
            logger.info("[VectorStore] Da xoa collection %s", Config.CHROMA_COLLECTION_NAME)
        except Exception as e:
            logger.warning("[VectorStore] Khong the xoa collection %s: %s", Config.CHROMA_COLLECTION_NAME, e)
        _store_instance = ChromaVectorStore()
        return _store_instance
