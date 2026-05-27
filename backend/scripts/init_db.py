# backend/scripts/init_db.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app import create_app
from backend.extensions import db
from backend.models.user import User
from backend.models.document import Document
from backend.models.template import Template

app = create_app()

with app.app_context():
    db.create_all()
    
    if not User.query.filter_by(id=1).first():
        from werkzeug.security import generate_password_hash
        admin = User(
            id=1,
            username="admin",
            password_hash=generate_password_hash("admin123"),
            role="Admin",
            full_name="Admin User"
        )
        db.session.add(admin)
        db.session.commit()
        print("Demo admin user created.")

    print("Database tables created successfully.")
