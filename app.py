from dotenv import load_dotenv
import os
from flask import Flask, render_template, jsonify, request
import google.generativeai as genai
import random
import pandas as pd
from sklearn.ensemble import IsolationForest
import re

load_dotenv()

app = Flask(__name__)

ai_cache = {} # Cache

genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def advanced_anomaly_detection(log_text):
    lines = [line for line in log_text.split('\n') if line.strip()]
    
    # If the file is too small for ML, just find the word "error"
    if len(lines) < 10:
        worst_line = next((l for l in lines if 'error' in l.lower() or 'critical' in l.lower()), lines[-1])
        return worst_line, 85

    # 1. Feature Extraction (Turn text into numbers for the AI)
    data = []
    for line in lines:
        length = len(line)
        err_keywords = len(re.findall(r'(?i)(error|fail|critical|exception|timeout)', line))
        data.append([length, err_keywords])
        
    df = pd.DataFrame(data, columns=['length', 'error_count'])

    # 2. Train the Isolation Forest Model
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(df)
    
    # 3. Score every line
    df['anomaly_score'] = model.decision_function(df)
    
    # 4. Find the absolute worst log line
    worst_idx = df['anomaly_score'].idxmin()
    worst_line = lines[worst_idx]
    
    # Convert the ML score into a 0-100 percentage for your dashboard
    math_score = float(df.loc[worst_idx, 'anomaly_score'])
    dashboard_score = min(99, int(abs(math_score) * 150 + 50)) 

    return worst_line, dashboard_score

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
    
    # Run the advanced ML detector!
    worst_log, calculated_score = advanced_anomaly_detection(log_content)

    print("\n" + "="*60)
    print(f"ML CHOSE THIS LINE: {worst_log}")
    print("="*60 + "\n")
    
    # Send the real anomaly to Gemini for the Root Cause Analysis
    prompt = f"""
    Act as a DevOps AI. Find the error in this log and give a short Root Cause and a 2-step Fix. 
    Format exactly like this (put each step on a new line):
    Root Cause: [text]
    Fix: 
    1. [Step 1]
    2. [Step 2]
    
    Log: {worst_log}
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
        "anomaly_score": calculated_score, # Now using REAL math!
        "alerts": calculated_score // 20, 
        "logs_ingested": "1 File",
        "log": worst_log, 
        "root_cause": root_cause,
        "fix": fix
    })
    

# --- 2. The Simulate Route ---
@app.route('/api/simulate')
def simulate():
    anomalous_log = "CRITICAL: Nginx worker_connections exceeded. Error: connection pool exhausted for Postgres DB."
    return run_ai_analysis(anomalous_log)

# --- Core AI Logic (Updated Prompt for Bullet Points) ---
def run_ai_analysis(worst_log, calculated_score=85):
    # 1. THE SHIELD: Check if we already know the answer!
    if worst_log in ai_cache:
        print("🚀 Using cached AI response! (Saved an API call!)")
        return jsonify(ai_cache[worst_log])

    # 2. If it's new, ask Gemini
    prompt = f"""
    Act as a DevOps AI. Find the error in this log and give a short Root Cause and a 2-step Fix. 
    Format exactly like this (put each step on a new line):
    Root Cause: [text]
    Fix: 
    1. [Step 1]
    2. [Step 2]
    
    Log: {worst_log}
    """
    
    try:
        response = model.generate_content(prompt)
        parts = response.text.split('Fix:')
        root_cause = parts[0].replace('Root Cause:', '').strip()
        fix = parts[1].strip() if len(parts) > 1 else "Investigate manually."
    except Exception as e:
        root_cause = "API Error"
        fix = str(e)

    # 3. Package the data
    result_data = {
        "anomaly_score": calculated_score, 
        "alerts": calculated_score // 20, 
        "logs_ingested": "1 File",
        "log": worst_log, 
        "root_cause": root_cause,
        "fix": fix
    }

    # 4. THE SAVE: Store it in the memory bank for next time
    ai_cache[worst_log] = result_data

    return jsonify(result_data)

if __name__ == '__main__':
    app.run(debug=True)