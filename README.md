# AI-Powered Interview Assistant 🚀

An AI-powered full-stack interview preparation platform that helps users generate personalized interview reports, technical & behavioral questions, skill gap analysis, preparation tips, and AI-enhanced resumes using uploaded resumes and job descriptions.

---

## 🔥 Features

* 📄 Resume PDF Upload & Parsing
* 🤖 AI-Based Interview Report Generation
* 💡 Technical & Behavioral Interview Questions
* 📊 Match Score Analysis
* 🧠 Skill Gap Detection
* 🛣 Personalized Preparation Tips
* 📥 AI Resume PDF Generation
* 🔐 JWT Authentication
* ⚡ MERN Stack Architecture
* 🎨 Modern Responsive UI

---

# 🛠 Tech Stack

## Frontend

* React.js
* SCSS
* Axios
* React Router

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* PDF-Parse

## AI Integration

* Gemini API / OpenAI API
* Prompt Engineering

---

# 📂 Project Structure

```bash
GenAI-Full-Stack-Project/
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── config/
│   │
│   ├── server.js
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── styles/
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Rajoshikdas/GenAI-Full-Stack-Project.git
```

---

## 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

### Create `.env`

```env
PORT=3000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

### Run Backend

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

# 🚀 How It Works

1. User uploads resume PDF
2. AI extracts resume content
3. User enters self introduction & job description
4. AI analyzes:

   * resume
   * skills
   * job match
5. Generates:

   * technical questions
   * behavioral questions
   * skill gaps
   * preparation tips
   * match score
6. User can download AI-enhanced resume PDF

---

# 📸 Features Preview

## ✅ Interview Dashboard

* Technical Questions
* Behavioral Questions
* Match Score
* Skill Gaps
* Preparation Roadmap

## ✅ Resume Parsing

* Extracts text from uploaded PDF resume

## ✅ AI Analysis

* Personalized interview preparation guidance

---

# 🔑 API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Interview

### Generate Report

```http
POST /api/interview
```

### Get Interview Report

```http
GET /api/interview/:id
```

### Generate Resume PDF

```http
GET /api/interview/resume/pdf/:interviewReportId
```

---

# 🌟 Future Improvements

* 🎤 Voice-Based AI Interview
* 📹 Video Interview Simulation
* 📈 Interview Analytics Dashboard
* 🌐 Deployment on Vercel + Render
* 🧾 ATS Resume Score Checker
* 🔊 AI Speech Feedback
* 🧠 Multi-LLM Support

---

# 👨‍💻 Author

## Rajoshik Das

Backend Developer & AI Enthusiast

* GitHub:
  [Rajoshik Das GitHub](https://github.com/Rajoshikdas?utm_source=chatgpt.com)

* LinkedIn:
  [Rajoshik Das LinkedIn](https://www.linkedin.com/in/rajoshik-das/?utm_source=chatgpt.com)

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository
🍴 Fork the project
🛠 Contribute improvements

---

# 📜 License

This project is licensed under the MIT License.
<img width="838" height="885" alt="image" src="https://github.com/user-attachments/assets/38e4356d-7a44-4042-8190-20152b82af30" />
<img width="1563" height="897" alt="image" src="https://github.com/user-attachments/assets/66885ef5-7351-441d-ba12-1810f82abd90" />
<img width="1542" height="893" alt="image" src="https://github.com/user-attachments/assets/16cc7835-2f94-4074-9a85-29db94821850" />
<img width="1557" height="912" alt="image" src="https://github.com/user-attachments/assets/968e9864-0c03-45c0-bcae-ac5e6083ca40" />
<img width="1516" height="876" alt="image" src="https://github.com/user-attachments/assets/e68937de-65f0-4f53-bd92-33b5e02108db" />
<img width="1887" height="922" alt="Screenshot 2026-05-21 160819" src="https://github.com/user-attachments/assets/48daebc2-c7c6-4645-9ccb-ffcecc7481ee" />
<img width="1572" height="897" alt="image" src="https://github.com/user-attachments/assets/fb70b2f1-0b59-4eb2-8b94-fb1dd8413a55" />


