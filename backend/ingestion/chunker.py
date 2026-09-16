from transformers import AutoTokenizer


TOKENIZER_NAME = "BAAI/bge-m3"

tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_NAME)


def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 100
):

    tokens = tokenizer.encode(
        text,
        add_special_tokens=False
    )

    chunks = []

    start = 0

    while start < len(tokens):

        end = start + chunk_size

        chunk_tokens = tokens[start:end]

        chunk_text_value = tokenizer.decode(
            chunk_tokens,
            skip_special_tokens=True
        )

        if chunk_text_value.strip():
            chunks.append(chunk_text_value.strip())

        start += chunk_size - overlap

    return chunks