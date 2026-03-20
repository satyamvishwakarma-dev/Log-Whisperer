import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# The client automatically picks up the GEMINI_API_KEY environment variable
client = genai.Client(api_key=os.getenv("API_KEY"))

def analyze_logs(log_text):
    prompt = f"""
    You are an expert DevOps engineer. Analyze the following system logs.
    1. Identify any anomalies or errors.
    2. Determine the probable root cause.
    3. Provide a concise 'Crash Report' and a recommended fix.
    
    Logs to analyze:
    {log_text}
    """
    
    try:
        # Using flash for fast, cost-effective responses
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"Error analyzing logs: {e}"