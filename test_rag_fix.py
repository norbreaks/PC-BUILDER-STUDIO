#!/usr/bin/env python3
"""
Test script to verify the RAG fix is working properly.
"""
import requests
import json

def test_rag_endpoint():
    """Test the RAG /ask endpoint."""
    base_url = "http://localhost:8000"
    
    # Test data
    test_question = "I need a gaming PC build under $1000. What components do you recommend?"
    
    # Prepare request
    payload = {
        "question": test_question
    }
    
    try:
        print(f"Testing RAG endpoint with question: {test_question}")
        response = requests.post(f"{base_url}/ask", json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ RAG Test PASSED!")
            print(f"Response: {result}")
            return True
        else:
            print(f"❌ RAG Test FAILED! Status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing RAG System Fix...")
    test_rag_endpoint()
