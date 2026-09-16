from transformers import AutoTokenizer


MODEL_NAME = "facebook/bart-large-mnli"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)


def tokenize(text: str):
    result = tokenizer(
        text,
        add_special_tokens=True,
        return_attention_mask=True
    )

    return {
        "tokens": tokenizer.convert_ids_to_tokens(
            result["input_ids"]
        ),
        "input_ids": result["input_ids"],
        "attention_mask": result["attention_mask"]
    }