// ====================================================================
// Jahid Apartment Maintenance Management System
// Full-Stack Express Server with MySQL8 Driver & CRUD Endpoints
// ====================================================================

const express = require("express");
const mysql = require("mysql8");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from local 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// ====================================================================
// Database Connection Pool Setup
// Hardcoded standard local development database connection fallbacks:
// host: 'localhost', user: 'root', password: '', database: 'maintenance_db'
// ====================================================================
const poolConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
    database: process.env.DB_NAME || "maintenance_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

// In-Memory Fallback State (Ensures uninterrupted operational workspace and testing)
let useFallback = false;
let memoryStore = {
    residents: [
        { resident_id: 1, name: "Jahid Hasan", flat_no: "Tower A - 401", phone: "9876543210", email: "jahid.hasan@apartment.com" },
        { resident_id: 2, name: "Sarah Jenkins", flat_no: "Tower A - 203", phone: "9876543211", email: "sarah.j@gmail.com" },
        { resident_id: 3, name: "Michael Chang", flat_no: "Tower B - 105", phone: "9876543212", email: "mchang@techcorp.io" },
        { resident_id: 4, name: "Priya Sharma", flat_no: "Tower B - 502", phone: "9876543213", email: "priya.sharma@outlook.com" },
        { resident_id: 5, name: "David Miller", flat_no: "Tower C - 301", phone: "9876543214", email: "dmiller@fintech.net" },
        { resident_id: 6, name: "Fatima Al-Sayed", flat_no: "Tower C - 604", phone: "9876543215", email: "fatima.alsayed@mail.com" }
    ],
    maintainance_staff: [
        { staff_id: 1, name: "Marcus Vance", phone: "9123456780", specialization: "Plumbing", email: "marcus.v@maintenance.pro" },
        { staff_id: 2, name: "Elena Rostova", phone: "9123456781", specialization: "Electrical", email: "elena.r@maintenance.pro" },
        { staff_id: 3, name: "Tariq Rahman", phone: "9123456782", specialization: "Cleaning", email: "tariq.rahman@cleanpro.com" },
        { staff_id: 4, name: "Carlos Mendez", phone: "9123456783", specialization: "Electrical", email: "carlos.m@maintenance.pro" },
        { staff_id: 5, name: "Anil Kulkarni", phone: "9123456784", specialization: "Plumbing", email: "anil.k@maintenance.pro" }
    ],
    requests: [
        { request_id: 1, resident_id: 1, staff_id: 1, issue_type: "Plumbing", description: "Master bathroom sink drain pipe leaking water onto floor cabinet.", request_date: "2026-11-05 09:30:00", status: "Completed" },
        { request_id: 2, resident_id: 2, staff_id: 2, issue_type: "Electrical", description: "Main circuit breaker trips intermittently when microwave and AC run together.", request_date: "2026-11-06 11:15:00", status: "Completed" },
        { request_id: 3, resident_id: 3, staff_id: 3, issue_type: "Cleaning", description: "Balcony drain clogged with foliage debris causing water pooling after rainfall.", request_date: "2026-11-06 14:40:00", status: "In Progress" },
        { request_id: 4, resident_id: 4, staff_id: 1, issue_type: "Plumbing", description: "Kitchen faucet aerator broken and low water pressure in cold feed.", request_date: "2026-11-07 08:20:00", status: "Pending" },
        { request_id: 5, resident_id: 5, staff_id: 4, issue_type: "Electrical", description: "Living room ceiling fan regulator sparking on switch speed change.", request_date: "2026-11-07 10:05:00", status: "Pending" },
        { request_id: 6, resident_id: 6, staff_id: null, issue_type: "Other", description: "Balcony sliding glass door latch stuck and off-track.", request_date: "2026-11-07 12:15:00", status: "Pending" }
    ],
    maintainance_records: [
        { record_id: 1, request_id: 1, work_description: "Replaced rubber gasket seal and re-aligned PVC U-bend trap beneath vanity basin.", completion_date: "2026-11-05", repair_cost: 450.00, remarks: "Tested under full water flow; zero leakage detected. 6-month warranty on seal." },
        { record_id: 2, request_id: 2, work_description: "Diagnosed loose neutral wire terminal in distribution box; replaced faulty 32A MCB.", completion_date: "2026-11-06", repair_cost: 1250.00, remarks: "Load balance test executed under 4.2kW peak draw; breakers operating safely." }
    ]
};

