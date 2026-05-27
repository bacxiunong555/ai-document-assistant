import threading
import logging
from backend.config import Config

logger = logging.getLogger(__name__)

_llm_instance = None
_lock = threading.Lock()

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        with _lock:
            if _llm_instance is None:
                provider = Config.LLM_PROVIDER.lower()
                logger.info(f"[LLM] Provider: {provider}, Model: {Config.GEMINI_MODEL if provider == 'gemini' else Config.OLLAMA_MODEL}")
                
                if provider == "gemini":
                    from langchain_google_genai import ChatGoogleGenerativeAI
                    _llm_instance = ChatGoogleGenerativeAI(
                        model=Config.GEMINI_MODEL,
                        google_api_key=Config.GEMINI_API_KEY,
                        temperature=0.1
                    )
                else:
                    from langchain_ollama import ChatOllama
                    _llm_instance = ChatOllama(
                        base_url=Config.OLLAMA_BASE_URL,
                        model=Config.OLLAMA_MODEL,
                        temperature=0.1,
                        num_predict=2048
                    )
    return _llm_instance
