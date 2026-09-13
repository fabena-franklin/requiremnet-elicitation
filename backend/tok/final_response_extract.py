def extract_final_requirement_specification(messages):
    """
    Extract the final Requirements Specification from
    the conversation history.

    Searches from the newest message backwards and
    returns the latest assistant message that contains
    the complete requirements specification.
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

        # A final specification should contain most sections
        if matched_sections >= 7:
            return response

    return None