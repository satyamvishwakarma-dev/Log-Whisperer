# 🚨 Log-Whisperer

**Turn hours of server debugging into a two-second automated pipeline.**

Log-Whisperer is a full-stack, AI-powered log analysis dashboard. It uses a local Machine Learning engine to mathematically detect server anomalies in real-time and feeds the critical failures to a Generative AI to provide plain-English root causes and step-by-step fixes.

## ✨ Key Features
* **ML Anomaly Detection:** Uses Scikit-Learn's Isolation Forest algorithm to mathematically score log lines and filter out the noise.
* **GenAI Diagnostics:** Integrates the Google Gemini API to instantly translate cryptic server errors into actionable fixes.
* **Interactive Dashboard:** Built with Vanilla JS and ApexCharts to visualize server health, active incidents, and raw log feeds.
* **Resilient Architecture:** Includes a local fallback state to ensure high availability even if external APIs are rate-limited.

## 🛠️ Tech Stack
* **Backend:** Python, Flask
* **Machine Learning:** Scikit-Learn (Isolation Forest), Pandas
* **AI / LLM:** Google Gemini API
* **Frontend:** HTML, CSS, JavaScript, ApexCharts

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satyamvishwakarma-dev/Log-Whisperer.git
   cd log-whisperer
   ```
2. **Install dependencies:**
   ```bash
   pip install flask pandas scikit-learn google-generativeai
   ```
3. **Set up your API Key:**
   ```bash
   Get a free API key from Google AI Studio.
   Open app.py and replace the placeholder with your key.
   ```
4. **Start the server:**
   ```bash
   python app.py
   ```
5. **View the Dashboard:**
   ```bash
   Open your browser and go to http://127.0.0.1:5000
   Click Upload Real Log and select a .txt or .log file to see the ML and AI in action!
   ```

## Built at HackIndia Hackathon 2026 by Team Logic Bomb
### Members:
    Satyam Vishwakarma
    Harsh Agarwal
    Manjesh Kumar
    Vertika Rai