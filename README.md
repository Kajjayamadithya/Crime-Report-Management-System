# 🛡️ Crime Report Management System (CRMS)
**Digital Intelligence & Law Enforcement Platform**

CRMS is a high-end, MERN-stack application designed to digitize the lifecycle of crime reporting. It bridges the communication gap between citizens and law enforcement through real-time tracking, automated SMS notifications, and data-driven analytics.

---

## 🚀 Core Features

### 🏛️ For Citizens (The Public Portal)
- **Digital FIR Filing**: Submit comprehensive crime reports with incident metadata and geocoded locations.
- **Evidence Vault**: Securely upload and store incident images and digital documents.
- **Live Status Tracking**: Monitor the real-time progress of cases via a dynamic investigation timeline.
- **Profile Management**: Maintain personal reporting history and contact information.

### 👮 For Police (The Investigation HQ)
- **Investigation Command Center**: A prioritized dashboard for managing assigned cases and evidence.
- **Status Protocols**: Officially update cases from *Submitted* to *Investigating* and *Resolved*.
- **Conclusion Workflow**: Record investigative notes and officially conclude cases.
- **Automated SMS Alerts**: Integration with **Twilio API** to instantly notify citizens of case outcomes.

### 📊 For Admins (System Intelligence)
- **Intelligence Stream**: A comprehensive, scrollable history of all departmental activity.
- **Crime Analytics**: Real-time data visualization (Pie/Bar charts) for crime categories and reporting velocity.
- **Officer Provisioning**: Securely authorize and manage departmental personnel accounts.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Recharts, Lucide-React.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas with Mongoose ODM.
- **Authentication**: Stateless JWT (JSON Web Tokens) & Bcrypt.js encryption.
- **Notifications**: Twilio SMS API.
- **Security**: Helmet.js, CORS Protection, and Layered Input Sanitization.

---

## 🔐 Key Updates & Security

1. **Twilio SMS Integration**: Automated investigation conclusions sent directly to complainant's mobile device with robust phone number sanitization.
2. **Collision-Resistant IDs**: Smart Mongoose pre-save hooks to ensure non-colliding sequential FIR numbers (e.g., `FIR-2026-000001`).
3. **Advanced Admin HQ**: Expanded "Intelligence Stream" supporting up to 100 recent records with a fixed-header scrollable interface.
4. **Vulnerability Mitigation**: 
   - **XSS**: React auto-escaping and content security policies.
   - **CSRF**: Bearer-token header authentication instead of cookies.
   - **NoSQL Injection**: Schema-based filtering and Mongoose data enforcement.

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Backend Configuration**:
   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secure_secret
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. **Install Dependencies**:
   ```bash
   # In /server
   npm install
   # In /client
   npm install
   ```

4. **Run the Application**:
   ```bash
   # Start Server
   npm start
   # Start Frontend
   npm run dev
   ```

---

## 📄 License
This project was developed for the **Software Engineering & Project Management** curriculum. 
© 2026 CRMS Development Team.
