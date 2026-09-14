# 🌿 Focus Space - Task Management & Pomodoro Productivity Application

Focus Space คือเว็บแอปพลิเคชันบริหารจัดการเวลาและเพิ่มประสิทธิภาพในการทำงาน (Productivity & Task Management App) ที่ผสานระบบ **Pomodoro Timer**, **Task Tracker**, **Botanical Progress Visualization**, **Gradual Priority Escalation**, **Google OAuth Login**, และ **AI Study Advisor (Gemini)** ไว้ด้วยกัน

---

## 🚀 Key Features (ฟีเจอร์หลัก)

1. **User Authentication & Google OAuth**: ระบบสมัครสมาชิก/เข้าสู่ระบบด้วย Email/Password และ Google Sign-In
2. **Task & Target Hours Tracker**: การจัดการงาน กำหนดเวลาเป้าหมาย (Mins/Hours) พร้อมหลอดพลัง botanical progress bar
3. **Gradual Priority Escalation**: ระบบปรับความสำคัญของงานตามกำหนดส่งอัตโนมัติ (🟢 Low ➔ 🟡 Medium ➔ 🔴 High/Overdue)
4. **Dashboard Today's Focus Spotlight**: การเลือกสปอตไลท์งานสำคัญประจำวัน พร้อมทางลัดเข้าสู่ระบบ Pomodoro Timer
5. **Pomodoro Timer & Focus Sessions**: นาฬิกาจับเวลาถอยหลัง 25/5 นาที พร้อมบันทึกประวัติ Focus Session
6. **AI Advisor (Google Gemini API)**: ผู้ช่วยอัจฉริยะวิเคราะห์ตารางงาน ให้คำแนะนำการจัดเวลา และประเมินภาระงานประจำวัน
7. **Botanical Theme UI**: อินเทอร์เฟซโทนสีเขียวธรรมชาติ สบายตา และมี Widget บันทึกอารมณ์/ข้อความให้กำลังใจ

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js, Mongoose (MongoDB Atlas)
- **Authentication**: JSON Web Token (JWT), Google Auth Library (`@react-oauth/google`)
- **AI Integration**: `@google/genai` (Google Gemini 2.5 Flash Model)

---

## 📂 Project Structure (โครงสร้างโปรเจกต์)

```text
focus-space/
├── backend/                  # Express.js REST API Server
│   ├── controllers/          # Business logic (AI Advisor)
│   ├── middleware/           # JWT Auth Middleware
│   ├── models/               # Mongoose Schemas (User, Task, FocusSession)
│   ├── routes/               # API Routes (auth, tasks, pomodoro, dashboard)
│   ├── services/             # External services (Gemini AI service)
│   ├── server.js             # Main server entrypoint
│   └── .env.example          # Environment variables template
├── frontend/                 # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/       # UI Components (TaskList, Dashboard, Pomodoro, AIAdvisor, etc.)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── App.jsx           # Routing & Layout
│   │   └── main.jsx          # Entrypoint & OAuth Provider
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Setup (ขั้นตอนการติดตั้งและใช้งาน)

### 1. Clone Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd focus-space
```

### 2. Backend Setup
```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` ตามตัวอย่างใน `.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

เริ่มรัน Backend Server:
```bash
npm start
# หรือ node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

เปิดบราวเซอร์ไปที่: **`http://focus-space.com`** *(หรือ `http://localhost`)*

*(หมายเหตุ: สำหรับการเปิดใช้งานผ่านชื่อโดเมนโปรเจกต์ `http://focus-space.com` ให้ตั้งค่าในไฟล์ Windows hosts: `127.0.0.1 focus-space.com`)*

