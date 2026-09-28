# 🌸 Focus Space - AI-Powered Botanical Task & Focus Management System

> **ระบบจัดการภารกิจและฟูมฟักสมาธิสไตล์สวนพฤกษาด้วยปัญญาประดิษฐ์**  
> **โครงงานปริญญานิพนธ์**: มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน (มทร.อีสาน วิทยาเขตขอนแก่น - RMUTI)  
> **นักศึกษา**: นางสาว กนลรัตน์ วงศ์ษาพาล (รหัสนักศึกษา 67332310142-2)  
> **อาจารย์ที่ปรึกษา**: อ.ดร.ปิยะนุช ตังกิตติพล  
> **เอกสารระบบอ้างอิง**: `Focus_Space_System_Documentation.docx` (ฉบับวันที่ 28 กันยายน 2569)

---

## 🌐 Live Production Links (ลิงก์เข้าใช้งานระบบจริง)

- **Frontend Application (Vercel)**: [https://focus-space-seven.vercel.app](https://focus-space-seven.vercel.app)
- **Backend REST API (Render)**: [https://focus-space-backend.onrender.com](https://focus-space-backend.onrender.com)
- **Database**: MongoDB Atlas Cloud Database (`Cluster0` / `focus-space-db`)

---

## 🚀 Core Features (ฟีเจอร์หลักของระบบ)

1. **🔒 Institutional Google OAuth 2.0 (@rmuti.ac.th)**:
   - เข้าสู่ระบบ 1-Click ปลอดภัย รองรับเฉพาะบัญชีสถาบัน มทร.อีสาน (`@rmuti.ac.th`)
   - ขอสิทธิ์จัดการปฏิทิน Google Calendar ล่วงหน้าโดยอัตโนมัติ

2. **🤖 AI-Powered Task Prioritization (Google Gemini 2.5 Flash)**:
   - วิเคราะห์ข้อความภารกิจภาษาไทย/อังกฤษ สกัดคำบอกความด่วน คัดกรองความสำคัญ (`High` / `Medium` / `Low`)
   - ติดป้ายเหตุผล `✨ AI: ...` พร้อมระบบสำรองความปลอดภัย 3 ชั้น (`Gemini AI` ➔ `Backend Rules` ➔ `Frontend Fallbacks`)

3. **📅 Google Calendar API v3 Integration**:
   - ซิงค์เดดไลน์กิจกรรมแบบ All-Day ลง Google Calendar อัตโนมัติในคลิกเดียว
   - รองรับการอัปเดตและลบกิจกรรมอัตโนมัติ 1-Click ทั้งจาก MongoDB Atlas และ Google Calendar

4. **🍅 Real-Timestamp Botanical Pomodoro Timer**:
   - นาฬิกาสมาธิ 25 นาที คำนวณเวลาจาก `Date.now()` ป้องกันเวลาคลาดเคลื่อนเมื่อสลับหน้าจอ
   - เมื่อโฟกัสครบเวลา ดอกไม้เบ่งบานสมบูรณ์จะถูกเก็บเกี่ยวไปบันทึกสะสมลงในสวนสถิติ (`GardenStats`)

5. **📧 Security Password Reset via Resend Email Service**:
   - ระบบขอรหัสยืนยันความปลอดภัย OTP 6 หลัก (อายุ 10 นาที) ส่งตรงไปยังอีเมลผู้ใช้ผ่าน Resend API

6. **📱 Botanical Glassmorphism Responsive UI**:
   - ดีไซน์กระจกพาสเทลสบายตา พร้อมแถบลอยทรงแคปซูล (Mobile Dock Bar) แสดงผลพอดีขอบจอมือถือ 100%

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)

- **Frontend**: React.js (Vite), CSS Glassmorphism Design, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js REST API, Mongoose ODM
- **Database**: MongoDB Atlas Cloud Database (`focus-space-db`)
- **Authentication**: JSON Web Token (JWT 7 Days), Google Identity Services OAuth 2.0
- **External Services**:
  - **Google Gemini API**: `@google/genai` (Task Analysis)
  - **Google Calendar API v3**: Event Synchronization
  - **Resend API**: Email OTP Security Service

---

## 📂 Project Structure (โครงสร้างโปรเจกต์)

```text
focus-space/
├── backend/                  # Express.js REST API Server
│   ├── controllers/          # Business logic (aiController.js)
│   ├── middleware/           # JWT & Auth Middleware (auth.js)
│   ├── models/               # Mongoose Schemas (User.js, Task.js, FocusSession.js)
│   ├── routes/               # API Endpoints (auth.js, tasks.js, pomodoro.js, dashboard.js)
│   ├── services/             # External Integrations (emailService.js, aiService.js)
│   ├── server.js             # Express App Server Entrypoint
│   └── render.yaml           # Deployment Configuration for Render Cloud
├── frontend/                 # React.js Single Page Application
│   ├── src/
│   │   ├── components/       # UI Components (Login, TaskList, GardenCalendar, Pomodoro, Dashboard, etc.)
│   │   ├── context/          # Global State Providers (AuthContext, TaskContext, PomodoroContext)
│   │   ├── lib/              # API Client & Helpers (api.js, storage.js)
│   │   ├── App.jsx           # Main Layout & Tab Router
│   │   └── main.jsx          # Entrypoint & Context Provider Stack
│   ├── index.html
│   └── vite.config.js        # Vite Build Configuration
└── README.md                 # System Documentation & Overview
```

---

## ⚙️ Local Development Setup (การติดตั้งสำหรับทดลองรันบนเครื่อง)

### 1. Clone Repository
```bash
git clone https://github.com/kanonratwongsapan/focus-space.git
cd focus-space
```

### 2. Backend Setup
```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
RESEND_API_KEY=your_resend_api_key
ALLOWED_EMAIL_DOMAINS=rmuti.ac.th
OWNER_EMAILS=kanonrat.wo@rmuti.ac.th,piyanuch.ch@rmuti.ac.th
```

เริ่มรัน Backend Server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:5173`

---

© 2026 Focus Space Project — RMUTI Khon Kaen Campus
