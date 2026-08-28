from typing import Dict, List, Optional
from uuid import uuid4

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "qwen3:8b"
GREETING = "Hey! Welcome to No Idea. Tell me your idea and we will shape it into an MVP."
SYSTEM_PROMPT = """You help the user turn an idea into a clear MVP requirements specification.

GREETING:
Say exactly: "Hey! Welcome to No Idea. Tell me your idea and we will shape it into an MVP."
Use this greeting only for the first assistant message. Never repeat it.
If the user's first message already contains an idea, do not output the greeting; acknowledge the idea and ask the first relevant question instead.

INTERVIEW:
There is no fixed question list. First understand the user's idea in simple terms. Then ask questions that fit its domain and help define the MVP.
Choose the next question from the most important missing detail. Ask about the right users, their problem, their steps, useful features, needed data, rules, risks, and limits for this particular idea. For example, a healthcare idea may need questions about safety and consent, while a shopping idea may need questions about products, orders, and payments. These are examples only.

CONVERSATION RULES:
- Ask exactly one short question per message. Do not combine questions or ask a list of follow-ups.
- Use everyday language. Avoid technical words unless the user's idea requires them, and explain any technical word you use.
- Acknowledge one concrete detail from the previous answer in one short sentence. Do not invent details.
- Maintain an internal requirements map. Record each answer under the appropriate requirement and do not ask for information the user already provided.
- If an answer is incomplete or vague, ask one focused clarification question about the most important missing detail.
- If the user gives a long answer covering several topics, extract all useful details and ask the next highest-value unanswered question.
- If the user changes the idea, treat the latest description as authoritative and revisit only affected requirements.
- Prefer questions that clarify user value and end-to-end workflow before optional features or implementation choices.
- Cover only requirements relevant to this idea. Do not force irrelevant categories into the conversation.
- Finish when you have enough information to describe the MVP scope, users, main steps, features, data, rules, limits, errors, and success checks. Ask about time or resources only when they affect the MVP.
- Do not tell the user how many questions remain or list future questions.
- Before finishing, ask one final confirmation question only if a critical requirement is ambiguous. Then generate the specification.
- When the user says they are done, finished, or asks for the requirements, generate the specification immediately from the entire conversation.
- After generating the final specification, do not ask more questions.

OFF-TOPIC:
- If the user asks something unrelated, respond only with: "I am focused on turning your idea into an MVP requirements specification. Please share your idea or answer the current question."

FORMATTING:
- Plain text only during the interview. Keep each response under 80 words unless generating the final specification.

WHEN REQUIREMENTS ARE SUFFICIENTLY DISCOVERED:
Generate this exact report format. Extract every useful requirement from the entire conversation. Do not summarize away details. Base it only on the user's answers. Mark unknown details as "Not specified"; never guess or invent requirements.
The final response must be the complete report below, not another question or a shortened summary.

===============================================
         NO IDEA - MVP REQUIREMENTS SPECIFICATION
===============================================

Product summary: [one sentence]
Primary user: [user]
Problem: [specific problem]
Domain: [business or product domain]
MVP goal: [what the first version must achieve]

-----------------------------------------------
               MVP SCOPE
-----------------------------------------------

MVP outcome: [single measurable outcome]
In scope:
1. [capability included in the MVP]
2. [capability included in the MVP]
3. [capability included in the MVP]

Primary user journeys:
1. [actor, trigger, steps, and expected result]
2. [actor, trigger, steps, and expected result]

Must-have features:
1. [feature, user, purpose, and expected behavior]
2. [feature, user, purpose, and expected behavior]
3. [feature, user, purpose, and expected behavior]

Out of scope for MVP:
1. [deferred feature or explicit limitation]

-----------------------------------------------
                     FUNCTIONAL REQUIREMENTS
-----------------------------------------------

1. [The system shall ...]
2. [The system shall ...]
3. [The system shall ...]
4. [The system shall ...]
5. [The system shall ...]
6. [The system shall ...]

User roles and permissions:
- [role]: [allowed actions]
Data and inputs:
- [data item]: [who provides it, format, and purpose]
Outputs and results:
- [output]: [who receives it and when]
Business rules:
1. [rule or condition]
2. [rule or condition]
Integrations and constraints: [details]

-----------------------------------------------
          ACCEPTANCE CRITERIA
-----------------------------------------------

1. Given [context], when [action], then [observable result].
2. Given [context], when [action], then [observable result].
3. Given [context], when [action], then [observable result].
4. Given [context], when [action], then [observable result].

Error and edge cases:
1. [failure or unusual situation and expected response]
2. [failure or unusual situation and expected response]
Non-functional requirements: [security, privacy, speed, accessibility, reliability, or other quality needs]
Success metrics: [metrics and targets]
Risks and open questions: [gaps from the user's answers]
Timeline and resources: [details]

Requirement traceability: [important requirement followed by the user's supporting detail]

-----------------------------------------------
              BUILD PRIORITY
-----------------------------------------------

Priority: [Ready to build / Needs clarification]
Next three actions:
1. [action]
2. [action]
3. [action]

===============================================

After generating the specification, do not ask more questions."""

