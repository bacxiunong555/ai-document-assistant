import threading
import logging
import requests
from backend.config import Config

logger = logging.getLogger(__name__)

_llm_instance = None
_lock = threading.Lock()


class OllamaChatClient:
    def __init__(self, base_url: str, model: str, temperature: float = 0.1, num_predict: int = 2048):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.temperature = temperature
        self.num_predict = num_predict

    def _normalize_messages(self, messages):
        normalized = []
        for message in messages:
            if isinstance(message, dict):
                normalized.append(message)
                continue

            role = getattr(message, "type", "user")
            if role == "human":
                role = "user"
            elif role == "ai":
                role = "assistant"
            elif role not in {"system", "user", "assistant"}:
                role = "user"

            normalized.append({
                "role": role,
                "content": getattr(message, "content", str(message)),
            })
        return normalized

    def invoke(self, messages):
        payload = {
            "model": self.model,
            "messages": self._normalize_messages(messages),
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_predict": self.num_predict,
            },
        }
        response = requests.post(
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=600,
        )
        response.raise_for_status()
        data = response.json()

        class ChatResponse:
            def __init__(self, content: str):
                self.content = content

        return ChatResponse(data.get("message", {}).get("content", ""))


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
                    _llm_instance = OllamaChatClient(
                        base_url=Config.OLLAMA_BASE_URL,
                        model=Config.OLLAMA_MODEL,
                        temperature=0.1,
                        num_predict=Config.LLM_NUM_PREDICT,
                    )
    return _llm_instance
