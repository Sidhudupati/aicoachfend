import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key from the environment variables
API_KEY = "AIzaSyAcvPYmS8ZGtjFlL6ECCK_YkK3CSzs-Ags"

if not API_KEY:
    raise ValueError("API key not found. Please set GOOGLE_API_KEY in your .env file.")

# Configure the Google Gemini API
genai.configure(api_key=API_KEY)

def ask_gemini(question):
    """Ask Gemini AI a question and get a response"""
    try:
        # Create the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Generate content
        response = model.generate_content(question)
        
        print(f"\nQuestion: {question}")
        print(f"\nGemini's Answer:\n{response.text}")
        
    except Exception as e:
        print(f"Error while calling Gemini AI: {e}")

def main():
    # Test questions
    ask_gemini("What is the best movie of 2022?")
    print("\n" + "="*50 + "\n")
    ask_gemini("Write a short haiku about AI")

if __name__ == "__main__":
    main()