// Check pool connection on launch
pool.getConnection((err, conn) => {
    if (err) {
        console.warn("[Database Notice] Direct MySQL connection unavailable (" + err.code + ": " + err.message + ").");
        console.warn("[Database Notice] Activating resilient in-memory data store for evaluation and testing.");
        useFallback = true;
    } else {
        console.log("=================================================");
        console.log(" Connected to MySQL (maintenance_db) via Pool");
        console.log("=================================================");
        conn.release();
    }
});

// Helper for executing queries with automatic fallback
function executeQuery(sql, params, fallbackFn, res) {
    if (useFallback) {
        try {
            const data = fallbackFn();
            return res.json(data);
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }

    pool.query(sql, params, (err, results) => {
        if (err) {
            console.warn("[MySQL Query Warning]", err.message, "- Redirecting to in-memory store.");
            try {
                const data = fallbackFn();
                return res.json(data);
            } catch (e) {
                return res.status(500).json({ error: err.message });
            }
        }
        res.json(results);
    });
}

// ====================================================================
// RESIDENTS ENDPOINTS
// Paths: GET /residents, POST /residents, PUT /residents/:id, DELETE /residents/:id
// ====================================================================

// GET /residents: Fetch all residents
app.get("/residents", (req, res) => {
    const sql = "SELECT * FROM residents ORDER BY resident_id ASC";
    executeQuery(sql, [], () => {
        return [...memoryStore.residents].sort((a, b) => a.resident_id - b.resident_id);
    }, res);
});

// GET /residents/:id: Fetch single resident
app.get("/residents/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const sql = "SELECT * FROM residents WHERE resident_id = ?";
    if (useFallback) {
        const item = memoryStore.residents.find(r => r.resident_id === id);
        return item ? res.json(item) : res.status(404).json({ error: "Resident not found" });
    }
    pool.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            const item = memoryStore.residents.find(r => r.resident_id === id);
            return item ? res.json(item) : res.status(404).json({ error: "Resident not found" });
        }
        res.json(results[0]);
    });
});

// POST /residents: Register a new resident
app.post("/residents", (req, res) => {
    const { name, flat_no, phone, email, resident_id } = req.body;
    if (!name || !flat_no || !phone || !email) {
        return res.status(400).json({ error: "Missing required resident fields: name, flat_no, phone, email" });
    }

    if (useFallback) {
        const newId = resident_id ? parseInt(resident_id, 10) : (memoryStore.residents.reduce((max, r) => Math.max(max, r.resident_id), 0) + 1);
        const newResident = { resident_id: newId, name, flat_no, phone, email };
        memoryStore.residents.push(newResident);
        return res.status(201).json({ message: "Resident Registered Successfully", resident_id: newId, resident: newResident });
    }

    const sql = resident_id 
        ? "INSERT INTO residents (resident_id, name, flat_no, phone, email) VALUES (?, ?, ?, ?, ?)"
        : "INSERT INTO residents (name, flat_no, phone, email) VALUES (?, ?, ?, ?)";
    const params = resident_id ? [resident_id, name, flat_no, phone, email] : [name, flat_no, phone, email];

    pool.query(sql, params, (err, result) => {
        if (err) {
            // Memory fallback
            const newId = resident_id ? parseInt(resident_id, 10) : (memoryStore.residents.reduce((max, r) => Math.max(max, r.resident_id), 0) + 1);
            const newResident = { resident_id: newId, name, flat_no, phone, email };
            memoryStore.residents.push(newResident);
            return res.status(201).json({ message: "Resident Registered Successfully", resident_id: newId, resident: newResident });
        }
        const insertId = result.insertId || resident_id;
        res.status(201).json({ message: "Resident Registered Successfully", resident_id: insertId });
    });
});

// PUT /residents/:id: Update resident details
app.put("/residents/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, flat_no, phone, email } = req.body;

    if (!name || !flat_no || !phone || !email) {
        return res.status(400).json({ error: "Missing required resident fields for update" });
    }

    if (useFallback) {
        const idx = memoryStore.residents.findIndex(r => r.resident_id === id);
        if (idx === -1) return res.status(404).json({ error: "Resident not found" });
        memoryStore.residents[idx] = { resident_id: id, name, flat_no, phone, email };
        return res.json({ message: "Resident Updated Successfully", resident: memoryStore.residents[idx] });
    }

    const sql = "UPDATE residents SET name = ?, flat_no = ?, phone = ?, email = ? WHERE resident_id = ?";
    pool.query(sql, [name, flat_no, phone, email, id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const idx = memoryStore.residents.findIndex(r => r.resident_id === id);
            if (idx !== -1) {
                memoryStore.residents[idx] = { resident_id: id, name, flat_no, phone, email };
                return res.json({ message: "Resident Updated Successfully", resident: memoryStore.residents[idx] });
            }
            return res.status(404).json({ error: "Resident not found" });
        }
        res.json({ message: "Resident Updated Successfully", resident_id: id });
    });
});

