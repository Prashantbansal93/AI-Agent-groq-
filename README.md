# AI Agent with Tool Calling

A small AI agent built to understand and demonstrate how LLMs use tools to perform real actions — not just generate text. Built as a learning project to explore agentic AI development, function calling, and how AI-native applications are structured.

## What it does

This agent takes a user's question through a simple web UI, and the LLM (via Groq's API, running Llama 3.3) decides whether it needs a tool to answer:

- **Calculator tool** — solves math expressions
- **Save Note tool** — saves a short text note for later reference

The model can choose one tool, multiple tools, or no tool at all, depending on the question.

## How it works (the core loop)

1. User sends a message through the web UI
2. The message is sent to the LLM along with a list of available tools (name, description, expected parameters)
3. If the model decides a tool is needed, it returns a `tool_call` — specifying which tool and what arguments to use
4. The backend (Node.js/Express) actually executes the corresponding JavaScript function
5. The tool's result is sent back to the model as a `tool` message
6. The model uses that result to generate a final, human-readable answer, which is sent back to the UI

This is the same underlying pattern used in modern agentic AI systems — the model reasons and decides, while the application executes and validates.

## Tech stack

- **Node.js + Express** — backend server
- **Groq API** (Llama 3.3 70B) — LLM with tool-calling support
- **Vanilla HTML/CSS/JS** — simple frontend UI
- **dotenv** — environment variable management for API key security

## Project structure

ai-project/
├── server.js # Express server + agent logic + tool definitions
├── public/
│ └── index.html # Simple chat UI
├── .env # API key (not committed)
├── .gitignore
└── package.json


## Running it locally

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with:

GROQ_API_KEY=your-key-here

4. Run `npm run dev` (or `npm start`)
5. Open `http://localhost:3000` in your browser

## What I learned building this

- How to call an LLM API and structure tool definitions (name, description, JSON schema for parameters)
- The full tool-calling loop: model decides → app executes → result returned → model responds
- How an agent can choose between multiple tools based on a single natural-language request
- The difference between using a pre-trained model vs. training one — this project uses Groq's hosted Llama model as-is, with no fine-tuning

## What I'd add next

- **MCP (Model Context Protocol)** — wrap these tools as an MCP server so they're usable by any MCP-compatible client, not just this app
- **RAG (Retrieval-Augmented Generation)** — let the agent pull in external data/documents to answer questions beyond its training knowledge
- More robust error handling for failed or malformed tool calls
- Persistent storage (database) for saved notes instead of an in-memory array
