# 🧠 AI-Powered Multilingual Sales Training Platform

A next-gen training system for sales agents that combines multilingual video content, AI-generated summaries, and an interactive virtual customer to provide hands-on sales practice and personalized performance feedback.

---

## 🚀 Features

### 🎥 Multilingual Video Learning
- Access curated sales training videos
- Watch in **multiple Indian languages**
- AI-generated **video summaries** in regional languages for time-efficient learning

### 🤖 AI Virtual Customer Simulation
- Practice live sales conversations with a configurable AI customer
- Customize:
  - **Persona** (e.g., Retiree, Young Professional)
  - **Product** (e.g., Credit Card, Home Loan)
  - **Difficulty level** (Easy / Medium / Hard)
  - **Voice tone and gender**
  - **Language** (English, Hindi, Tamil, etc.)

### 📊 Real-Time Performance Analysis
- Conversation-based AI feedback
- Skill scoring (e.g., Objection Handling, Closing)
- Visual analytics dashboard with achievements, trends, and improvement stats

---

## 🧰 Tech Stack

### Frontend
- **React.js** – UI development
- **Lucide-react** – Icon library
- **react-youtube** – YouTube video embedding
- **WebSocket API** – Real-time conversation streaming
- **CSS** – Custom styling and layouts

### Backend (FastAPI)
- **FastAPI** – Python web framework
- **Uvicorn** – ASGI server
- **WebSockets** – Bi-directional voice communication
- **YouTube Transcript API** – Transcript extraction
- **Google Gemini API** – AI-generated multilingual summaries
- **Groq (LLaMA 3)** – AI customer dialog generation
- **ElevenLabs API** – Multilingual Text-to-Speech
- **Pydantic** – Data modeling and validation

---
## 📽 Demo Video

[![Watch Demo](https://img.youtube.com/vi/F62kqaaN5Yo/0.jpg)](https://drive.google.com/file/d/1XYiViPNduNUANzVcw3f_PMVDB8J6GxWK/view)

Click the image above to watch the full demo on Google Drive.

---
## 🚀 Live Demo (Hugging Face)

👉 Try the app live on [Hugging Face Spaces](https://huggingface.co/spaces/omprakash8639/Virtual_Customer)

Experience the virtual customer simulation in your browser — no setup needed!

---

## 🧪 How It Works

1. **Choose a training video** and select your preferred language
2. View a **summary or full video**
3. Start a **live AI training session** with a virtual customer
4. Converse using voice — AI responds in real-time
5. Get **analytics, coaching tips**, and **skill insights**

---

## 🛠️ Getting Started (Dev Setup)

### Prerequisites
- Node.js and npm
- Python 3.8+
- API keys for:
  - Google Gemini
  - ElevenLabs
  - Groq (LLaMA3)

### Frontend

```bash
cd frontend
npm install
npm start

cd backend
pip install -r requirements.txt
uvicorn app:app --reload
