# 🚀 **AI-Powered Reverse Engineering Engine**

### *Radare2 × FastAPI × React × GPT-5 — Automated Binary Analysis with AI Explanations*

<p align="center">
  <img src="https://img.shields.io/badge/Framework-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Reverse%20Engineering-Radare2-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-GPT--5-blue?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

---

# 🌟 Overview

The **AI-Powered Reverse Engineering Engine** is a full-stack platform that lets you:

1. **Upload any binary**
2. **Automatically run radare2** to extract
   * functions
   * disassembly
   * CFG
3. **View disassembly in a beautiful UI**
4. **Ask GPT-5 to explain any function** in:
   * plain English
   * detailed step-by-step
   * pseudocode
   * suspicious behavior analysis
5. Cache explanations automatically for instant recall

This is a **modern RE assistant** designed for students, developers, cybersecurity professionals, and malware analysts.

---

# 🎥 Demo (GIF Placeholder)

*Add a GIF of your app here when ready.*

```md
📌 Example:
assets/demo.gif
```

---

# 🧠 Features

## 🔍 Reverse Engineering Pipeline

* Upload `.exe`, `.elf`, `.apk`, `.dll`, etc.
* Automated radare2 analysis:
  * Function discovery (`aflj`)
  * Disassembly extraction (`pdfj`)
  * CFG extraction (`agj`)
* Clean JSON artifacts saved per file

---

## 🤖 GPT-5 Explanation Engine

* High-level summary
* Line-by-line explanation
* Pseudocode (Python-style)
* Suspicious / malicious behavior detection
* Local caching (server + client)

---

## 🖥 Frontend (React + Vite)

* Function List View
* Interactive Disassembly Viewer
* AI Explanation Panel
* Upload + Processing Screen
* Clean TailwindCSS UI
* Built with TypeScript

---

## ⚡ Backend (FastAPI)

* `/upload/` – upload binary
* `/status/{file_id}` – check analysis
* `/functions/{file_id}` – list functions
* `/disassembly/{file_id}/{addr}` – function disasm
* `/explain/{file_id}/{addr}` – GPT-5 explanation
* Worker for radare2 analysis
* File-based cache for explanations

---

# 🧱 Architecture

```
           ┌──────────────────────────────────────────┐
           │                 Frontend                  │
           │        React + Vite + Tailwind           │
           │  - Upload file                           │
           │  - View functions                        │
           │  - Disassembly viewer                    │
           │  - GPT-5 explanation panel               │
           └───────────────▲──────────────────────────┘
                           │ REST API
                           │
           ┌───────────────┴──────────────────────────┐
           │                 Backend                   │
           │              FastAPI Server               │
           │                                           
           │  /upload/          save binary            
           │  /functions/       get function list      
           │  /disassembly/     get disasm             
           │  /explain/         GPT-5 explain          
           │  /status/          job state              
           └───────────────▲──────────────────────────┘
                           │ Workers
                           │
           ┌───────────────┴──────────────────────────┐
           │               Worker Engine               │
           │           Radare2 Automation             │
           │   - analyze binary                        │
           │   - extract functions                     │
           │   - extract disassembly                   │
           │   - output JSON artifacts                 │
           └───────────────▲──────────────────────────┘
                           │ reads/writes
                           │
           ┌───────────────┴──────────────────────────┐
           │                 Storage                   │
           │ artifacts/<file_id>/                      │
           │  - metadata.json                          │
           │  - functions.json                         │
           │  - disassembly/*.json                     │
           │  - cfg/*.json                             │
           │  - explanations/*.txt                     │
           └───────────────────────────────────────────┘
```

---

# 📦 Installation

## 🔧 Backend Setup (FastAPI + Worker)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Add `backend/.env`:

```
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-5
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.0
```

### Run Server

```bash
uvicorn app.main:app --reload
```

---

## 🌐 Frontend Setup (React + Vite)

```bash
cd frontend
npm install
```

### Add `frontend/.env`:

```
VITE_API_BASE=http://localhost:8000
```

### Run UI

```bash
npm run dev
```

---

# 🧪 Testing

## Backend Tests

```bash
cd backend
pytest -q
```

## Frontend Tests (if configured)

```bash
cd frontend
npm test
```

---

# 📁 Repository Structure

```
.
├── backend/
│   ├── app/
│   ├── storage/
│   ├── tests/
│   ├── requirements.txt
│   └── run_worker.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

# 🔐 Security

This repo is set up **correctly with best practices**, including:

* `.env` ignored
* Binary artifacts ignored
* Uploaded files ignored
* Node modules ignored
* Venv ignored

You are safe to push to GitHub publicly.

---

# 🧭 Roadmap

### 📌 v2.0 Planned:

* Malware pattern detection
* Meaningful CFG visualization
* Binary diffing with GPT-5
* Interactive call graph
* Multi-threaded analysis
* Cloud deployment (Railway / Render)

### 📌 v3.0 Planned:

* Dynamic analysis sandbox
* AI-based decompiler assistance
* Plugin architecture

---

# 🤝 Contributing

Contributions, ideas, and PRs are welcome!

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push & create pull request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# ⭐ Final Note



* Radare2
* FastAPI
* React
* GPT-5

You built something extremely advanced — a real portfolio project that can stand next to professional tools.