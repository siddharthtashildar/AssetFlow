# 🚀 AssetFlow - Enterprise Asset & Resource Management System

AssetFlow is a modern Enterprise Resource Planning (ERP) application designed to simplify how organizations manage physical assets and shared resources. It provides a centralized platform to register, allocate, maintain, audit, and monitor assets while ensuring secure role-based workflows and real-time operational visibility.

---

## 📌 Problem Statement

Organizations often rely on spreadsheets or manual records to track equipment, furniture, vehicles, meeting rooms, and other shared resources. AssetFlow digitizes this process by providing:

* Centralized asset management
* Resource booking with conflict prevention
* Maintenance approval workflow
* Asset allocation and transfer management
* Scheduled audit cycles
* Notifications and activity tracking
* Reports and analytics dashboard

---

## ✨ Features

### 🔐 Authentication & Authorization

* Secure Login & Signup
* JWT Authentication
* Forgot Password
* Role-Based Access Control (RBAC)
* Session Management

### 👥 Organization Setup

* Department Management
* Asset Category Management
* Employee Directory
* Admin-controlled Role Assignment

### 📦 Asset Management

* Register New Assets
* Auto-generated Asset Tags
* Asset Search & Filters
* Asset Lifecycle Tracking
* Asset History

### 🔄 Asset Allocation & Transfers

* Allocate Assets to Employees
* Return Assets
* Transfer Request Workflow
* Double Allocation Prevention
* Overdue Return Tracking

### 📅 Resource Booking

* Shared Resource Booking
* Calendar View
* Time Slot Conflict Detection
* Booking Status Management
* Cancel & Reschedule Bookings

### 🛠 Maintenance Management

* Raise Maintenance Requests
* Approval Workflow
* Technician Assignment
* Maintenance History
* Automatic Asset Status Updates

### ✅ Asset Audit

* Create Audit Cycles
* Assign Auditors
* Verify Assets
* Auto-generated Discrepancy Reports
* Audit History

### 📊 Dashboard & Reports

* KPI Dashboard
* Asset Utilization
* Department-wise Allocation
* Maintenance Trends
* Booking Heatmap
* Export Reports

### 🔔 Notifications & Activity Logs

* Real-time Notifications
* Overdue Alerts
* Booking Reminders
* Maintenance Updates
* Complete Activity History

---

# 👤 User Roles

## Admin

* Manage Departments
* Manage Asset Categories
* Manage Employees
* Assign Roles
* View Reports
* Manage Audit Cycles

## Asset Manager

* Register Assets
* Allocate Assets
* Approve Transfers
* Approve Maintenance Requests
* Manage Returns

## Department Head

* View Department Assets
* Approve Department Transfers
* Book Resources

## Employee

* View Assigned Assets
* Book Shared Resources
* Raise Maintenance Requests
* Request Asset Transfers
* Initiate Asset Returns

---

# 🛠 Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* React
* shadcn/ui

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* PostgreSQL

### Authentication

* JWT
* bcrypt

### Additional Tools

* Cloudinary
* Socket.io
* Recharts
* FullCalendar

---

# 📂 Project Structure

```text
AssetFlow
│
├── client
│   ├── app
│   ├── components
│   ├── hooks
│   ├── lib
│   └── styles
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── prisma
│   └── utils
│
└── README.md
```

---

# 🔄 Asset Lifecycle

```text
Available
    │
    ├── Allocate
    ▼
Allocated
    │
    ├── Return
    ▼
Available

Allocated
    │
    ├── Maintenance Request
    ▼
Under Maintenance
    │
    ├── Resolved
    ▼
Available

Available
    │
    ├── Audit Missing
    ▼
Lost

Available
    │
    ├── Dispose
    ▼
Disposed
```

---

# 📅 Booking Workflow

```text
Select Resource
        │
        ▼
Choose Time Slot
        │
        ▼
Check Overlap
        │
   ┌────┴─────┐
   │          │
Conflict     No Conflict
   │          │
Rejected   Booking Created
```

---

# 🔄 Maintenance Workflow

```text
Raise Request
      │
      ▼
Pending Approval
      │
 ┌────┴────┐
 │         │
Reject   Approve
            │
            ▼
Technician Assigned
            │
            ▼
In Progress
            │
            ▼
Resolved
            │
            ▼
Asset Available
```

---

# 📈 Dashboard KPIs

* Total Assets
* Available Assets
* Allocated Assets
* Active Bookings
* Maintenance Today
* Pending Transfers
* Upcoming Returns
* Overdue Returns
* Audit Progress

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone <repository-url>
```

## Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

## Configure Environment Variables

Create a `.env` file and configure:

```env
DATABASE_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Run the Development Servers

Frontend

```bash
npm run dev
```

Backend

```bash
npm run dev
```

---

# 🎯 Future Enhancements

* QR Code Scanning
* Barcode Support
* AI-powered Maintenance Prediction
* Mobile Application
* Push Notifications
* Bulk Asset Import
* Advanced Analytics
* Multi-Organization Support

---

# 📄 License

This project was developed for a hackathon and is intended for educational and demonstration purposes.
