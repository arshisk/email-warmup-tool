# 💌 Email Warm-Up Tool

A lightweight and customizable email warm-up tool built with **Node.js**, **React**, and **SQLite**.

It automatically sends emails from a single Gmail account to one or more receivers on a schedule to help improve deliverability and avoid spam filters.

---

## ✨ Features

- ✅ Connects to Gmail using SMTP and IMAP (via App Password)
- 🔁 Automatically sends warm-up emails on a schedule
- 💬 Simulates replies and marks emails as read to mimic human behavior
- 📊 React dashboard to view logs and monitor warm-up activity
- 🗂 SQLite database for managing sender/receiver accounts and logs
- 🛠 No external paid APIs — fully self-hosted and secure

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express, Nodemailer, IMAP-simple, SQLite3  
- **Frontend:** React, Material-UI, Axios  
- **Storage:** SQLite `.db` file (lightweight local database)  
- **Tooling:** GitHub, npm, GitHub Desktop

---

## 🧰 Setup Instructions

### ✅ Prerequisites

- Node.js and npm installed
- Gmail account with **2FA enabled**
- An **App Password** generated for your Gmail (not your regular password)

---

### 🔧 Step-by-Step Guide

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/email-warmup-tool.git
cd email-warmup-tool


#### 2. Install backend dependencies


```bash
npm install

#### 3. Create a .env file in the root folder
In the email-warmup-tool folder, create a file named .env and add:
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
⚠️ Make sure you've enabled 2-Step Verification in your Gmail and generated an App Password from Google App Passwords.

#### 4. Start the backend server:
node server.js

You should see logs like:
Server running on port 5000
Connected to SQLite database.

#### 5. Run the frontend (React)
cd frontend
npm install
npm start

#### 6. Add accounts & receivers from the frontend

    Use the dashboard to:

        Add your sender email (same one from .env)

        Add one or more receiver emails

    Once added, the scheduler will automatically begin sending warm-up emails and simulating replies.

