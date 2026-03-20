from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# This is where your JS will pull real-time updates
@app.route('/api/data')
def get_data():
    return jsonify({
        "anomaly_score": random.randint(10, 99),
        "active_alerts": random.randint(1, 5),
        "logs_ingested": "4.2M/min",
        "latest_log": "CRITICAL: Nginx worker_connections exceeded... Error: connection pool exhausted.",
        "root_cause": "Memory Leak in Database Connection Pool (Postgres)"
    })

if __name__ == '__main__':
    app.run(debug=True)