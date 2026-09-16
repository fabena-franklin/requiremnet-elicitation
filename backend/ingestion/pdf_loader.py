from pathlib import Path
import hashlib
import fitz


def find_all_pdfs(folder: str):
    """
    Find every PDF inside the folder and its subfolders.
    """

    return list(Path(folder).rglob("*.pdf"))


def calculate_file_hash(pdf_path: str) -> str:
    """
    Calculate SHA-256 hash of the entire PDF.

    If the PDF changes, its hash will also change.
    """

    sha256 = hashlib.sha256()

    with open(pdf_path, "rb") as file:
        while True:
            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from every page of the PDF.
    """

    text_parts = []

    document = fitz.open(pdf_path)

    for page in document:
        text = page.get_text("text")

        if text:
            text_parts.append(text)

    document.close()

    return "\n".join(text_parts)


def get_pdf_info(pdf_path: str):
    """
    Get metadata about a PDF.
    """

    path = Path(pdf_path)

    return {
        "filename": path.name,
        "path": str(path),
        "hash": calculate_file_hash(str(path)),
        "size": path.stat().st_size
    }