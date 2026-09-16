from sentence_transformers import SentenceTransformer


MODEL_NAME = "BAAI/bge-m3"

model = SentenceTransformer(MODEL_NAME)


def generate_embeddings(texts):

    embeddings = model.encode(
        texts,
        batch_size=16,
        show_progress_bar=True,
        normalize_embeddings=True
    )

    return embeddings