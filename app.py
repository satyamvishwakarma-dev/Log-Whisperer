from flask import Flask, render_template, jsonify
import google.generativeai as genai
import random

app = Flask(__name__)

# Configure your Gemini API key here
genai.configure(api_key="API_KEY")
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/simulate')
def simulate():
    # Simulated error log
    anomalous_log = "CRITICAL: Nginx worker_connections exceeded. Error: connection pool exhausted for Postgres DB."

    # Prompt Gemini
    prompt = f"""
    Act as a DevOps AI. Read this log and give a short Root Cause and a 2-step Fix. 
    Format exactly like this:
    Root Cause: [text]
    Fix: [text]
    
    Log: {anomalous_log}
    """
    
    try:
        response = model.generate_content(prompt)
        parts = response.text.split('Fix:')
        root_cause = parts[0].replace('Root Cause:', '').strip()
        fix = parts[1].strip() if len(parts) > 1 else "Investigate manually."
    except Exception as e:
        root_cause = "AI Analysis Failed"
        fix = "Please check your API key and connection."

    return jsonify({
        "anomaly_score": random.randint(75, 99),
        "alerts": random.randint(1, 5),
        "logs_ingested": "4.2M/min",
        "log": anomalous_log,
        "root_cause": root_cause,
        "fix": fix
    })

if __name__ == '__main__':
    app.run(debug=True)