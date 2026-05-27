# backend/modules/drafting/template_service.py
from backend.models.template import Template

class TemplateService:
    @staticmethod
    def get_all_templates():
        return Template.query.all()

    @staticmethod
    def get_template_by_id(template_id):
        return Template.query.get(template_id)
