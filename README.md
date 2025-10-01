# 🧠 Psychiatry Department EMR – PGI

An **Electronic Medical Record (EMR) System** for the Psychiatry Department at PGI.
This system digitizes psychiatric records, clinical notes, prescriptions, and follow-ups to improve healthcare delivery and research.

---

## 🚀 Tech Stack

* **Frontend:** React.js + Vite
* **Backend:** Node.js (Express)
* **Database:** PostgreSQL
* **API Documentation:** Swagger

---

## 📂 Project Structure

```
psychiatry-emr/
│── backend/         # Node.js + Express API
│   ├── src/
│   ├── routes/
│   ├── models/
│   ├── swagger/     # Swagger API docs
│   └── server.js
│
│── frontend/        # React + Vite UI
│   ├── src/
│   ├── components/
│   └── App.jsx
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
https://github.com/ihubInv/EMRS_PGI.git
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a **.env** file in `/backend`:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/psychiatry_emr
```

Run migrations:

```bash
npx prisma migrate dev
```

Start backend:

```bash
npm run dev
```

Swagger Docs available at:

```
http://localhost:5000/api-docs
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📖 Features

* 🧾 Patient registration & demographic details
* 📝 Psychiatric history & clinical notes
* 💊 Prescription & lab report management
* 📅 Appointment scheduling & follow-ups
* 🔐 Role-based authentication (doctor, staff, admin)
* 📊 Analytics & reporting dashboard
* 📚 API Documentation via Swagger

---

## 📸 Screenshots *(Optional)*

*Add UI screenshots here once available.*

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a PR.