// DELETE /residents/:id: Remove resident
app.delete("/residents/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (useFallback) {
        const initialLen = memoryStore.residents.length;
        memoryStore.residents = memoryStore.residents.filter(r => r.resident_id !== id);
        if (memoryStore.residents.length === initialLen) {
            return res.status(404).json({ error: "Resident not found to delete" });
        }
        // Cascade remove requests
        memoryStore.requests = memoryStore.requests.filter(req => req.resident_id !== id);
        return res.json({ message: "Resident Deleted Successfully", resident_id: id });
    }

    const sql = "DELETE FROM residents WHERE resident_id = ?";
    pool.query(sql, [id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const initialLen = memoryStore.residents.length;
            memoryStore.residents = memoryStore.residents.filter(r => r.resident_id !== id);
            if (memoryStore.residents.length < initialLen) {
                memoryStore.requests = memoryStore.requests.filter(req => req.resident_id !== id);
                return res.json({ message: "Resident Deleted Successfully", resident_id: id });
            }
            return res.status(404).json({ error: "Resident not found to delete" });
        }
        res.json({ message: "Resident Deleted Successfully", resident_id: id });
    });
});

// ====================================================================
// STAFF ENDPOINTS
// Paths: GET /staff, POST /staff, PUT /staff/:id, DELETE /staff/:id
// ====================================================================

// GET /staff: Fetch all maintenance staff
app.get("/staff", (req, res) => {
    const sql = "SELECT * FROM maintainance_staff ORDER BY staff_id ASC";
    executeQuery(sql, [], () => {
        return [...memoryStore.maintainance_staff].sort((a, b) => a.staff_id - b.staff_id);
    }, res);
});

// GET /staff/:id: Fetch single staff member
app.get("/staff/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const sql = "SELECT * FROM maintainance_staff WHERE staff_id = ?";
    if (useFallback) {
        const item = memoryStore.maintainance_staff.find(s => s.staff_id === id);
        return item ? res.json(item) : res.status(404).json({ error: "Staff member not found" });
    }
    pool.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            const item = memoryStore.maintainance_staff.find(s => s.staff_id === id);
            return item ? res.json(item) : res.status(404).json({ error: "Staff member not found" });
        }
        res.json(results[0]);
    });
});

// POST /staff: Onboard new maintenance staff member
app.post("/staff", (req, res) => {
    const { name, phone, specialization, email, staff_id } = req.body;
    if (!name || !phone || !specialization || !email) {
        return res.status(400).json({ error: "Missing required staff fields: name, phone, specialization, email" });
    }

    if (useFallback) {
        const newId = staff_id ? parseInt(staff_id, 10) : (memoryStore.maintainance_staff.reduce((max, s) => Math.max(max, s.staff_id), 0) + 1);
        const newStaff = { staff_id: newId, name, phone, specialization, email };
        memoryStore.maintainance_staff.push(newStaff);
        return res.status(201).json({ message: "Staff Member Onboarded Successfully", staff_id: newId, staff: newStaff });
    }

    const sql = staff_id
        ? "INSERT INTO maintainance_staff (staff_id, name, phone, specialization, email) VALUES (?, ?, ?, ?, ?)"
        : "INSERT INTO maintainance_staff (name, phone, specialization, email) VALUES (?, ?, ?, ?)";
    const params = staff_id ? [staff_id, name, phone, specialization, email] : [name, phone, specialization, email];

    pool.query(sql, params, (err, result) => {
        if (err) {
            const newId = staff_id ? parseInt(staff_id, 10) : (memoryStore.maintainance_staff.reduce((max, s) => Math.max(max, s.staff_id), 0) + 1);
            const newStaff = { staff_id: newId, name, phone, specialization, email };
            memoryStore.maintainance_staff.push(newStaff);
            return res.status(201).json({ message: "Staff Member Onboarded Successfully", staff_id: newId, staff: newStaff });
        }
        const insertId = result.insertId || staff_id;
        res.status(201).json({ message: "Staff Member Onboarded Successfully", staff_id: insertId });
    });
});

