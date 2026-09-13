def extract_final_requirement_specification(messages):
    """
    Extract the latest complete requirement specification
    from the chatbot conversation.
    """

    required_sections = [
        "User need:",
        "Problem:",
        "Target users:",
        "Core functionality:",
        "Core resources:",
        "Core constraints:",
        "Core interactions:",
        "Core outcomes:",
    ]

    # Search from the END of the conversation
    for message in reversed(messages):

        if message.get("role") != "assistant":
            continue

        response = message.get("content", "").strip()

        if not response:
            continue

        response_lower = response.lower()

        # Count how many requirement sections exist
        matched_sections = sum(
            section.lower() in response_lower
            for section in required_sections
        )

        # Your final specification contains all 8 sections
        if matched_sections >= 7:
            return response

    return None