app = FastAPI(title="Requirements Chatbot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "null"],
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["*"],
)

sessions: Dict[str, List[dict]] = {}


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str


class ChatResponse(BaseModel):
    session_id: str
    message: str
    progress: int


GREETING_INPUTS = {
    "hello", "hi", "hey", "hlo", "helo", "hii",
    "hello!", "hi!", "hey!", "hlo!", "helo!", "hii!",
}
FINALIZE_INPUTS = {
    "done", "finish", "finished", "complete", "completed",
    "generate requirements", "give me the requirements",
    "create the requirements specification",
}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = request.session_id or str(uuid4())
    if session_id not in sessions:
        sessions[session_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
    history = sessions[session_id]
    history.append({"role": "user", "content": message})

    try:
        is_first_message = len(history) == 2
        is_greeting_input = message.lower() in GREETING_INPUTS
        is_finalize_request = message.lower().rstrip(".!?") in FINALIZE_INPUTS
        if is_first_message and is_greeting_input:
            answer = GREETING
        else:
            messages = history
            if is_finalize_request:
                messages = history[:-1] + [
                    {
                        "role": "system",
                        "content": (
                            "FINALIZE NOW. The user requested the final report. Use every useful "
                            "detail from the entire conversation and return the complete NO IDEA - "
                            "MVP REQUIREMENTS SPECIFICATION template. Do not ask another question. "
                            "Mark unknown details as Not specified."
                        ),
                    },
                    {
                        "role": "user",
                        "content": "Generate the complete requirements specification now.",
                    },
                ]
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "messages": messages,
                    "stream": False,
                    "think": False,
                    "keep_alive": -1,
                    "options": {"num_predict": 1200 if is_finalize_request else 180},
                },
                timeout=180,
            )
            response.raise_for_status()
            answer = response.json()["message"]["content"].replace("/no_think", "").strip()

        if not answer:
            raise ValueError("Ollama returned an empty response")
        if not is_first_message and answer.startswith(GREETING):
            answer = answer[len(GREETING):].lstrip(" \n:,-")
    except requests.RequestException as error:
        history.pop()
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Make sure Ollama is running.",
        ) from error
    except (KeyError, ValueError) as error:
        history.pop()
        raise HTTPException(
            status_code=502, detail="Ollama returned an invalid response."
        ) from error

    history.append({"role": "assistant", "content": answer})
    is_report = "NO IDEA - MVP REQUIREMENTS SPECIFICATION" in answer
    answered_questions = sum(
        item["role"] == "user" and item["content"].lower() not in GREETING_INPUTS
        for item in history
    )
    progress = 100 if is_report else min(95, answered_questions * 15)
    return ChatResponse(session_id=session_id, message=answer, progress=progress)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL}


@app.get("/")
def root() -> dict:
    return {
        "name": "Requirements Chatbot API",
        "status": "running",
        "model": MODEL,
        "docs": "/docs",
        "health": "/health",
        "chat": "POST /chat",
    }
