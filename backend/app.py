# backend/app.py
from flask import Flask
from backend.config import Config
from backend.extensions import db, jwt, cors
from backend.modules.auth.auth_api import auth_bp
from backend.modules.user.documents.document_api import document_bp
from backend.modules.user.drafting.template_api import template_bp
from backend.modules.user.drafting.drafting_api import drafting_bp
from backend.modules.user.dashboard.dashboard_api import dashboard_bp
from backend.modules.user.export.export_api import export_bp
from backend.modules.user.workflow.workflow_api import workflow_bp

# Import models to ensure they are registered
from backend.models.user import User
from backend.models.document import Document
from backend.models.template import Template
from backend.models.workflow import WorkflowStep
from backend.models.rag_document import RagDocument

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(document_bp)
    app.register_blueprint(template_bp)
    app.register_blueprint(drafting_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(workflow_bp)
    
    from backend.modules.admin.dashboard.dashboard_api import admin_dashboard_bp
    from backend.modules.admin.system.system_api import admin_system_bp
    from backend.modules.admin.rag_docs.rag_docs_api import admin_rag_docs_bp
    from backend.modules.admin.users.users_api import admin_users_bp
    
    app.register_blueprint(admin_dashboard_bp)
    app.register_blueprint(admin_system_bp)
    app.register_blueprint(admin_rag_docs_bp)
    app.register_blueprint(admin_users_bp)
    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
