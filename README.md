# 📊 Market Anomaly Detection Project

Welcome to the **Market Anomaly Detection** project! This application combines **machine learning**, **real-time market data**, and **AI-powered reasoning** to **predict market anomalies** and provide **detailed insights** on predictions.

---
| **Dashboard** | **Market Trends** | **Prediction Insights** |
|--------------|----------------|----------------|
| ![Dashboard](<Screenshot 2025-01-12 at 14.31.17.png>) | ![alt text](<Screenshot 2025-01-12 at 14.31.48.png>)  | ![alt text](<Screenshot 2025-01-12 at 14.31.27.png>) |

---

## 📚 Overview
This project **analyzes real-time market data**, predicts potential **market anomalies** (such as stock crashes), and **explains predictions** using **Retrieval-Augmented Generation (RAG)** powered by **Groq AI**.

💡 **Key Objective**: To empower investors with **actionable insights** and help them make informed decisions.

---

## 🚀 Features
✅ **Market Anomaly Detection**: A **Random Forest model** predicts potential market crashes based on **real-time data**.  
✅ **AI-Powered Insights**: Predictions are **explained using Groq RAG**, incorporating **news** and **feature analysis**.  
✅ **Real-Time Data Integration**: Uses **Yahoo Finance API** to fetch **live stock data**.  
✅ **Dynamic Data Visualization**: Interactive **charts** visualize stock trends and model predictions.  
✅ **Customizable Parameters**: Users can select **stock symbols** and **timeframes**.  

---

## 🛠️ Tech Stack
| **Component** | **Technology** |
|--------------|---------------|
| **Backend**  | Python, Flask, Yahoo Finance API, Groq API |
| **Frontend** | React, Next.js, TailwindCSS, Chart.js |
| **Machine Learning** | Random Forest Model (SMOTE for imbalanced data) |
| **API Communication** | Flask REST API |
| **Environment Management** | dotenv |

---

## 📈 Model Details
- **Model Used**: `RandomForestClassifier`
- **Preprocessing**: Feature scaling, **SMOTE** for **class balancing**
- **Prediction Output**:  
  - `1` → Market Crash  
  - `0` → No Crash  

### 📊 Key Features Used in the Model
- **XAU BGNL (Gold Spot)**
- **BDIY (Baltic Dry Index)**
- **DXY (Dollar Index)**
- **VIX (CBOE Volatility Index)**
- **JPY (Japanese Yen)**
- **GBP (British Pound)**
- **And more...**  

