def get_last_bot_response(messages):
    """
    Extract the most recent assistant/bot response.
    """

    for message in reversed(messages):
        if message.get("role") == "assistant":
            return message.get("content", "").strip()

    return None