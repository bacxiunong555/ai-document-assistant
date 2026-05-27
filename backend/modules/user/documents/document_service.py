# backend/modules/documents/document_service.py
from backend.extensions import db
from backend.models.document import Document

class DocumentService:
    @staticmethod
    def create_document(data, user_id):
        # Chuẩn hóa status
        status = data.get("status", "ban_nhap")
        if status in ["Bản nháp", "ban_nhap"]: status = "ban_nhap"
        elif status in ["Chờ duyệt", "cho_duyet"]: status = "cho_duyet"
        elif status in ["Đã duyệt", "da_duyet"]: status = "da_duyet"
        elif status in ["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối"]: status = "yeu_cau_sua"
        
        new_doc = Document(
            title=data.get("title"),
            content=data.get("content"),
            doc_type=data.get("doc_type"),
            status=status,
            author_id=user_id
        )
        db.session.add(new_doc)
        db.session.commit()
        return new_doc

    @staticmethod
    def get_all_documents(user_id):
        return Document.query.filter_by(author_id=user_id).all()

    @staticmethod
    def get_document_by_id(doc_id, user_id):
        import json
        doc = Document.query.filter_by(id=doc_id).first()
        if not doc:
            return None
        if doc.author_id != user_id:
            raise PermissionError("Bạn không có quyền xem văn bản này")
            
        so_hieu = "Chưa có"
        nguoi_soan = "Chưa rõ"
        phong_ban = "Phòng Tổng hợp"
        document_data = {}
        
        try:
            if doc.content:
                document_data = json.loads(doc.content)
                if isinstance(document_data, dict):
                    so_hieu = document_data.get("so_ky_hieu", "Chưa có")
                    ky_ten = document_data.get("ky_ten", {})
                    if isinstance(ky_ten, dict) and ky_ten.get("ho_ten"):
                        nguoi_soan = ky_ten.get("ho_ten")
        except:
            pass
            
        status = doc.status
        if status not in ["da_duyet", "cho_duyet", "yeu_cau_sua", "ban_nhap"]:
            if status in ["Bản nháp", "ban_nhap"]: status = "ban_nhap"
            elif status in ["Chờ duyệt", "cho_duyet"]: status = "cho_duyet"
            elif status in ["Đã duyệt", "da_duyet"]: status = "da_duyet"
            elif status in ["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối"]: status = "yeu_cau_sua"
            else: status = "ban_nhap"

        return {
            "id": doc.id,
            "so_hieu": so_hieu,
            "tieu_de": doc.title,
            "loai_van_ban": doc.doc_type,
            "trang_thai": status,
            "ngay_tao": doc.created_at.strftime("%d/%m/%Y"),
            "nguoi_soan": nguoi_soan,
            "phong_ban": phong_ban,
            "document_data": document_data
        }

    @staticmethod
    def update_document(doc_id, data, user_id):
        doc = Document.query.filter_by(id=doc_id, author_id=user_id).first()
        if not doc:
            raise Exception("Không tìm thấy văn bản hoặc không có quyền truy cập")
        
        status = data.get("status", doc.status)
        if status in ["Bản nháp", "ban_nhap"]: status = "ban_nhap"
        elif status in ["Chờ duyệt", "cho_duyet"]: status = "cho_duyet"
        elif status in ["Đã duyệt", "da_duyet"]: status = "da_duyet"
        elif status in ["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối"]: status = "yeu_cau_sua"

        doc.title = data.get("title", doc.title)
        doc.content = data.get("content", doc.content)
        doc.doc_type = data.get("doc_type", doc.doc_type)
        doc.status = status
        
        db.session.commit()
        return doc

    @staticmethod
    def delete_document(doc_id, user_id):
        doc = Document.query.filter_by(id=doc_id, author_id=user_id).first()
        if not doc:
            raise Exception("Không tìm thấy văn bản hoặc không có quyền truy cập")
        
        db.session.delete(doc)
        db.session.commit()
        return True

    @staticmethod
    def search_documents(user_id, q, loai, trang_thai, page, limit):
        import json
        query = Document.query.filter_by(author_id=user_id)
        
        if q:
            search_term = f"%{q}%"
            query = query.filter(db.or_(
                Document.title.ilike(search_term),
                Document.content.ilike(search_term)
            ))
            
        if loai:
            query = query.filter(Document.doc_type == loai)
            
        if trang_thai:
            # handle status map
            status_map = {
                "da_duyet": ["da_duyet", "Đã duyệt"],
                "cho_duyet": ["cho_duyet", "Chờ duyệt"],
                "yeu_cau_sua": ["yeu_cau_sua", "Yêu cầu sửa", "Bị từ chối"],
                "ban_nhap": ["ban_nhap", "Bản nháp"]
            }
            mapped_statuses = status_map.get(trang_thai, [trang_thai])
            query = query.filter(Document.status.in_(mapped_statuses))
            
        total = query.count()
        docs = query.order_by(Document.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        items = []
        for d in docs:
            so_hieu = "Chưa có"
            nguoi_soan = "Chưa rõ"
            phong_ban = "Phòng Tổng hợp" # Default
            try:
                if d.content:
                    content_json = json.loads(d.content)
                    if isinstance(content_json, dict):
                        so_hieu = content_json.get("so_ky_hieu", "Chưa có")
                        ky_ten = content_json.get("ky_ten", {})
                        if isinstance(ky_ten, dict) and ky_ten.get("ho_ten"):
                            nguoi_soan = ky_ten.get("ho_ten")
            except:
                pass
                
            status = d.status
            if status not in ["da_duyet", "cho_duyet", "yeu_cau_sua", "ban_nhap"]:
                if status in ["Bản nháp", "ban_nhap"]: status = "ban_nhap"
                elif status in ["Chờ duyệt", "cho_duyet"]: status = "cho_duyet"
                elif status in ["Đã duyệt", "da_duyet"]: status = "da_duyet"
                elif status in ["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối"]: status = "yeu_cau_sua"
                else: status = "ban_nhap"

            items.append({
                "id": d.id,
                "so_hieu": so_hieu,
                "tieu_de": d.title,
                "nguoi_soan": nguoi_soan,
                "phong_ban": phong_ban,
                "loai_van_ban": d.doc_type,
                "trang_thai": status,
                "ngay_tao": d.created_at.strftime("%d/%m/%Y")
            })
            
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": items
        }

    @staticmethod
    def get_filter_options(user_id):
        docs = Document.query.filter_by(author_id=user_id).all()
        loai_van_ban = list(set(d.doc_type for d in docs if d.doc_type))
        trang_thai = ["da_duyet", "cho_duyet", "yeu_cau_sua", "ban_nhap"]
        return {
            "loai_van_ban": loai_van_ban,
            "trang_thai": trang_thai
        }
