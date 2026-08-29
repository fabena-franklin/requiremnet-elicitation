from backend import sanitize_final_spec


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
