import os
import sys
import logging

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.infrastructure.file_loader.pdf_loader import load_pdf
from backend.infrastructure.file_loader.docx_loader import load_docx
from backend.infrastructure.file_loader.chunker import chunk_documents
from backend.infrastructure.vector_store.chroma import get_vector_store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = os.path.join(os.path.dirname(__file__), "../data/raw")

DOC_TYPE_KEYWORDS = {
    "cong-van": ["cong-van", "cong_van"],
    "quyet-dinh": ["quyet-dinh", "quyet_dinh"],
    "to-trinh": ["to-trinh", "to_trinh"],
    "bao-cao": ["bao-cao", "bao_cao"],
    "ke-hoach": ["ke-hoach", "ke_hoach"],
}


def detect_doc_type(filename: str) -> str:
    name = filename.lower()
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        if any(kw in name for kw in keywords):
            return doc_type
    return "general"


def ingest():
    raw_dir = os.path.abspath(RAW_DIR)
    if not os.path.exists(raw_dir):
        logger.error("[Ingest] Thu muc %s khong ton tai", raw_dir)
        return

    all_documents = []
    processed = 0

    for filename in os.listdir(raw_dir):
        file_path = os.path.join(raw_dir, filename)
        try:
            if filename.endswith(".pdf"):
                docs = load_pdf(file_path)
            elif filename.endswith(".docx") or filename.endswith(".doc"):
                docs = load_docx(file_path)
            else:
                continue

            doc_type = detect_doc_type(filename)
            source = os.path.splitext(filename)[0]
            for doc in docs:
                doc.metadata["doc_type"] = doc_type
                doc.metadata["source"] = source

            all_documents.extend(docs)
            processed += 1
            logger.info("[Ingest] Da xu ly: %s (doc_type=%s)", filename, doc_type)

        except Exception as e:
            logger.error("[Ingest] Loi khi xu ly %s: %s", filename, str(e))

    if not all_documents:
        logger.warning("[Ingest] Khong co document nao de nap")
        return

    chunks = chunk_documents(all_documents)
    vector_store = get_vector_store()
    vector_store.add_documents(chunks)

    total = vector_store.get_collection_count()
    logger.info("[Ingest] Hoan thanh: %d file | %d chunks | %d tong trong DB", processed, len(chunks), total)


if __name__ == "__main__":
    ingest()
