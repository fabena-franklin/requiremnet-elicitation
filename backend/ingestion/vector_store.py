from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)

import uuid


COLLECTION_NAME = "no_idea_knowledge"

VECTOR_DB_PATH = "knowledge_base/vector_db"


client = QdrantClient(
    path=VECTOR_DB_PATH
)


def create_collection(vector_size: int):
    """
    Create the Qdrant collection if it does not exist.
    """

    collections = client.get_collections()

    existing_collections = {
        collection.name
        for collection in collections.collections
    }

    if COLLECTION_NAME not in existing_collections:

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )

        print(f"Created collection: {COLLECTION_NAME}")


def get_existing_document_hashes():
    """
    Retrieve all document hashes already stored in Qdrant.
    """

    hashes = set()

    offset = None

    while True:

        points, offset = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=100,
            offset=offset,
            with_payload=True,
            with_vectors=False
        )

        for point in points:

            payload = point.payload or {}

            file_hash = payload.get("file_hash")

            if file_hash:
                hashes.add(file_hash)

        if offset is None:
            break

    return hashes


def delete_document(file_hash: str):
    """
    Delete every vector belonging to a document.
    """

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="file_hash",
                    match=MatchValue(value=file_hash)
                )
            ]
        )
    )

    print(f"Deleted old vectors: {file_hash}")


def store_chunks(
    chunks,
    embeddings,
    metadata
):
    """
    Store chunks, vectors and metadata in Qdrant.
    """

    points = []

    for index, (chunk, embedding) in enumerate(
        zip(chunks, embeddings)
    ):

        payload = {
            "text": chunk,
            "chunk_id": index,
            **metadata
        }

        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding.tolist(),
                payload=payload
            )
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    print(
        f"Stored {len(points)} vectors "
        f"for {metadata['filename']}"
    )


def get_document_hash_by_path(file_path: str):
    """
    Find the previously stored hash for a PDF path.
    """

    points, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        limit=1,
        scroll_filter=Filter(
            must=[
                FieldCondition(
                    key="path",
                    match=MatchValue(value=file_path)
                )
            ]
        ),
        with_payload=True,
        with_vectors=False
    )

    if not points:
        return None

    payload = points[0].payload or {}

    return payload.get("file_hash")
