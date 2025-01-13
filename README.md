Market Anomaly Detection Project
Welcome to the Market Anomaly Detection project! This application combines machine learning, real-time market data, and AI-powered reasoning to predict market anomalies and explain predictions with detailed insights.
![alt text](<Screenshot 2025-01-12 at 14.31.17.png>)
![alt text](<Screenshot 2025-01-12 at 14.31.27.png>)
![alt text](<Screenshot 2025-01-12 at 14.31.48.png>)
📚 Overview
This project analyzes market data in real-time, predicts potential market anomalies (e.g., crashes), and provides explanations for its predictions using Retrieval-Augmented Generation (RAG) powered by Groq AI. The goal is to empower investors with actionable insights and help them make informed decisions.

🚀 Features
Market Anomaly Detection: A trained Random Forest model predicts market crashes based on real-time data.
AI-Powered Insights: Explanations are generated using Groq RAG, incorporating recent news and feature analysis.
Data Visualization: Stock prices and predictions are displayed dynamically with an intuitive frontend.
Real-Time Data Integration: Uses Yahoo Finance API for fetching live market data.
Customizable Parameters: Users can select stock symbols and timeframes.
🛠️ Tech Stack
Backend: Python, Flask, Yahoo Finance API, Groq API
Frontend: React, Next.js, TailwindCSS, Chart.js
Machine Learning: Random Forest model trained on financial datasets with SMOTE for handling imbalanced data
API Communication: Flask REST API
Environment Management: dotenv for configuration
📈 Model Details
Model Used: Random Forest Classifier
Key Features:
XAU BGNL (Gold Spot)
BDIY (Baltic Dry Index)
DXY (Dollar Index)
VIX (CBOE Volatility Index)
JPY (Japanese Yen)
GBP (British Pound)
And more...
Preprocessing: Feature scaling, SMOTE for class balancing
Prediction Output:
1: Market Crash
0: No Crash
🔗 Links
GitHub Repository: Market Anomaly Detection GitHub
Model Details: Model Notebook
API Documentation: API Endpoints
👨‍💻 About the Developer
Aman Hiran Purohit
A passionate developer specializing in AI, ML, and financial analytics. With expertise in building scalable, data-driven solutions, I strive to bridge the gap between technology and real-world applications.

📬 Contact
Feel free to connect with me for collaboration or queries:

Email: amanpurohit2004@gmail.com
LinkedIn: Aman Hiran Purohit
GitHub: @purohitamann
💡 How to Run the Project
Clone the Repository:

bash
Copy code
git clone https://github.com/purohitamann/market-anomaly-detection.git
cd market-anomaly-detection
Setup Environment:

Install dependencies:
bash
Copy code
pip install -r requirements.txt
Set up .env.local file for API keys:
makefile
Copy code
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_FLASK_SERVER_BASE=http://localhost:5005
Run the Backend:
python model.py

Run the Frontend:
npm install
npm run dev
Access the Application: Open http://localhost:3000 in your browser.

