import re


def preprocess(text: str) -> str:
    if not text:
        return ""

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove unnecessary spaces before punctuation
    text = re.sub(r"\s+([,:;.!?])", r"\1", text)

    return text.strip()