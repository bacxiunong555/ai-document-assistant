from flask import Blueprint, jsonify, request
import os

admin_rag_docs_bp = Blueprint("admin_rag_docs", __name__, url_prefix="/api/admin")

@admin_rag_docs_bp.route("/rag-documents", methods=["GET"])
def get_rag_documents():
    from backend.models.rag_document import RagDocument
    from backend.extensions import db
    
    # Lấy từ thư mục raw
    raw_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../backend/data/raw"))
    raw_files = []
    if os.path.exists(raw_dir):
        raw_files = os.listdir(raw_dir)
        
    # Cập nhật DB (tạo bản ghi ảo cho file raw chưa có trong DB)
    for f in raw_files:
        if f.startswith("."): continue
        existing = RagDocument.query.filter_by(filename=f).first()
        if not existing:
            doc = RagDocument(
                filename=f,
                file_type=f.split('.')[-1] if '.' in f else "unknown",
                category="general",
                status="Đã index", # Mặc định file đã có là đã index
                chunk_count=10 # giả lập
            )
            db.session.add(doc)
    db.session.commit()
    
    # Lấy danh sách từ DB
    docs = RagDocument.query.order_by(RagDocument.created_at.desc()).all()
    
    data = []
    for d in docs:
        data.append({
            "id": d.id,
            "filename": d.filename,
            "fileType": d.file_type,
            "category": d.category,
            "status": d.status,
            "chunkCount": d.chunk_count,
            "createdAt": d.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    return jsonify({"success": True, "data": data, "total": len(data)})

@admin_rag_docs_bp.route("/rag-stats", methods=["GET"])
def get_rag_stats():
    from backend.models.rag_document import RagDocument
    docs = RagDocument.query.all()
    total = len(docs)
    indexed = len([d for d in docs if d.status == "Đã index"])
    processing = len([d for d in docs if d.status == "Đang xử lý"])
    error = len([d for d in docs if d.status == "Lỗi"])
    chunks = sum([d.chunk_count or 0 for d in docs])
    
    return jsonify({
        "success": True,
        "data": {
            "totalDocs": total,
            "indexedDocs": indexed,
            "processingDocs": processing,
            "errorDocs": error,
            "totalChunks": chunks
        }
    })

@admin_rag_docs_bp.route("/upload-history", methods=["GET"])
def get_upload_history():
    from backend.models.rag_document import RagDocument
    docs = RagDocument.query.order_by(RagDocument.created_at.desc()).limit(20).all()
    data = []
    for d in docs:
        data.append({
            "id": d.id,
            "filename": d.filename,
            "fileType": d.file_type,
            "category": d.category,
            "status": d.status,
            "chunkCount": d.chunk_count,
            "createdAt": d.created_at.strftime("%d/%m/%Y %H:%M") if d.created_at else "",
        })
    return jsonify({"success": True, "data": data})

@admin_rag_docs_bp.route("/upload", methods=["POST"])
def upload_document():
    from flask_jwt_extended import jwt_required, get_jwt_identity
    from backend.modules.admin.rag_docs.upload_service import process_upload

    if "files" not in request.files:
        return jsonify({"success": False, "message": "Không có file nào được gửi"}), 400

    files = request.files.getlist("files")
    if not files or all(f.filename == "" for f in files):
        return jsonify({"success": False, "message": "Danh sách file trống"}), 400

    category = request.form.get("category", "general")
    chunk_size = int(request.form.get("chunk_size", 1000))
    chunk_overlap = int(request.form.get("chunk_overlap", 200))

    # Clamp values
    chunk_size = max(500, min(chunk_size, 4000))
    chunk_overlap = max(0, min(chunk_overlap, chunk_size // 2))

    ALLOWED_EXTS = {".pdf", ".doc", ".docx", ".txt", ".md"}
    results = []
    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in ALLOWED_EXTS:
            results.append({"filename": f.filename, "status": "error", "message": "Định dạng không hỗ trợ"})
            continue
        if f.content_length and f.content_length > 50 * 1024 * 1024:
            results.append({"filename": f.filename, "status": "error", "message": "File vượt quá 50MB"})
            continue
        try:
            info = process_upload(
                file_storage=f,
                category=category,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
            results.append({**info, "status": "queued"})
        except Exception as e:
            results.append({"filename": f.filename, "status": "error", "message": str(e)})

    return jsonify({"success": True, "data": results, "message": f"Đã nhận {len(results)} file, đang xử lý ngầm"})
