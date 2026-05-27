# backend/modules/workflow/workflow_service.py
import json
from backend.extensions import db
from backend.models.document import Document
from backend.models.workflow import WorkflowStep


class WorkflowService:
    STATUS_NORMALIZE = {
        "Đã duyệt": "da_duyet", "da_duyet": "da_duyet",
        "Chờ duyệt": "cho_duyet", "cho_duyet": "cho_duyet",
        "Yêu cầu sửa": "tu_choi", "yeu_cau_sua": "tu_choi",
        "Bị từ chối": "tu_choi", "tu_choi": "tu_choi",
        "Bản nháp": "ban_nhap", "ban_nhap": "ban_nhap",
    }

    @staticmethod
    def _parse_so_hieu(doc):
        try:
            if doc.content:
                c = json.loads(doc.content)
                if isinstance(c, dict):
                    return c.get("so_ky_hieu", "Chưa có")
        except Exception:
            pass
        return "Chưa có"

    @staticmethod
    def _get_current_step(doc):
        """Lấy bước hiện tại từ workflow_steps, nếu không có thì tạo mặc định."""
        steps = WorkflowStep.query.filter_by(document_id=doc.id).order_by(WorkflowStep.step_order).all()
        if not steps:
            return None, 0, 3, []
        
        current = None
        current_order = 0
        for s in steps:
            if s.status == "cho_duyet":
                current = s
                current_order = s.step_order
                break
        
        if not current and steps:
            current = steps[-1]
            current_order = current.step_order
            
        total = steps[0].total_steps if steps else 3
        return current, current_order, total, steps

    @staticmethod
    def get_workflow_documents(user_id, tab="cho_duyet"):
        """Lấy danh sách văn bản theo tab trạng thái."""
        query = Document.query.filter_by(author_id=user_id)
        
        if tab == "cho_duyet":
            query = query.filter(Document.status.in_(["Chờ duyệt", "cho_duyet"]))
        elif tab == "da_duyet":
            query = query.filter(Document.status.in_(["Đã duyệt", "da_duyet"]))
        elif tab == "tu_choi":
            query = query.filter(Document.status.in_(["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối", "tu_choi"]))
        
        docs = query.order_by(Document.created_at.desc()).all()
        
        result = []
        for doc in docs:
            so_hieu = WorkflowService._parse_so_hieu(doc)
            current_step, current_order, total_steps, steps = WorkflowService._get_current_step(doc)
            
            # Determine urgency from content
            is_khan = False
            try:
                if doc.content:
                    c = json.loads(doc.content)
                    if isinstance(c, dict):
                        do_khan = c.get("do_khan", "")
                        is_khan = do_khan in ["Khẩn", "khan", "Thượng khẩn", "Hỏa tốc"]
            except Exception:
                pass

            status = WorkflowService.STATUS_NORMALIZE.get(doc.status, "ban_nhap")

            item = {
                "id": doc.id,
                "so_hieu": so_hieu,
                "tieu_de": doc.title,
                "loai_van_ban": doc.doc_type,
                "trang_thai": status,
                "is_khan": is_khan,
                "ngay_gui": doc.created_at.strftime("%d/%m/%Y %H:%M"),
                "buoc_hien_tai": current_order if current_order else 1,
                "tong_buoc": total_steps,
                "nguoi_duyet": current_step.approver_name if current_step else "Chưa phân công",
                "chuc_vu_duyet": current_step.approver_role if current_step else "",
            }
            result.append(item)
            
        return result

    @staticmethod
    def get_tab_counts(user_id):
        """Đếm số văn bản theo từng tab."""
        cho_duyet = Document.query.filter_by(author_id=user_id).filter(
            Document.status.in_(["Chờ duyệt", "cho_duyet"])
        ).count()
        
        da_duyet = Document.query.filter_by(author_id=user_id).filter(
            Document.status.in_(["Đã duyệt", "da_duyet"])
        ).count()
        
        tu_choi = Document.query.filter_by(author_id=user_id).filter(
            Document.status.in_(["Yêu cầu sửa", "yeu_cau_sua", "Bị từ chối", "tu_choi"])
        ).count()
        
        return {
            "cho_duyet": cho_duyet,
            "da_duyet": da_duyet,
            "tu_choi": tu_choi
        }

    @staticmethod
    def get_approval_detail(user_id, doc_id):
        """Lấy chi tiết quy trình phê duyệt của 1 văn bản."""
        doc = Document.query.filter_by(id=doc_id, author_id=user_id).first()
        if not doc:
            raise Exception("Không tìm thấy văn bản")
        
        steps = WorkflowStep.query.filter_by(document_id=doc_id).order_by(WorkflowStep.step_order).all()
        
        so_hieu = WorkflowService._parse_so_hieu(doc)
        status = WorkflowService.STATUS_NORMALIZE.get(doc.status, "ban_nhap")
        
        step_list = []
        for s in steps:
            step_list.append({
                "id": s.id,
                "buoc": s.step_order,
                "tong_buoc": s.total_steps,
                "nguoi_duyet": s.approver_name,
                "chuc_vu": s.approver_role,
                "trang_thai": s.status,
                "ghi_chu": s.note or "",
                "ngay_cap_nhat": s.updated_at.strftime("%d/%m/%Y %H:%M") if s.updated_at else ""
            })
        
        return {
            "id": doc.id,
            "so_hieu": so_hieu,
            "tieu_de": doc.title,
            "loai_van_ban": doc.doc_type,
            "trang_thai": status,
            "ngay_gui": doc.created_at.strftime("%d/%m/%Y %H:%M"),
            "cac_buoc": step_list
        }

    @staticmethod
    def submit_for_approval(user_id, doc_id):
        """Gửi văn bản đi duyệt - tạo workflow steps mặc định."""
        doc = Document.query.filter_by(id=doc_id, author_id=user_id).first()
        if not doc:
            raise Exception("Không tìm thấy văn bản")
        
        # Xóa steps cũ nếu có
        WorkflowStep.query.filter_by(document_id=doc_id).delete()
        
        # Tạo 3 bước mặc định
        default_approvers = [
            ("Trần Minh Đức", "Trưởng phòng Tổng hợp"),
            ("Nguyễn Thị Hương", "Phó Giám đốc"),
            ("Lê Văn Nam", "Giám đốc"),
        ]
        
        for i, (name, role) in enumerate(default_approvers, 1):
            step = WorkflowStep(
                document_id=doc_id,
                step_order=i,
                total_steps=3,
                approver_name=name,
                approver_role=role,
                status="cho_duyet" if i == 1 else "cho_duyet"
            )
            db.session.add(step)
        
        doc.status = "cho_duyet"
        db.session.commit()
        return True
