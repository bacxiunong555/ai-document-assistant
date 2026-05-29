# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "rag-document-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 8

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "rag_document_db")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Ollama
    OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'qwen2.5:7b-instruct')

    # Gemini
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'ollama')  # 'ollama' hoặc 'gemini'
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

    # ChromaDB
    CHROMA_PERSIST_DIR = os.getenv('CHROMA_PERSIST_DIR', 'backend/data/chroma_db')
    CHROMA_COLLECTION_NAME = 'phap_luat_hanh_chinh'

    # Embedding
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2')

    # RAG
    RAG_TOP_K = 5
    RAG_SIMILARITY_THRESHOLD = 0.75
    RAG_MAX_CHUNKS = 3

    # LLM
    LLM_TEMPERATURE = 0.1
    LLM_NUM_PREDICT = int(os.getenv("LLM_NUM_PREDICT", "2048"))
