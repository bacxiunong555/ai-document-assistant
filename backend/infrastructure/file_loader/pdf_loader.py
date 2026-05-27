import logging
import os
from pypdf import PdfReader
from langchain_core.documents import Document

logger = logging.getLogger(__name__)


def load_pdf(file_path: str) -> list[Document]:
    reader = PdfReader(file_path)
    source = os.path.basename(file_path)
    documents = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            documents.append(Document(
                page_content=text,
                metadata={"source": source, "page": i + 1, "file_type": "pdf"},
            ))
    logger.info("[PDF] %s: %d trang", source, len(documents))
    return documents