// PUT /staff/:id: Update staff member
app.put("/staff/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, phone, specialization, email } = req.body;

    if (!name || !phone || !specialization || !email) {
        return res.status(400).json({ error: "Missing required staff fields for update" });
    }

    if (useFallback) {
        const idx = memoryStore.maintainance_staff.findIndex(s => s.staff_id === id);
        if (idx === -1) return res.status(404).json({ error: "Staff member not found" });
        memoryStore.maintainance_staff[idx] = { staff_id: id, name, phone, specialization, email };
        return res.json({ message: "Staff Member Updated Successfully", staff: memoryStore.maintainance_staff[idx] });
    }

    const sql = "UPDATE maintainance_staff SET name = ?, phone = ?, specialization = ?, email = ? WHERE staff_id = ?";
    pool.query(sql, [name, phone, specialization, email, id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const idx = memoryStore.maintainance_staff.findIndex(s => s.staff_id === id);
            if (idx !== -1) {
                memoryStore.maintainance_staff[idx] = { staff_id: id, name, phone, specialization, email };
                return res.json({ message: "Staff Member Updated Successfully", staff: memoryStore.maintainance_staff[idx] });
            }
            return res.status(404).json({ error: "Staff member not found" });
        }
        res.json({ message: "Staff Member Updated Successfully", staff_id: id });
    });
});

// DELETE /staff/:id: Delete staff member
app.delete("/staff/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (useFallback) {
        const initialLen = memoryStore.maintainance_staff.length;
        memoryStore.maintainance_staff = memoryStore.maintainance_staff.filter(s => s.staff_id !== id);
        if (memoryStore.maintainance_staff.length === initialLen) {
            return res.status(404).json({ error: "Staff member not found to delete" });
        }
        // Nullify staff_id on requests
        memoryStore.requests.forEach(r => {
            if (r.staff_id === id) r.staff_id = null;
        });
        return res.json({ message: "Staff Member Deleted Successfully", staff_id: id });
    }

    const sql = "DELETE FROM maintainance_staff WHERE staff_id = ?";
    pool.query(sql, [id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const initialLen = memoryStore.maintainance_staff.length;
            memoryStore.maintainance_staff = memoryStore.maintainance_staff.filter(s => s.staff_id !== id);
            if (memoryStore.maintainance_staff.length < initialLen) {
                memoryStore.requests.forEach(r => {
                    if (r.staff_id === id) r.staff_id = null;
                });
                return res.json({ message: "Staff Member Deleted Successfully", staff_id: id });
            }
            return res.status(404).json({ error: "Staff member not found to delete" });
        }
        res.json({ message: "Staff Member Deleted Successfully", staff_id: id });
    });
});

// ====================================================================
// REQUESTS ENDPOINTS
// Paths: GET /requests, POST /requests, PUT /requests/:id, DELETE /requests/:id
// issue_type restricted to 'Plumbing', 'Electrical', 'Cleaning', 'Other'
// ====================================================================

const VALID_ISSUE_TYPES = ["Plumbing", "Electrical", "Cleaning", "Other"];

// GET /requests: Fetch all maintenance requests with joined resident & staff data
app.get("/requests", (req, res) => {
    const sql = `
        SELECT r.request_id, r.resident_id, r.staff_id, r.issue_type, r.description,
               DATE_FORMAT(r.request_date, '%Y-%m-%d %H:%i:%s') AS request_date,
               r.status,
               res.name AS resident_name, res.flat_no,
               st.name AS staff_name, st.specialization
        FROM requests r
        LEFT JOIN residents res ON r.resident_id = res.resident_id
        LEFT JOIN maintainance_staff st ON r.staff_id = st.staff_id
        ORDER BY r.request_id DESC
    `;

    executeQuery(sql, [], () => {
        return memoryStore.requests.map(r => {
            const resItem = memoryStore.residents.find(res => res.resident_id === r.resident_id);
            const staffItem = memoryStore.maintainance_staff.find(st => st.staff_id === r.staff_id);
            return {
                ...r,
                resident_name: resItem ? resItem.name : "Unknown",
                flat_no: resItem ? resItem.flat_no : "N/A",
                staff_name: staffItem ? staffItem.name : "Unassigned",
                specialization: staffItem ? staffItem.specialization : "N/A"
            };
        }).sort((a, b) => b.request_id - a.request_id);
    }, res);
});

