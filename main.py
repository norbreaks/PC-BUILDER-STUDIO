
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Annotated
from dotenv import load_dotenv
from auth_utils import get_current_user
load_dotenv()  # Load environment variables

# LangChain components for RAG


from langchain_community.llms import Ollama
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# --- Configuration ---
CHROMA_DB_PATH = "./pc_parts_vector_db_free"

OLLAMA_MODEL = "phi3:mini"  # Using the available model instead of llama3

# --- API Data Models (Pydantic) ---

class QueryRequest(BaseModel):
    """Defines the structure of the incoming user request."""
    question: str

class QueryResponse(BaseModel):
    """Defines the structure of the outgoing API response."""
    answer: str
    source_db: str = "ChromaDB (Local)"


# --- FastAPI Application & State Initialization ---
app = FastAPI(
    title="Local PC Builder RAG API",
    description="A free, local RAG service for PC parts compatibility and recommendations.",
)


# --- CORS Configuration ---
# Allow frontend at localhost:5173 to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global variable to hold the initialized RAG chain (loaded once)
RAG_CHAIN = None

def initialize_rag_chain():
    """Initializes and returns the complete RAG chain."""
    print("➡️ Initializing RAG components...")

    # 1. Load the FREE Embedding Model (Same as used for creation)
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )

    # 2. Load the Vector Database
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embeddings
    )
    # Retriever finds the top 4 most relevant documents (parts)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    print(f"✅ ChromaDB loaded from {CHROMA_DB_PATH}")

    # 3. Load the FREE Local LLM (Ollama)
    llm = Ollama(model=OLLAMA_MODEL)
    print(f"✅ Ollama LLM ({OLLAMA_MODEL}) connected")

    # 4. Define the System Prompt
    prompt_template = """
    You are an expert PC builder AI. Your task is to recommend a **complete and fully compatible** PC build based ONLY on the parts provided in the context below.
    You MUST adhere to the following rules:
    1.  **Compatibility:** Ensure the CPU socket (AM5, LGA1700, AM4), Motherboard socket, and RAM type (DDR4 or DDR5) **match**.
    2.  **Budget:** Adhere strictly to the user's requested budget.
    3.  **Output:** List the recommended parts, their prices, and the total cost. State explicitly if the build is compatible.

    CONTEXT:
    {context}

    USER REQUEST: {question}

    RECOMMENDATION:
    """
    RAG_PROMPT = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    # 5. Create the RAG Chain using LCEL
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    qa_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )
    print("✅ RAG Chain created successfully!")
    return qa_chain


@app.on_event("startup")
async def startup_event():
    """Runs once when the FastAPI server starts."""
    global RAG_CHAIN
    RAG_CHAIN = initialize_rag_chain()
    print("🔥 FastAPI server is ready to handle requests.")


@app.post("/ask", response_model=QueryResponse)
async def ask_question(
    request: QueryRequest,
    current_user: Annotated[Dict[str, Any], Depends(get_current_user)]
):
    """API endpoint to receive a user question and return a PC build recommendation."""

    if RAG_CHAIN is None:
        return QueryResponse(answer="RAG chain not initialized. Please check server logs.")

    try:
        # Now, only authenticated users can run RAG queries
        # You can log the query using current_user["user_id"]
        print(f"RAG query received from User ID: {current_user['user_id']}")

        # Invoke the RAG chain with the user's question
        result = RAG_CHAIN.invoke(request.question)

        # The result from LCEL chain is a string
        return QueryResponse(answer=result)

    except Exception as e:
        print(f"Error during RAG execution: {e}")
        # Add a clearer error message for Ollama connection issues
        if "Failed to connect to Ollama" in str(e):
            return QueryResponse(answer="Error: Could not connect to the local Ollama LLM. Please ensure 'ollama serve' is running in a separate terminal.")
        return QueryResponse(answer=f"An unexpected error occurred: {str(e)}")

# --- Root Endpoint (Optional check) ---

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PC Builder RAG API is running!"}

# --- NEW IMPORTS for modularity ---
from routers.auth import auth_router
from routers.parts import parts_router
from routers.builds import builds_router
from routers.users import router
from routers.payment import payment_router

# --- Register the Routers ---

# Authentication routes
app.include_router(auth_router, prefix="/auth")

# PC Parts Catalog routes
app.include_router(parts_router, prefix="/api/v1")

# PC Build/Cart routes
app.include_router(builds_router, prefix="/api/v1")

# User routes
app.include_router(router, prefix="/api/v1/users")

# Payment routes
app.include_router(payment_router, prefix="/payment")
