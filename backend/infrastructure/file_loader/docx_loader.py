import logging
import os
from docx import Document as DocxDocument
from langchain_core.documents import Document

logger = logging.getLogger(__name__)


def load_docx(file_path: str) -> list[Document]:
    source = os.path.basename(file_path)
    doc = DocxDocument(file_path)
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    logger.info("[DOCX] %s: %d chars", source, len(text))
    return [Document(
        page_content=text,
        metadata={"source": source, "page": 1, "file_type": "docx"},
    )]