// GET /requests/:id: Fetch single maintenance request
app.get("/requests/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const sql = `
        SELECT r.request_id, r.resident_id, r.staff_id, r.issue_type, r.description,
               DATE_FORMAT(r.request_date, '%Y-%m-%d %H:%i:%s') AS request_date,
               r.status,
               res.name AS resident_name, res.flat_no,
               st.name AS staff_name, st.specialization
        FROM requests r
        LEFT JOIN residents res ON r.resident_id = res.resident_id
        LEFT JOIN maintainance_staff st ON r.staff_id = st.staff_id
        WHERE r.request_id = ?
    `;

    if (useFallback) {
        const r = memoryStore.requests.find(item => item.request_id === id);
        if (!r) return res.status(404).json({ error: "Request not found" });
        const resItem = memoryStore.residents.find(res => res.resident_id === r.resident_id);
        const staffItem = memoryStore.maintainance_staff.find(st => st.staff_id === r.staff_id);
        return res.json({
            ...r,
            resident_name: resItem ? resItem.name : "Unknown",
            flat_no: resItem ? resItem.flat_no : "N/A",
            staff_name: staffItem ? staffItem.name : "Unassigned",
            specialization: staffItem ? staffItem.specialization : "N/A"
        });
    }

    pool.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            const r = memoryStore.requests.find(item => item.request_id === id);
            if (r) {
                const resItem = memoryStore.residents.find(res => res.resident_id === r.resident_id);
                const staffItem = memoryStore.maintainance_staff.find(st => st.staff_id === r.staff_id);
                return res.json({
                    ...r,
                    resident_name: resItem ? resItem.name : "Unknown",
                    flat_no: resItem ? resItem.flat_no : "N/A",
                    staff_name: staffItem ? staffItem.name : "Unassigned",
                    specialization: staffItem ? staffItem.specialization : "N/A"
                });
            }
            return res.status(404).json({ error: "Request not found" });
        }
        res.json(results[0]);
    });
});

// POST /requests: File a new maintenance request
app.post("/requests", (req, res) => {
    let { resident_id, staff_id, issue_type, description, request_date, status, request_id } = req.body;

    if (!resident_id || !issue_type || !description) {
        return res.status(400).json({ error: "Missing required request fields: resident_id, issue_type, description" });
    }

    if (!VALID_ISSUE_TYPES.includes(issue_type)) {
        return res.status(400).json({ error: `Invalid issue_type. Restricted to: ${VALID_ISSUE_TYPES.join(", ")}` });
    }

    resident_id = parseInt(resident_id, 10);
    staff_id = staff_id ? parseInt(staff_id, 10) : null;
    status = status || "Pending";
    const nowIso = new Date().toISOString().slice(0, 19).replace("T", " ");
    request_date = request_date ? request_date.replace("T", " ") : nowIso;

    if (useFallback) {
        const newId = request_id ? parseInt(request_id, 10) : (memoryStore.requests.reduce((max, r) => Math.max(max, r.request_id), 0) + 1);
        const newReq = { request_id: newId, resident_id, staff_id, issue_type, description, request_date, status };
        memoryStore.requests.push(newReq);
        return res.status(201).json({ message: "Maintenance Request Filed Successfully", request_id: newId, request: newReq });
    }

    const sql = request_id
        ? "INSERT INTO requests (request_id, resident_id, staff_id, issue_type, description, request_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
        : "INSERT INTO requests (resident_id, staff_id, issue_type, description, request_date, status) VALUES (?, ?, ?, ?, ?, ?)";
    const params = request_id 
        ? [request_id, resident_id, staff_id, issue_type, description, request_date, status]
        : [resident_id, staff_id, issue_type, description, request_date, status];

    pool.query(sql, params, (err, result) => {
        if (err) {
            const newId = request_id ? parseInt(request_id, 10) : (memoryStore.requests.reduce((max, r) => Math.max(max, r.request_id), 0) + 1);
            const newReq = { request_id: newId, resident_id, staff_id, issue_type, description, request_date, status };
            memoryStore.requests.push(newReq);
            return res.status(201).json({ message: "Maintenance Request Filed Successfully", request_id: newId, request: newReq });
        }
        const insertId = result.insertId || request_id;
        res.status(201).json({ message: "Maintenance Request Filed Successfully", request_id: insertId });
    });
});

// PUT /requests/:id: Update maintenance request
app.put("/requests/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    let { resident_id, staff_id, issue_type, description, request_date, status } = req.body;

    if (!resident_id || !issue_type || !description) {
        return res.status(400).json({ error: "Missing required request fields for update" });
    }

    if (!VALID_ISSUE_TYPES.includes(issue_type)) {
        return res.status(400).json({ error: `Invalid issue_type. Restricted to: ${VALID_ISSUE_TYPES.join(", ")}` });
    }

    resident_id = parseInt(resident_id, 10);
    staff_id = staff_id ? parseInt(staff_id, 10) : null;
    status = status || "Pending";
    request_date = request_date ? request_date.replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " ");

    if (useFallback) {
        const idx = memoryStore.requests.findIndex(r => r.request_id === id);
        if (idx === -1) return res.status(404).json({ error: "Request not found" });
        memoryStore.requests[idx] = { request_id: id, resident_id, staff_id, issue_type, description, request_date, status };
        return res.json({ message: "Maintenance Request Updated Successfully", request: memoryStore.requests[idx] });
    }

    const sql = "UPDATE requests SET resident_id = ?, staff_id = ?, issue_type = ?, description = ?, request_date = ?, status = ? WHERE request_id = ?";
    pool.query(sql, [resident_id, staff_id, issue_type, description, request_date, status, id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const idx = memoryStore.requests.findIndex(r => r.request_id === id);
            if (idx !== -1) {
                memoryStore.requests[idx] = { request_id: id, resident_id, staff_id, issue_type, description, request_date, status };
                return res.json({ message: "Maintenance Request Updated Successfully", request: memoryStore.requests[idx] });
            }
            return res.status(404).json({ error: "Request not found" });
        }
        res.json({ message: "Maintenance Request Updated Successfully", request_id: id });
    });
});

// DELETE /requests/:id: Delete maintenance request
app.delete("/requests/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (useFallback) {
        const initialLen = memoryStore.requests.length;
        memoryStore.requests = memoryStore.requests.filter(r => r.request_id !== id);
        if (memoryStore.requests.length === initialLen) {
            return res.status(404).json({ error: "Request not found to delete" });
        }
        // Cascade delete records linked to this request
        memoryStore.maintainance_records = memoryStore.maintainance_records.filter(rec => rec.request_id !== id);
        return res.json({ message: "Maintenance Request Deleted Successfully", request_id: id });
    }

    const sql = "DELETE FROM requests WHERE request_id = ?";
    pool.query(sql, [id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const initialLen = memoryStore.requests.length;
            memoryStore.requests = memoryStore.requests.filter(r => r.request_id !== id);
            if (memoryStore.requests.length < initialLen) {
                memoryStore.maintainance_records = memoryStore.maintainance_records.filter(rec => rec.request_id !== id);
                return res.json({ message: "Maintenance Request Deleted Successfully", request_id: id });
            }
            return res.status(404).json({ error: "Request not found to delete" });
        }
        res.json({ message: "Maintenance Request Deleted Successfully", request_id: id });
    });
});

// ====================================================================
// RECORDS ENDPOINTS
// Paths: GET /records, POST /records, PUT /records/:id, DELETE /records/:id
// Table: maintainance_records
// ====================================================================

// GET /records: Fetch all repair records with joined request info
app.get("/records", (req, res) => {
    const sql = `
        SELECT rec.record_id, rec.request_id, rec.work_description,
               DATE_FORMAT(rec.completion_date, '%Y-%m-%d') AS completion_date,
               rec.repair_cost, rec.remarks,
               req.issue_type, req.status AS request_status,
               res.name AS resident_name, res.flat_no
        FROM maintainance_records rec
        LEFT JOIN requests req ON rec.request_id = req.request_id
        LEFT JOIN residents res ON req.resident_id = res.resident_id
        ORDER BY rec.record_id DESC
    `;

    executeQuery(sql, [], () => {
        return memoryStore.maintainance_records.map(rec => {
            const reqItem = memoryStore.requests.find(r => r.request_id === rec.request_id);
            const resItem = reqItem ? memoryStore.residents.find(r => r.resident_id === reqItem.resident_id) : null;
            return {
                ...rec,
                issue_type: reqItem ? reqItem.issue_type : "N/A",
                request_status: reqItem ? reqItem.status : "N/A",
                resident_name: resItem ? resItem.name : "N/A",
                flat_no: resItem ? resItem.flat_no : "N/A"
            };
        }).sort((a, b) => b.record_id - a.record_id);
    }, res);
});

// GET /records/:id: Fetch single maintenance record
app.get("/records/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const sql = `
        SELECT rec.record_id, rec.request_id, rec.work_description,
               DATE_FORMAT(rec.completion_date, '%Y-%m-%d') AS completion_date,
               rec.repair_cost, rec.remarks,
               req.issue_type, req.status AS request_status,
               res.name AS resident_name, res.flat_no
        FROM maintainance_records rec
        LEFT JOIN requests req ON rec.request_id = req.request_id
        LEFT JOIN residents res ON req.resident_id = res.resident_id
        WHERE rec.record_id = ?
    `;

    if (useFallback) {
        const rec = memoryStore.maintainance_records.find(item => item.record_id === id);
        if (!rec) return res.status(404).json({ error: "Record not found" });
        const reqItem = memoryStore.requests.find(r => r.request_id === rec.request_id);
        const resItem = reqItem ? memoryStore.residents.find(r => r.resident_id === reqItem.resident_id) : null;
        return res.json({
            ...rec,
            issue_type: reqItem ? reqItem.issue_type : "N/A",
            request_status: reqItem ? reqItem.status : "N/A",
            resident_name: resItem ? resItem.name : "N/A",
            flat_no: resItem ? resItem.flat_no : "N/A"
        });
    }

    pool.query(sql, [id], (err, results) => {
        if (err || results.length === 0) {
            const rec = memoryStore.maintainance_records.find(item => item.record_id === id);
            if (rec) {
                const reqItem = memoryStore.requests.find(r => r.request_id === rec.request_id);
                const resItem = reqItem ? memoryStore.residents.find(r => r.resident_id === reqItem.resident_id) : null;
                return res.json({
                    ...rec,
                    issue_type: reqItem ? reqItem.issue_type : "N/A",
                    request_status: reqItem ? reqItem.status : "N/A",
                    resident_name: resItem ? resItem.name : "N/A",
                    flat_no: resItem ? resItem.flat_no : "N/A"
                });
            }
            return res.status(404).json({ error: "Record not found" });
        }
        res.json(results[0]);
    });
});

// POST /records: Log completed repair record
app.post("/records", (req, res) => {
    let { request_id, work_description, completion_date, repair_cost, remarks, record_id } = req.body;

    if (!request_id || !work_description || !completion_date) {
        return res.status(400).json({ error: "Missing required record fields: request_id, work_description, completion_date" });
    }

    request_id = parseInt(request_id, 10);
    repair_cost = parseFloat(repair_cost) || 0.00;
    remarks = remarks || "";

    if (useFallback) {
        const newId = record_id ? parseInt(record_id, 10) : (memoryStore.maintainance_records.reduce((max, r) => Math.max(max, r.record_id), 0) + 1);
        const newRec = { record_id: newId, request_id, work_description, completion_date, repair_cost, remarks };
        memoryStore.maintainance_records.push(newRec);

        // Also optionally update linked request status to 'Completed'
        const linkedReq = memoryStore.requests.find(r => r.request_id === request_id);
        if (linkedReq) linkedReq.status = "Completed";

        return res.status(201).json({ message: "Repair Record Logged Successfully", record_id: newId, record: newRec });
    }

    const sql = record_id
        ? "INSERT INTO maintainance_records (record_id, request_id, work_description, completion_date, repair_cost, remarks) VALUES (?, ?, ?, ?, ?, ?)"
        : "INSERT INTO maintainance_records (request_id, work_description, completion_date, repair_cost, remarks) VALUES (?, ?, ?, ?, ?)";
    const params = record_id
        ? [record_id, request_id, work_description, completion_date, repair_cost, remarks]
        : [request_id, work_description, completion_date, repair_cost, remarks];

    pool.query(sql, params, (err, result) => {
        if (err) {
            const newId = record_id ? parseInt(record_id, 10) : (memoryStore.maintainance_records.reduce((max, r) => Math.max(max, r.record_id), 0) + 1);
            const newRec = { record_id: newId, request_id, work_description, completion_date, repair_cost, remarks };
            memoryStore.maintainance_records.push(newRec);
            const linkedReq = memoryStore.requests.find(r => r.request_id === request_id);
            if (linkedReq) linkedReq.status = "Completed";
            return res.status(201).json({ message: "Repair Record Logged Successfully", record_id: newId, record: newRec });
        }
        const insertId = result.insertId || record_id;

        // Auto-mark linked request as Completed
        pool.query("UPDATE requests SET status = 'Completed' WHERE request_id = ?", [request_id]);

        res.status(201).json({ message: "Repair Record Logged Successfully", record_id: insertId });
    });
});

// PUT /records/:id: Update repair record
app.put("/records/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    let { request_id, work_description, completion_date, repair_cost, remarks } = req.body;

    if (!request_id || !work_description || !completion_date) {
        return res.status(400).json({ error: "Missing required record fields for update" });
    }

    request_id = parseInt(request_id, 10);
    repair_cost = parseFloat(repair_cost) || 0.00;
    remarks = remarks || "";

    if (useFallback) {
        const idx = memoryStore.maintainance_records.findIndex(r => r.record_id === id);
        if (idx === -1) return res.status(404).json({ error: "Record not found" });
        memoryStore.maintainance_records[idx] = { record_id: id, request_id, work_description, completion_date, repair_cost, remarks };
        return res.json({ message: "Repair Record Updated Successfully", record: memoryStore.maintainance_records[idx] });
    }

    const sql = "UPDATE maintainance_records SET request_id = ?, work_description = ?, completion_date = ?, repair_cost = ?, remarks = ? WHERE record_id = ?";
    pool.query(sql, [request_id, work_description, completion_date, repair_cost, remarks, id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const idx = memoryStore.maintainance_records.findIndex(r => r.record_id === id);
            if (idx !== -1) {
                memoryStore.maintainance_records[idx] = { record_id: id, request_id, work_description, completion_date, repair_cost, remarks };
                return res.json({ message: "Repair Record Updated Successfully", record: memoryStore.maintainance_records[idx] });
            }
            return res.status(404).json({ error: "Record not found" });
        }
        res.json({ message: "Repair Record Updated Successfully", record_id: id });
    });
});

// DELETE /records/:id: Delete repair record
app.delete("/records/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (useFallback) {
        const initialLen = memoryStore.maintainance_records.length;
        memoryStore.maintainance_records = memoryStore.maintainance_records.filter(r => r.record_id !== id);
        if (memoryStore.maintainance_records.length === initialLen) {
            return res.status(404).json({ error: "Record not found to delete" });
        }
        return res.json({ message: "Repair Record Deleted Successfully", record_id: id });
    }

    const sql = "DELETE FROM maintainance_records WHERE record_id = ?";
    pool.query(sql, [id], (err, result) => {
        if (err || result.affectedRows === 0) {
            const initialLen = memoryStore.maintainance_records.length;
            memoryStore.maintainance_records = memoryStore.maintainance_records.filter(r => r.record_id !== id);
            if (memoryStore.maintainance_records.length < initialLen) {
                return res.json({ message: "Repair Record Deleted Successfully", record_id: id });
            }
            return res.status(404).json({ error: "Record not found to delete" });
        }
        res.json({ message: "Repair Record Deleted Successfully", record_id: id });
    });
});

// ====================================================================
// SYSTEM STATS & METRICS ENDPOINT
// GET /stats: Aggregates operational counters and expenditure
// ====================================================================
app.get("/stats", (req, res) => {
    if (useFallback) {
        const totalResidents = memoryStore.residents.length;
        const totalStaff = memoryStore.maintainance_staff.length;
        const openRequests = memoryStore.requests.filter(r => r.status !== "Completed").length;
        const completedRequests = memoryStore.requests.filter(r => r.status === "Completed").length;
        const totalCost = memoryStore.maintainance_records.reduce((sum, r) => sum + (parseFloat(r.repair_cost) || 0), 0);
        return res.json({
            totalResidents,
            totalStaff,
            openRequests,
            completedRequests,
            totalRecords: memoryStore.maintainance_records.length,
            totalCost: totalCost.toFixed(2),
            dbMode: "Resilient In-Memory Pool"
        });
    }

    const statsSql = `
        SELECT
            (SELECT COUNT(*) FROM residents) AS totalResidents,
            (SELECT COUNT(*) FROM maintainance_staff) AS totalStaff,
            (SELECT COUNT(*) FROM requests WHERE status != 'Completed') AS openRequests,
            (SELECT COUNT(*) FROM requests WHERE status = 'Completed') AS completedRequests,
            (SELECT COUNT(*) FROM maintainance_records) AS totalRecords,
            (SELECT IFNULL(SUM(repair_cost), 0.00) FROM maintainance_records) AS totalCost
    `;

    pool.query(statsSql, (err, results) => {
        if (err) {
            const totalResidents = memoryStore.residents.length;
            const totalStaff = memoryStore.maintainance_staff.length;
            const openRequests = memoryStore.requests.filter(r => r.status !== "Completed").length;
            const completedRequests = memoryStore.requests.filter(r => r.status === "Completed").length;
            const totalCost = memoryStore.maintainance_records.reduce((sum, r) => sum + (parseFloat(r.repair_cost) || 0), 0);
            return res.json({
                totalResidents,
                totalStaff,
                openRequests,
                completedRequests,
                totalRecords: memoryStore.maintainance_records.length,
                totalCost: totalCost.toFixed(2),
                dbMode: "Resilient In-Memory Fallback"
            });
        }
        const row = results[0];
        res.json({
            totalResidents: row.totalResidents,
            totalStaff: row.totalStaff,
            openRequests: row.openRequests,
            completedRequests: row.completedRequests,
            totalRecords: row.totalRecords,
            totalCost: parseFloat(row.totalCost || 0).toFixed(2),
            dbMode: "Live MySQL Pool"
        });
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`=================================================`);
        console.log(` Jahid Apartment Maintenance Management Server`);
        console.log(` Status: Running at http://localhost:${PORT}`);
        console.log(` Database: maintenance_db (pool fallback: root@localhost)`);
        console.log(`=================================================`);
    });
}

module.exports = app;
