import streamlit as st
from analyzer import analyze_logs

st.set_page_config(page_title="Log-Whisperer", layout="wide")

st.title("Log-Whisperer")
st.subheader("AI-Driven Real-Time Log Anomaly & Root Cause Detector")

# File Upload
uploaded_file = st.file_uploader("Upload System Logs (.txt or .log)", type=["txt", "log"])

if uploaded_file is not None:
    # Decode and split logs
    logs_raw = uploaded_file.getvalue().decode("utf-8")
    log_lines = logs_raw.splitlines()
    
    st.success(f"Successfully loaded {len(log_lines)} log lines.")
    
    # Display preview
    with st.expander("View Log Preview"):
        st.code("\n".join(log_lines[:50]) + "\n...", language="bash")
        
    # Trigger Analysis
    if st.button("Detect Anomalies & Generate Crash Report", type="primary"):
        with st.spinner("Whispering to the logs..."):
            # For phase 1, we send the last 100 lines (often where crashes occur)
            # We will replace this with ML-detected chunks later
            log_chunk = "\n".join(log_lines[-100:]) 
            
            report = analyze_logs(log_chunk)
            
            st.divider()
            st.subheader("🚨 Crash Report")
            st.markdown(report)