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
from backend.infrastructure.vector_store.chroma import get_vector_store, reset_vector_store

logger = logging.getLogger(__name__)

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/raw"))

DOC_TYPE_KEYWORDS = {
    "nghi-quyet": ["nghi-quyet", "nghi_quyet", "nghiquyet", "nghi-quyet"],
    "cong-van": ["cong-van", "cong_van", "congvan"],
    "cong-dien": ["cong-dien", "cong_dien", "congdien"],
    "quyet-dinh": ["quyet-dinh", "quyet_dinh", "quyetdinh"],
    "van-ban-co-ten-loai": ["van-ban-co-ten-loai", "van_ban_co_ten_loai"],
    "giay-moi": ["giay-moi", "giay_moi", "giaymoi"],
    "giay-gioi-thieu": ["giay-gioi-thieu", "giay_gioi_thieu", "giaygioithieu"],
    "bien-ban": ["bien-ban", "bien_ban", "bienban"],
    "giay-nghi-phep": ["giay-nghi-phep", "giay_nghi_phep", "giaynghiphep"],
    "to-trinh": ["to-trinh", "to_trinh", "totrinh"],
    "bao-cao": ["bao-cao", "bao_cao", "baocao"],
    "ke-hoach": ["ke-hoach", "ke_hoach", "kehoach"],
    "thong-bao": ["thong-bao", "thong_bao", "thongbao"],
}


def detect_doc_type(filename: str) -> str:
    name = filename.lower()
    for doc_type, keywords in DOC_TYPE_KEYWORDS.items():
        if any(kw in name for kw in keywords):
            return doc_type
    return "general"


def _load_file(file_path: str, filename: str):
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return load_pdf(file_path)
    if ext in (".docx", ".doc"):
        return load_docx(file_path)
    if ext in (".txt", ".md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        from langchain_core.documents import Document
        return [Document(page_content=content, metadata={"source": filename})]
    raise ValueError(f"Định dạng không hỗ trợ: {ext}")


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
            docs = _load_file(file_path, filename)

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


def reindex_all_raw_documents(chunk_size: int = 1000, chunk_overlap: int = 200) -> dict:
    from backend.extensions import db
    from backend.models.rag_document import RagDocument

    os.makedirs(RAW_DIR, exist_ok=True)
    vector_store = reset_vector_store()
    supported_exts = {".pdf", ".doc", ".docx", ".txt", ".md"}

    indexed_files = 0
    total_chunks = 0
    errors = []

    for filename in sorted(os.listdir(RAW_DIR)):
        if filename.startswith("."):
            continue

        file_path = os.path.join(RAW_DIR, filename)
        if not os.path.isfile(file_path):
            continue

        ext = os.path.splitext(filename)[1].lower()
        if ext not in supported_exts:
            continue

        rag_doc = RagDocument.query.filter_by(filename=filename).first()
        if not rag_doc:
            rag_doc = RagDocument(
                filename=filename,
                file_type=ext.lstrip("."),
                category=detect_doc_type(filename),
                status="Đang xử lý",
                chunk_count=0,
            )
            db.session.add(rag_doc)
            db.session.flush()

        try:
            category = rag_doc.category or detect_doc_type(filename)
            docs = _load_file(file_path, filename)
            source = os.path.splitext(filename)[0]
            for doc in docs:
                doc.metadata["doc_type"] = category
                doc.metadata["source"] = source
                doc.metadata["filename"] = filename

            chunks = chunk_documents(docs, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            vector_store.add_documents(chunks)

            rag_doc.file_type = ext.lstrip(".")
            rag_doc.category = category
            rag_doc.status = "Đã index"
            rag_doc.chunk_count = len(chunks)
            rag_doc.updated_at = datetime.utcnow()
            indexed_files += 1
            total_chunks += len(chunks)
        except Exception as e:
            rag_doc.status = "Lỗi"
            rag_doc.updated_at = datetime.utcnow()
            errors.append({"filename": filename, "message": str(e)})

    db.session.commit()
    return {
        "indexed_files": indexed_files,
        "total_chunks": total_chunks,
        "errors": errors,
    }
