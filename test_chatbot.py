from langchain_community.llms import Ollama
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

# --- 1. Load Components (Must match the setup in step 2) ---

CHROMA_DB_PATH = "./pc_parts_vector_db_free"

# 1a. Load the FREE Embedding Model (Needed to load the Chroma DB)
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'}
)

# 1b. Load the Vector Database
vectorstore = Chroma(
    persist_directory=CHROMA_DB_PATH,
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 5}) # Retrieve top 5 most relevant documents

# 1c. Load the FREE Local LLM (Ollama)
# NOTE: Make sure Ollama is running and you pulled the 'llama3' model!
llm = Ollama(model="llama3")

# --- 2. Define the System Prompt (CRITICAL for compatibility) ---

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

RAG_PROMPT = PromptTemplate(
    template=prompt_template,
    input_variables=["context", "question"]
)

# --- 3. Create the RAG Chain ---

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff", # Stuffs all retrieved context into the prompt
    retriever=retriever,
    chain_type_kwargs={"prompt": RAG_PROMPT}
)

# --- 4. Test the Chatbot ---

user_query = "Recommend a mid-range gaming PC for around ₹80,000. It must handle 1440p gaming."

print(f"\n> USER: {user_query}")
print("\n--- AI IS PROCESSING (via Ollama) ---")

response = qa_chain.invoke(user_query)

print("\n--- AI RESPONSE ---")
print(response['result'])

# Example 2: Check for compatibility knowledge
user_query_2 = "What Motherboard should I pair with the Intel Core i9-14900K and G.Skill Trident Z5 RAM?"
print(f"\n> USER: {user_query_2}")
print("\n--- AI IS PROCESSING (via Ollama) ---")
response_2 = qa_chain.invoke(user_query_2)

print("\n--- AI RESPONSE ---")
print(response_2['result'])
