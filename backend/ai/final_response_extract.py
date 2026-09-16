def extract_final_requirement_specification(messages):
    """
    Find the latest finalized requirement specification
    from the conversation history.
    """

    required_sections = [
        "User need:",
        "Problem:",
        "Target users:",
        "Core functionality:",
        "Inputs:",
        "Outputs:",
        "Constraints:",
        "Functional requirements:",
        "Non-functional requirements:",
        "Success criteria:",
    ]

    # Search from newest message to oldest
    for message in reversed(messages):

        if message.get("role") != "assistant":
            continue

        response = message.get("content", "").strip()

        if not response:
            continue

        response_lower = response.lower()

        matched_sections = sum(
            section.lower() in response_lower
            for section in required_sections
        )

        # Your finalized specification contains these sections
        if matched_sections >= 8:
            return response

    return None