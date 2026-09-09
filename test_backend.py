from backend import is_false_off_topic_response, is_instruction_echo, sanitize_final_spec


def test_is_instruction_echo_detects_leaked_internal_rules():
    answer = (
        "Acknowledge one concrete detail from the previous answer. "
        "Maintain an internal requirements map and do not ask for information already provided."
    )

    assert is_instruction_echo(answer)


def test_is_instruction_echo_allows_normal_interview_response():
    assert not is_instruction_echo("Who is the main user of this application?")


def test_laptop_idea_is_not_rejected_as_off_topic():
    answer = (
        "I am focused on turning your idea into an MVP requirements specification. "
        "Please share your idea or answer the current question."
    )

    assert is_false_off_topic_response(answer, "I need to build a laptop")


def test_sanitize_final_spec_removes_headers_and_filler_words():
    raw = '''
    Product summary: A platform that helps users turn their ideas into an MVP.
    Primary user: Idea owners.
    Problem: They struggle to build or validate ideas.
    MVP goal: Provide a tool for users to collect requirements.
    
    In scope:
    1. Chatbot for collecting requirements
    2. Idea validation process
    
    The system shall capture idea inputs and generate requirements.
    '''

    cleaned = sanitize_final_spec(raw)

    assert "Product summary" not in cleaned
    assert "Primary user" not in cleaned
    assert "In scope" not in cleaned
    assert "The system shall" not in cleaned
    assert "idea inputs" in cleaned.lower()
    assert cleaned.strip().startswith("-") or cleaned.strip().startswith("*")
