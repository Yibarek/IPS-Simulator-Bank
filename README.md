# IPS Simulator Bank

A Full-Stack Banking Simulation System which can be easly Integrated with EthSwitch IPS Use Cases  

---

## 📌 Overview

IPS Simulator Bank is a full-stack digital banking simulation system built using **React (Frontend)** and **Node.js + Express (Backend)**.

The system simulates core use cases supported by the EthSwitch Instant Payment System (IPS), including:

- 💸 Peer-to-Peer (P2P) Transfers  
- 📩 Request to Pay (RTP)  
- 📱 QR Payments  
- 🔁 Return Payments  
- 📊 Transaction Monitoring  

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

### 👤 Customer & Account Management
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

## ⚙️ Installation & Setup

### 1 Clone the Repository

```bash
git clone https://github.com/Yibarek/IPS-Simulator-Bank.git
cd IPS-Simulator-Bank

### 2 create database

### 3 create Tables

### 4 Start the backend
```bash
cd backend
npm install
npm start

### 5 Start the frontend
```bash
cd frontend
npm install
npm run dev

### 6 open the portal
```bash
http://localhost/5173

