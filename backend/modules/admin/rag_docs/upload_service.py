"""
backend/modules/admin/upload_service.py
Xử lý: lưu file, chunking, embedding vào ChromaDB, cập nhật RagDocument DB.
"""
import os
import logging
import threading
from datetime import datetime

from backend.infrastructure.file_loader.pdf_loader import load_pdf
from backend.infrastructure.file_loader.docx_loader import load_docx
from backend.infrastructure.file_loader.chunker import chunk_documents
from backend.infrastructure.vector_store.chroma import get_vector_store

logger = logging.getLogger(__name__)

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/raw"))

DOC_TYPE_KEYWORDS = {
    "cong-van": ["cong-van", "cong_van", "congvan"],
    "quyet-dinh": ["quyet-dinh", "quyet_dinh", "quyetdinh"],
    "to-trinh": ["to-trinh", "to_trinh", "totrinh"],
    "bao-cao": ["bao-cao", "bao_cao", "baocao"],
    "ke-hoach": ["ke-hoach", "ke_hoach", "kehoach"],
}


def detect_doc_type(filename: str) -> str:
    name = filename.lower()
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        if any(kw in name for kw in keywords):
            return doc_type
    return "general"


def _ingest_file(
    file_path: str,
    filename: str,
    doc_id: int,
    category: str,
    chunk_size: int,
    chunk_overlap: int,
    flask_app,          # truyền app object vào thay vì import
):
    """Chạy trong background thread: load → chunk → embed → cập nhật DB."""
    from backend.extensions import db
    from backend.models.rag_document import RagDocument

    with flask_app.app_context():
        rag_doc = RagDocument.query.get(doc_id)
        try:
            ext = os.path.splitext(filename)[1].lower()
            if ext == ".pdf":
                docs = load_pdf(file_path)
            elif ext in (".docx", ".doc"):
                docs = load_docx(file_path)
            elif ext in (".txt", ".md"):
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                from langchain_core.documents import Document
                docs = [Document(page_content=content, metadata={"source": filename})]
            else:
                raise ValueError(f"Định dạng không hỗ trợ: {ext}")

            doc_type = category if category and category != "auto" else detect_doc_type(filename)
            source = os.path.splitext(filename)[0]
            for doc in docs:
                doc.metadata["doc_type"] = doc_type
                doc.metadata["source"] = source
                doc.metadata["filename"] = filename

            chunks = chunk_documents(docs, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            vector_store = get_vector_store()
            vector_store.add_documents(chunks)

            if rag_doc:
                rag_doc.status = "Đã index"
                rag_doc.chunk_count = len(chunks)
                rag_doc.updated_at = datetime.utcnow()
                db.session.commit()

            logger.info("[UploadService] %s: %d chunks đã index", filename, len(chunks))

        except Exception as e:
            logger.error("[UploadService] Lỗi khi xử lý %s: %s", filename, str(e))
            if rag_doc:
                rag_doc.status = "Lỗi"
                rag_doc.updated_at = datetime.utcnow()
                db.session.commit()


def process_upload(
    file_storage,
    category: str = "general",
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    uploaded_by: int = None,
) -> dict:
    """
    Nhận werkzeug FileStorage, lưu file, tạo DB record, spawn background thread.
    Trả về dict info ngay lập tức (không block request).
    """
    from backend.extensions import db
    from backend.models.rag_document import RagDocument

    os.makedirs(RAW_DIR, exist_ok=True)

    filename = file_storage.filename
    file_path = os.path.join(RAW_DIR, filename)
    file_storage.save(file_path)

    file_size = os.path.getsize(file_path)
    ext = os.path.splitext(filename)[1].lstrip(".").lower()

    rag_doc = RagDocument(
        filename=filename,
        file_type=ext,
        category=category if category else detect_doc_type(filename),
        status="Đang xử lý",
        chunk_count=0,
        uploaded_by=uploaded_by,
    )
    db.session.add(rag_doc)
    db.session.commit()

    # Lấy Flask app object từ context hiện tại để truyền vào thread
    from flask import current_app
    flask_app = current_app._get_current_object()

    # Chạy ingest trong thread riêng, không block API response
    t = threading.Thread(
        target=_ingest_file,
        args=(file_path, filename, rag_doc.id, category, chunk_size, chunk_overlap, flask_app),
        daemon=True,
    )
    t.start()

    return {
        "id": rag_doc.id,
        "filename": filename,
        "file_type": ext,
        "size_bytes": file_size,
        "category": rag_doc.category,
        "status": "Đang xử lý",
    }
