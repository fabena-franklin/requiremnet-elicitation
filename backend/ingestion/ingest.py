from ingestion.pdf_loader import (
    find_all_pdfs,
    calculate_file_hash,
    extract_text_from_pdf
)

from ingestion.cleaner import clean_text
from ingestion.chunker import chunk_text
from ingestion.embedder import generate_embeddings

from ingestion.vector_store import (
    client,
    COLLECTION_NAME,
    create_collection,
    get_existing_document_hashes,
    delete_document,
    store_chunks
)


PAPERS_FOLDER = "knowledge_base/papers"
PROJECTS_FOLDER = "knowledge_base/projects"


def process_pdf(pdf_path, document_type):
    """
    Process one PDF:

    PDF
      ↓
    Extract
      ↓
    Clean
      ↓
    Chunk
      ↓
    Embed
      ↓
    Qdrant
    """

    print("\n========================================")
    print(f"Processing: {pdf_path}")
    print("========================================")

    # -------------------------------------------------
    # 1. Calculate current file hash
    # -------------------------------------------------

    file_hash = calculate_file_hash(
        str(pdf_path)
    )

    # -------------------------------------------------
    # 2. Check if this document already exists
    # -------------------------------------------------

    existing_hashes = get_existing_document_hashes()

    if file_hash in existing_hashes:

        print("SKIPPED - already indexed")

        return

    # -------------------------------------------------
    # 3. Extract text
    # -------------------------------------------------

    text = extract_text_from_pdf(
        str(pdf_path)
    )

    if not text.strip():

        print("SKIPPED - no text found")

        return

    # -------------------------------------------------
    # 4. Clean
    # -------------------------------------------------

    text = clean_text(text)

    # -------------------------------------------------
    # 5. Chunk
    # -------------------------------------------------

    chunks = chunk_text(text)

    print(
        f"Created {len(chunks)} chunks"
    )

    if not chunks:
        print("SKIPPED - no chunks created")
        return

    # -------------------------------------------------
    # 6. Generate embeddings
    # -------------------------------------------------

    embeddings = generate_embeddings(
        chunks
    )

    # -------------------------------------------------
    # 7. Metadata
    # -------------------------------------------------

    metadata = {
        "filename": pdf_path.name,
        "path": str(pdf_path),
        "file_hash": file_hash,
        "document_type": document_type
    }

    # -------------------------------------------------
    # 8. Store in Qdrant
    # -------------------------------------------------

    store_chunks(
        chunks,
        embeddings,
        metadata
    )

    print("SUCCESS - document indexed")


def main():

    print("\n")
    print("========================================")
    print("      NO IDEA KNOWLEDGE BASE")
    print("          INGESTION START")
    print("========================================")

    # -------------------------------------------------
    # Find PDFs
    # -------------------------------------------------

    papers = find_all_pdfs(
        PAPERS_FOLDER
    )

    projects = find_all_pdfs(
        PROJECTS_FOLDER
    )

    print(
        f"\nResearch papers found: {len(papers)}"
    )

    print(
        f"Project reports found: {len(projects)}"
    )

    # -------------------------------------------------
    # Determine embedding dimension
    # -------------------------------------------------

    test_embedding = generate_embeddings(
        ["test"]
    )[0]

    create_collection(
        len(test_embedding)
    )

    # -------------------------------------------------
    # Process research papers
    # -------------------------------------------------

    for pdf in papers:

        process_pdf(
            pdf,
            "research_paper"
        )

    # -------------------------------------------------
    # Process project reports
    # -------------------------------------------------

    for pdf in projects:

        process_pdf(
            pdf,
            "project_report"
        )

    print("\n")
    print("========================================")
    print("       INGESTION COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()
