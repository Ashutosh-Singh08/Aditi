Aditi AI Assistant

A personal desktop AI assistant designed to feel less like a chatbot and more like a companion.

Aditi is an AI-powered voice assistant built using React, Node.js, MongoDB, and Large Language Models. It combines conversational AI, long-term memory, voice interaction, desktop automation, and a customizable personality into a single assistant that runs on your computer.

Unlike traditional assistants that simply answer questions, Aditi remembers important information, performs desktop actions, adapts to user preferences, and can continue evolving through future self-improvement features.

Features
Voice Interaction
Speech-to-text input
Text-to-speech responses
Hands-free conversations
Continuous listening support
Interruptible speech playback
AI Chat
Natural conversations
Context-aware responses
Friendly and personalized personality
Supports both local and online LLMs
Memory System
Stores important user information
Retrieves relevant memories during conversations
MongoDB-based memory storage
Desktop Control
Open applications
Search the web
Launch websites
System-level commands
Extensible command architecture
Hybrid AI Architecture
Online LLM for advanced reasoning
Local model fallback when internet is unavailable
Intent classification for faster task routing
Modern UI
Floating assistant interface
Animated orb visualization
Responsive design
Desktop-app experience through Electron
Tech Stack
Frontend
React
Vite
CSS3
Backend
Node.js
Express.js
Database
MongoDB
AI & ML
Groq API
Ollama
Custom Intent Classification Model
Desktop
Electron
Project Structure
Aditi/
│
├── aiFrontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── aiBackend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── audio/
│   └── ...
│
├── electron/
│
├── models/
│
├── package.json
└── README.md

Installation
1. Clone Repository
git clone https://github.com/Ashutosh-Singh08/Aditi-Ai-Model-1.git
cd Aditi-Ai-Model-1

2. Install Dependencies
Frontend
cd aiFrontend
npm install
Backend
cd ../aiBackend
npm install
Root Directory
cd ..
npm install

3. Install MongoDB

Download and install:

MongoDB Community Server

Start MongoDB service before running Aditi.

4. Install Ollama

Download:

Ollama

Pull a local model:

ollama pull qwen3:4b

Start Ollama:

ollama serve

## Download Models

Aditi uses two custom-trained models hosted on Hugging Face:

- Intent Classifier: `https://huggingface.co/AshutoshSingh08/aditi-intent-classifier`
- Desktop Command Classifier: `https://huggingface.co/AshutoshSingh08/aditi-desktop-command-classifier`

Download them and place them here:

```bash
aiBackend/models/final_model
aiBackend/models/aditi-final


5. Environment Variables

Create a .env file inside aiBackend.

PORT=4000

MONGO_URI=YOUR_MONGODB_CONNECTION

GROQ_API_KEY=YOUR_GROQ_API_KEY

USE_ONLINE_MODEL=true

ONLINE_MODEL=llama-3.3-70b-versatile

OLLAMA_MODEL=qwen3:4b
Running the Project
Start Backend
cd aiBackend
npm run dev
Start Frontend
cd aiFrontend
npm run dev
Launch Electron App
npm run electron
Future Roadmap
Wake-word activation
Vision and camera integration
Self-update capabilities
Vector memory search
Local fine-tuned models
Emotion detection
Smart desktop workflows
Multi-device synchronization
Why I Built Aditi

I wanted an assistant that felt personal.

Most assistants can answer questions, but very few can remember who you are, understand your habits, perform desktop tasks, and feel like a consistent companion.

Aditi started as a learning project and gradually evolved into a full desktop AI assistant combining voice, memory, automation, and modern LLMs.

The goal is simple:

Build an assistant that feels less like software and more like someone you can talk to.

Author
Ashutosh Singh

Cyber Security Undergraduate | AI Enthusiast | Full Stack Developer

GitHub:

Ashutosh-Singh08 GitHub