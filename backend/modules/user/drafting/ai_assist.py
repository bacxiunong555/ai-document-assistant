from backend.modules.ai.rag_engine import get_rag_engine

def generate_draft(metadata: dict, template_content: str) -> dict:
    rag_engine = get_rag_engine()
    return rag_engine.generate(metadata, template_content)
