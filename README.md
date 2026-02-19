# IPS Simulator Bank

A Full-Stack Banking Simulation System which can be easly Integrated with EthSwitch IPS Use Cases  

---

## 📌 Overview

IPS Simulator Bank is a full-stack digital banking simulation system built using **React (Frontend)** and **Node.js + Express (Backend)**.

The system simulates core use cases supported by the EthSwitch Instant Payment System (IPS), including:

- Peer-to-Peer (P2P) Transfers  
- Request to Pay (RTP)  
- QR Payments  
- Return Payments  
- Transaction Monitoring  

This project is designed for learning, testing, and demonstrating IPS-related digital payment workflows.

---

## 🎯 Project Objectives

- Simulate a bank integrated with IPS
- Implement real-world digital payment flows
- Demonstrate transaction lifecycle handling
- Practice secure API development
- Build a structured full-stack banking application

---

## System Architecture

Frontend (React)  
⬇  
Backend API (Express.js)  
⬇  
Database (MySQL)  
⬇  
Simulated IPS Processing Layer 

---

## 🚀 Features – Phase 1

### Customer & Account Management
- Create customers
- Create bank accounts
- Fetch customer and account details

###  P2P Transfer
- Verify sender account
- Verify receiver account
- Save transaction record
- Handle transaction status

###  Request to Pay (RTP)
- RTP initiation
- RTP acceptance
- RTP rejection
- RTP cancellation
- RTP status tracking

###  QR Payment
- QR payment simulation
- Transaction validation
- Record payment history

### Return Payment
- Initiate return request
- Reverse completed transactions
- Update transaction state

---

## 🛠️ Tech Stack

### Frontend
- React
- Axios
- Bootstrap

### Backend
- Node.js
- Express.js
- JWT Authentication
- RESTful APIs

### Database
- MySQL (Relational Database)

---

## 🔐 Authentication

- JWT-based authentication

---

## 📂 Project Structure

IPS-Simulator-Bank

│
├── client/ # React Frontend

├── server/ # Express Backend

└── database/ # SQL Scripts


---

# ⚙️ Installation & Setup

Follow the steps below to run the project locally.

---

## 1 Clone the Repository

```bash
git clone https://github.com/Yibarek/IPS-Simulator-Bank.git
cd IPS-Simulator-Bank
```

---

## 2 Create the Database

Create a new database in your local SQL server.

Example (MySQL):

```sql
CREATE DATABASE ips_simulator_bank;
```

---

## 3 Create Required Tables

Run the SQL scripts provided in the `/database` folder  
or manually execute your table creation scripts before starting the backend.

---

## 4 Configure Environment Variables

Inside the `backend` folder, create a `.env` file and add:

```
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ips_simulator_bank
JWT_SECRET=your_secret_key
```

---

## 5 Start the Backend

```bash
cd backend
npm install
npm start
```

Backend runs at:

```
http://localhost:5000
```

---

## 6️⃣ Start the Frontend

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

## 7️⃣ Open the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---
 

---

## 👨‍💻 Author

**Yitbarek Wondatir**  
Full-Stack Developer  

---

## 📜 License

This project is developed for educational and simulation purposes.
