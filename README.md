# Jahid Apartment Maintenance Management System

A full-stack, administrative operational workspace built with **Node.js**, **Express**, **MySQL8 (`mysql8`)**, and **Tailwind CSS**.

---

## 📁 System Architecture & Files

| File | Purpose |
|---|---|
| [`database.sql`](file:///C:/Users/capta/.gemini/antigravity/scratch/jahid-apartment-maintenance/database.sql) | SQL schema initialization script creating `maintenance_db` and the 4 required relational tables with constraints & seed data |
| [`server.js`](file:///C:/Users/capta/.gemini/antigravity/scratch/jahid-apartment-maintenance/server.js) | Complete Express REST API server using `mysql8` driver with connection pool fallbacks (`localhost`, `root`, `''`, `maintenance_db`) |
| [`public/index.html`](file:///C:/Users/capta/.gemini/antigravity/scratch/jahid-apartment-maintenance/public/index.html) | High-density administrative single-page dashboard featuring Quad-view & Tabbed views, dynamic FK dropdowns, and instant PUT/DELETE actions |
| [`test_verification.js`](file:///C:/Users/capta/.gemini/antigravity/scratch/jahid-apartment-maintenance/test_verification.js) | Automated test suite verifying schema constraints, REST endpoints, and form input bindings |

---

## 🗄️ Database Tables (`maintenance_db`)

1. **`residents`**
   - `resident_id` (INT, Primary Key)
   - `name` (VARCHAR(100))
   - `flat_no` (VARCHAR(20))
   - `phone` (VARCHAR(15))
   - `email` (VARCHAR(100))

2. **`maintainance_staff`**
   - `staff_id` (INT, Primary Key)
   - `name` (VARCHAR(100))
   - `phone` (VARCHAR(15))
   - `specialization` (VARCHAR(100))
   - `email` (VARCHAR(100))

3. **`requests`**
   - `request_id` (INT, Primary Key)
   - `resident_id` (INT, Foreign Key referencing `residents.resident_id`)
   - `staff_id` (INT, Foreign Key referencing `maintainance_staff.staff_id`)
   - `issue_type` (VARCHAR(50), Restricted: `'Plumbing'`, `'Electrical'`, `'Cleaning'`, `'Other'`)
   - `description` (TEXT)
   - `request_date` (DATETIME)
   - `status` (VARCHAR(30), Default `'Pending'`)

4. **`maintainance_records`**
   - `record_id` (INT, Primary Key)
   - `request_id` (INT, Foreign Key referencing `requests.request_id`)
   - `work_description` (TEXT)
   - `completion_date` (DATE)
   - `repair_cost` (DECIMAL(10, 2))
   - `remarks` (VARCHAR(255))

---

## 🚀 How to Run

### Step 1: Initialize Database in MySQL
Open MySQL Workbench or MySQL Command Line and run:
```sql
source C:/Users/capta/.gemini/antigravity/scratch/jahid-apartment-maintenance/database.sql;
```

### Step 2: Start Express Server
```bash
cd "C:\Users\capta\.gemini\antigravity\scratch\jahid-apartment-maintenance"
npm start
```
Open **`http://localhost:3000/`** in any web browser.

### Step 3: Run Automated Verification Tests
```bash
npm test
```
*(Runs 88 automated assertions verifying DB constraints, Express routes, and UI mappings).*
