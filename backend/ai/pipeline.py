from ai.final_response_extract import (
    extract_final_requirement_specification
)

from ai.preprocess import preprocess
from ai.tokenizer import tokenize


def process_final_requirement(answer: str):

    # 1. Check whether this response is the final specification
    final_spec = extract_final_requirement_specification(
        [
            {
                "role": "assistant",
                "content": answer
            }
        ]
    )

    if not final_spec:
        return None

    # 2. Preprocess
    cleaned_text = preprocess(final_spec)

    # 3. Tokenize
    tokenized = tokenize(cleaned_text)

    return {
        "final_requirement": final_spec,
        "preprocessed_text": cleaned_text,
        "tokens": tokenized["tokens"],
        "input_ids": tokenized["input_ids"],
        "attention_mask": tokenized["attention_mask"]
    }