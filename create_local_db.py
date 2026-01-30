import json
import re
from typing import List, Dict, Any
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# --- 1. Load the Data (Your JSON Input) ---
# Load the JSON data from database.json
with open('../project_A/database.json', 'r') as f:
    pc_parts_data = json.load(f)

# --- 2. Define the Parsing Logic (Same as before) ---

def parse_specs_and_create_documents(data: List[Dict[str, Any]]) -> List[Document]:
    """Parses structured data and creates LangChain Document objects."""
    documents = []

    def extract_spec(pattern, text):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else None

    for item in data:
        metadata = {
            "category": item["category"],
            "name": item["name"],
            "price": item["price"].replace("₹", "").replace(",", ""),
            # Extracting critical compatibility specs
            "socket": extract_spec(r'(AM5|AM4|LGA1700)', item["specs"]),
            "memory_type": extract_spec(r'(DDR4|DDR5)', item["specs"]),
            "wattage": extract_spec(r'(\d+W)', item["specs"] + item["category"]),
        }

        # This is the text the model will read for context
        content = (
            f"PC Part: {item['name']}. Category: {item['category']}. "
            f"Price: {item['price']}. Detailed Specs: {item['specs']}. "
            f"COMPATIBILITY HINT: This is a {metadata.get('socket', 'N/A')} socket part and uses {metadata.get('memory_type', 'N/A')} RAM."
        )

        documents.append(
            Document(
                page_content=content,
                metadata={k: v for k, v in metadata.items() if v is not None}
            )
        )
    return documents

# --- 3. Setup Embedding Model and Vector Store (The FREE part) ---

print("Initializing local Hugging Face Embedding model...")
# Downloads the 'all-MiniLM-L6-v2' model the first time this script is run.
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    # Setting model_kwargs to run on CPU is usually the best default for free models
    model_kwargs={'device': 'cpu'}
)

CHROMA_DB_PATH = "./pc_parts_vector_db_free"

# --- 4. Execution ---
print("Starting data parsing and document creation...")
documents = parse_specs_and_create_documents(pc_parts_data)
print(f"Created {len(documents)} documents.")

print("Generating embeddings and building ChromaDB...")
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings,
    persist_directory=CHROMA_DB_PATH
)

vectorstore.persist()
print(f"Vector Database successfully created and saved at: {CHROMA_DB_PATH}")
print("Embedding process complete!")
