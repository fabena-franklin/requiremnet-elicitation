# requiremnet-elicitation
First step towards building our No Idea Platform.
Its good communication which leads to good ideas

## Research checks

The chatbot can send its completed requirements specification to the companion
research-search-agent. Start that service on port 8000, then start this chatbot.
When a final specification is generated, the chatbot posts it to
`/v1/research` in `novelty` mode and displays the novelty assessment, related
papers, patent landscape, and source links in the conversation.

Configure the chatbot before starting its backend:

```powershell
$env:SEARCH_ENGINE_URL = "http://127.0.0.1:8000"
# Set this only if AGENT_API_KEY is configured in the search engine:
$env:SEARCH_ENGINE_API_KEY = "your-search-engine-api-key"
```

The research check is an automated screening aid, not proof of novelty or a
legal opinion. If the search service is unavailable, the requirements response
is still returned and the chat displays an explicit research-check error.
