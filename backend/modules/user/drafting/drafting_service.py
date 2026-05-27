from backend.models.template import Template
from backend.core.exceptions import ValidationError, NotFoundError

VALID_DOC_TYPES = ["cong-van", "quyet-dinh", "to-trinh", "bao-cao", "ke-hoach", "thong-bao", "bien-ban"]


def validate_drafting_request(data: dict) -> dict:
    doc_type = (data.get("doc_type") or "").strip()
    if not doc_type:
        raise ValidationError("doc_type la bat buoc")
    if doc_type not in VALID_DOC_TYPES:
        raise ValidationError(f"doc_type khong hop le. Cho phep: {VALID_DOC_TYPES}")

    metadata = data.get("metadata")
    if not isinstance(metadata, dict):
        raise ValidationError("metadata phai la object")

    for field in ["trich_yeu", "co_quan_ban_hanh", "nguoi_ky", "ngay_thang"]:
        val = (metadata.get(field) or "").strip()
        if not val:
            raise ValidationError(f"metadata.{field} la bat buoc")
        metadata[field] = val

    if "trich_yeu" in metadata and len(metadata["trich_yeu"]) < 5:
        raise ValidationError("trich_yeu phai co it nhat 5 ky tu")

    metadata["doc_type"] = doc_type

    for key in ["so_hieu", "chuc_vu_nguoi_ky", "yeu_cau_them"]:
        if key in metadata and isinstance(metadata[key], str):
            metadata[key] = metadata[key].strip()

    data["doc_type"] = doc_type
    data["metadata"] = metadata
    return data


def get_template_content(template_id: int = None, doc_type: str = None) -> str:
    if template_id:
        tmpl = Template.query.get(template_id)
        if not tmpl:
            raise NotFoundError(f"Template id={template_id} khong ton tai")
        return tmpl.content or ""

    if doc_type:
        tmpl = Template.query.filter_by(doc_type=doc_type).first()
        if tmpl:
            return tmpl.content or ""

    return ""


def create_draft(data: dict, user_id: int):
    data = validate_drafting_request(data)
    template_content = get_template_content(
        template_id=data.get("template_id"),
        doc_type=data["doc_type"],
    )
    data["metadata"]["user_id"] = user_id
    from backend.modules.user.drafting.ai_assist import generate_draft
    return generate_draft(data["metadata"], template_content)
