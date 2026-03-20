from dotenv import load_dotenv
import os
from flask import Flask, render_template, jsonify, request
import google.generativeai as genai
import random

load_dotenv()

app = Flask(__name__)

genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

# --- 1. The Real File Upload Route ---
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    log_content = file.read().decode('utf-8')
    
    # Grab the last 1000 characters so we don't overload the AI
    snippet = log_content[-1000:] 

    return run_ai_analysis(snippet)

# --- 2. The Simulate Route ---
@app.route('/api/simulate')
def simulate():
    anomalous_log = "CRITICAL: Nginx worker_connections exceeded. Error: connection pool exhausted for Postgres DB."
    return run_ai_analysis(anomalous_log)

# --- Core AI Logic (Updated Prompt for Bullet Points) ---
def run_ai_analysis(log_text):
    prompt = f"""
    Act as a DevOps AI. Find the error in this log and give a short Root Cause and a 2-step Fix. 
    Format exactly like this (put each step on a new line):
    Root Cause: [text]
    Fix: 
    1. [Step 1]
    2. [Step 2]
    
    Log: {log_text}
    """
    
    try:
        response = model.generate_content(prompt)
        parts = response.text.split('Fix:')
        root_cause = parts[0].replace('Root Cause:', '').strip()
        fix = parts[1].strip() if len(parts) > 1 else "Investigate manually."
    except Exception as e:
        root_cause = "API Error"
        fix = str(e)

    return jsonify({
        "anomaly_score": random.randint(75, 99),
        "alerts": random.randint(1, 5),
        "logs_ingested": "4.2M/min",
        "log": log_text[-150:], # Show a short snippet on the dashboard
        "root_cause": root_cause,
        "fix": fix
    })

if __name__ == '__main__':
    app.run(debug=True)