#  Aditi AI Assistant

> Your personal AI companion for conversations, memory, voice interaction, and desktop automation.

Aditi is a desktop AI assistant built to feel more natural, personal, and capable than a traditional chatbot. It can chat, remember important information, understand voice commands, perform desktop actions, and use custom-trained machine learning models to intelligently route and execute tasks.

Unlike most assistants that simply answer questions, Aditi aims to become a true personal companion that can understand context, remember user preferences, and interact directly with the computer.

---

## ✨ Features

### 🧠 Intelligent Conversations

* Natural and context-aware conversations
* Supports both online and local AI models
* Personalized responses based on memory
* Maintains conversation context

### 💾 Memory System

* Stores important user information
* Retrieves relevant memories during conversations
* MongoDB-powered persistent memory
* Personalized interaction experience

### 🎙️ Voice Interaction

* Speech-to-Text (STT)
* Text-to-Speech (TTS)
* Voice-controlled commands
* Continuous listening support
* Hands-free interaction

### 🖥️ Desktop Automation

* Open applications
* Close applications
* Search Google
* Search YouTube
* Launch websites
* Execute desktop actions

### 🤖 Custom AI Models

Aditi includes two custom-trained machine learning models:

#### Intent Classification Model

Determines what the user wants to do.

Examples:

```text
"Open Chrome"
→ COMMAND

"Remember that I like coffee"
→ MEMORY_SEARCH

"How are you?"
→ CHAT
```

#### Desktop Command Classification Model

Determines which desktop action should be executed.

Examples:

```text
"Open Chrome"
→ OPEN_APP

"Search YouTube for Interstellar"
→ SEARCH_YOUTUBE

"Close Spotify"
→ CLOSE_APP
```

### 🎨 Modern User Interface

* Floating assistant UI
* Animated orb interaction
* Desktop application experience
* Responsive design

---

# 🏗️ Architecture

```text
User
 │
 ▼
Voice / Text Input
 │
 ▼
Intent Classification Model
 │
 ├── CHAT
 │     ▼
 │   LLM Response
 │
 ├── MEMORY
 │     ▼
 │   Memory Retrieval
 │
 └── COMMAND
       ▼
Desktop Command Model
       ▼
Desktop Action Execution
```

---

# 🚀 Tech Stack

## Frontend

* React
* Vite
* CSS

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Desktop Application

* Electron

## AI & Machine Learning

* Hugging Face Transformers
* Ollama
* Groq API
* Custom Fine-Tuned Models

---

# 📂 Project Structure

```text
Aditi/
│
├── aiFrontend/
│
├── aiBackend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── config/
│   └── services/
│
├── datasets/
│
├── training/
│
├── electron/
│
├── README.md
└── package.json
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/Ashutosh-Singh08/Aditi.git
cd Aditi
```

---

## 2. Install Frontend Dependencies

```bash
cd aiFrontend
npm install
```

---

## 3. Install Backend Dependencies

```bash
cd ../aiBackend
npm install
```

---

## 4. Install Root Dependencies

```bash
cd ..
npm install
```

---

# 🗄️ MongoDB Setup

Install MongoDB Community Edition and start the MongoDB service.

Create a database connection string and add it to the environment variables.

---

# 🔑 Environment Variables

Create a `.env` file inside `aiBackend`.

```env
PORT=4000

MONGO_URI=YOUR_MONGODB_URI

GROQ_API_KEY=YOUR_GROQ_API_KEY

USE_ONLINE_MODEL=true

ONLINE_MODEL=llama-3.3-70b-versatile

OLLAMA_MODEL=qwen3:4b
```

---

# 🏃 Running Aditi

## Start Backend

```bash
cd aiBackend
npm run dev
```

## Start Frontend

```bash
cd aiFrontend
npm run dev
```

## Launch Electron Application

```bash
npm run electron
```

---

# 🤖 Pre-Trained Models

Aditi uses two custom-trained models.

## Intent Classification Model

Responsible for classifying user requests into categories such as:

* CHAT
* COMMAND
* SELF_UPDATE
* BUG_FIX
* CODE_UPDATE
* OPEN_APP
* VOICE_CONTROL
* MEMORY_SEARCH

Download:

```text
https://huggingface.co/YOUR_USERNAME/aditi-intent-classifier
```

Place inside:

```text
aiBackend/models/final_model/
```

---

## Desktop Command Classification Model

Responsible for identifying desktop actions such as:

* Open Application
* Close Application
* Search Web
* Search YouTube
* System Commands

Download:

```text
https://huggingface.co/YOUR_USERNAME/aditi-desktop-command-classifier
```

Place inside:

```text
aiBackend/models/aditi-final/
```

---

# 📚 Datasets

The repository contains the datasets used to train the custom classifiers.

## Intent Dataset

```text
datasets/intent_dataset.jsonl
```

Used to train the Intent Classification Model.

---

## Desktop Command Dataset

```text
datasets/desktop_command_dataset.jsonl
```

Used to train the Desktop Command Classification Model.

---

# 🏋️ Training Models

Developers can retrain the models from scratch using the provided datasets and training scripts.

Install training dependencies:

```bash
pip install -r training/requirements.txt
```

Train Intent Classifier:

```bash
python training/train_intent_classifier.py
```

Train Desktop Command Classifier:

```bash
python training/train_desktop_classifier.py
```

Generated models will be saved to:

```text
aiBackend/models/
```

---

# 🔮 Future Roadmap

* Wake-word activation
* Camera and vision support
* Long-term vector memory
* Emotion-aware responses
* Self-improving workflows
* Multi-device synchronization
* Fully offline mode

---

# 💡 Why I Built Aditi

I wanted an assistant that feels less like software and more like a companion.

Most assistants can answer questions, but very few can remember who you are, understand your preferences, perform actions on your computer, and provide a personalized experience.

Aditi started as a learning project and gradually evolved into a complete desktop AI assistant combining voice, memory, automation, and modern AI technologies.

The long-term goal is simple:

> Build an assistant that can genuinely understand, assist, and grow alongside its user.

---

# 👨‍💻 Author

### Ashutosh Singh

Cyber Security Undergraduate • AI Enthusiast • Full Stack Developer

GitHub:

https://github.com/Ashutosh-Singh08

---

# ⭐ Support

If you found this project interesting, consider giving it a star.

It helps the project reach more developers and motivates future development.

---

# 📜 License

This project is licensed under the MIT License.
