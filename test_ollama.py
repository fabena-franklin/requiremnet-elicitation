import requests

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:8b"


def ask_ollama(message):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": message
                }
            ],
            "stream": False
        }
    )

    response.raise_for_status()

    data = response.json()

    return data["message"]["content"]


while True:

    user_message = input("You: ")

    if user_message.lower() == "exit":
        break

    answer = ask_ollama(user_message)

    print("\nBot:", answer)