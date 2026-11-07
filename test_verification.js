// ====================================================================
// Jahid Apartment Maintenance Management - Automated Test Suite
// Rigorous Verification for Database, Server, Endpoints, & Frontend
// ====================================================================

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log("====================================================================");
console.log(" JAHID APARTMENT MAINTENANCE MANAGEMENT - VERIFICATION TEST RUNNER");
console.log("====================================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
    totalTests++;
    if (condition) {
        console.log(`[\x1b[32mPASS\x1b[0m] ${testName}`);
        passedTests++;
    } else {
        console.error(`[\x1b[31mFAIL\x1b[0m] ${testName}`);
    }
}

const baseDir = __dirname;

// --------------------------------------------------------------------
// 1. FILE EXISTENCE & STRUCTURE CHECKS
// --------------------------------------------------------------------
console.log("\n--- [1] FILE INTEGRITY CHECKS ---");
assert(fs.existsSync(path.join(baseDir, 'database.sql')), "database.sql file exists");
assert(fs.existsSync(path.join(baseDir, 'server.js')), "server.js file exists");
assert(fs.existsSync(path.join(baseDir, 'package.json')), "package.json file exists");
assert(fs.existsSync(path.join(baseDir, 'public', 'index.html')), "public/index.html file exists");

// --------------------------------------------------------------------
// 2. DATABASE.SQL SCHEMA & CONSTRAINTS VALIDATION
// --------------------------------------------------------------------
console.log("\n--- [2] DATABASE SCHEMA & SQL SPECIFICATION CHECKS ---");
const sqlContent = fs.readFileSync(path.join(baseDir, 'database.sql'), 'utf-8');

assert(sqlContent.includes("CREATE DATABASE IF NOT EXISTS maintenance_db;"), "SQL initializes 'maintenance_db'");
assert(sqlContent.includes("USE maintenance_db;"), "SQL switches context to 'maintenance_db'");

// Table 1: residents
assert(/CREATE\s+TABLE\s+residents/i.test(sqlContent), "SQL defines 'residents' table");
assert(/resident_id\s+INT/i.test(sqlContent), "residents has 'resident_id' INT PK");
assert(/flat_no\s+VARCHAR\(20\)/i.test(sqlContent), "residents has 'flat_no' VARCHAR(20)");
assert(/phone\s+VARCHAR\(15\)/i.test(sqlContent), "residents has 'phone' VARCHAR(15)");
assert(/email\s+VARCHAR\(100\)/i.test(sqlContent), "residents has 'email' VARCHAR(100)");

// Table 2: maintainance_staff
assert(/CREATE\s+TABLE\s+maintainance_staff/i.test(sqlContent), "SQL defines 'maintainance_staff' table (exact spelling)");
assert(/staff_id\s+INT/i.test(sqlContent), "maintainance_staff has 'staff_id' INT PK");
assert(/specialization\s+VARCHAR\(100\)/i.test(sqlContent), "maintainance_staff has 'specialization' VARCHAR(100)");

// Table 3: requests
assert(/CREATE\s+TABLE\s+requests/i.test(sqlContent), "SQL defines 'requests' table");
assert(/request_id\s+INT/i.test(sqlContent), "requests has 'request_id' INT PK");
assert(/resident_id\s+INT/i.test(sqlContent), "requests has 'resident_id' INT FK");
assert(/staff_id\s+INT/i.test(sqlContent), "requests has 'staff_id' INT FK");
assert(/CHECK\s*\(\s*issue_type\s+IN\s*\('Plumbing',\s*'Electrical',\s*'Cleaning',\s*'Other'\)\s*\)/i.test(sqlContent), "requests restricts issue_type to 'Plumbing', 'Electrical', 'Cleaning', 'Other'");
assert(/FOREIGN\s+KEY\s*\(\s*resident_id\s*\)\s*REFERENCES\s+residents\s*\(\s*resident_id\s*\)/i.test(sqlContent), "requests references residents.resident_id");
assert(/FOREIGN\s+KEY\s*\(\s*staff_id\s*\)\s*REFERENCES\s+maintainance_staff\s*\(\s*staff_id\s*\)/i.test(sqlContent), "requests references maintainance_staff.staff_id");

// Table 4: maintainance_records
assert(/CREATE\s+TABLE\s+maintainance_records/i.test(sqlContent), "SQL defines 'maintainance_records' table (exact spelling)");
assert(/record_id\s+INT/i.test(sqlContent), "maintainance_records has 'record_id' INT PK");
assert(/request_id\s+INT/i.test(sqlContent), "maintainance_records has 'request_id' INT FK");
assert(/work_description\s+TEXT/i.test(sqlContent), "maintainance_records has 'work_description' TEXT");
assert(/completion_date\s+DATE/i.test(sqlContent), "maintainance_records has 'completion_date' DATE");
assert(/repair_cost\s+DECIMAL\(10,\s*2\)/i.test(sqlContent), "maintainance_records has 'repair_cost' DECIMAL(10, 2)");
assert(/remarks\s+VARCHAR\(255\)/i.test(sqlContent), "maintainance_records has 'remarks' VARCHAR(255)");
assert(/FOREIGN\s+KEY\s*\(\s*request_id\s*\)\s*REFERENCES\s+requests\s*\(\s*request_id\s*\)/i.test(sqlContent), "maintainance_records references requests.request_id");

// Seeds check
assert(sqlContent.includes("INSERT INTO residents"), "SQL seeds 'residents' table");
assert(sqlContent.includes("INSERT INTO maintainance_staff"), "SQL seeds 'maintainance_staff' table");
assert(sqlContent.includes("INSERT INTO requests"), "SQL seeds 'requests' table");
assert(sqlContent.includes("INSERT INTO maintainance_records"), "SQL seeds 'maintainance_records' table");

// --------------------------------------------------------------------
// 3. SERVER.JS BACKEND SPECIFICATION CHECKS
// --------------------------------------------------------------------
console.log("\n--- [3] SERVER.JS SPECIFICATION & PATH CHECKS ---");
const serverCode = fs.readFileSync(path.join(baseDir, 'server.js'), 'utf-8');

assert(serverCode.includes('require("express")') || serverCode.includes("require('express')"), "server.js requires 'express'");
assert(serverCode.includes('require("mysql8")') || serverCode.includes("require('mysql8')"), "server.js requires 'mysql8' driver package");
assert(serverCode.includes("localhost") && serverCode.includes("root") && serverCode.includes("maintenance_db"), "server.js hardcodes local fallbacks: localhost, root, maintenance_db");
assert(serverCode.includes("express.static"), "server.js configures express.static for /public");

// Path checks
assert(serverCode.includes('app.get("/residents"'), "Defines GET /residents");
assert(serverCode.includes('app.post("/residents"'), "Defines POST /residents");
assert(serverCode.includes('app.put("/residents/:id"'), "Defines PUT /residents/:id");
assert(serverCode.includes('app.delete("/residents/:id"'), "Defines DELETE /residents/:id");

assert(serverCode.includes('app.get("/staff"'), "Defines GET /staff");
assert(serverCode.includes('app.post("/staff"'), "Defines POST /staff");
assert(serverCode.includes('app.put("/staff/:id"'), "Defines PUT /staff/:id");
assert(serverCode.includes('app.delete("/staff/:id"'), "Defines DELETE /staff/:id");

assert(serverCode.includes('app.get("/requests"'), "Defines GET /requests");
assert(serverCode.includes('app.post("/requests"'), "Defines POST /requests");
assert(serverCode.includes('app.put("/requests/:id"'), "Defines PUT /requests/:id");
assert(serverCode.includes('app.delete("/requests/:id"'), "Defines DELETE /requests/:id");

assert(serverCode.includes('app.get("/records"'), "Defines GET /records");
assert(serverCode.includes('app.post("/records"'), "Defines POST /records");
assert(serverCode.includes('app.put("/records/:id"'), "Defines PUT /records/:id");
assert(serverCode.includes('app.delete("/records/:id"'), "Defines DELETE /records/:id");

// --------------------------------------------------------------------
// 4. FRONTEND UI & FORM BINDING VALIDATION
// --------------------------------------------------------------------
console.log("\n--- [4] FRONTEND PUBLIC/INDEX.HTML ASSET MAPPING CHECKS ---");
const htmlContent = fs.readFileSync(path.join(baseDir, 'public', 'index.html'), 'utf-8');

assert(htmlContent.includes("Jahid Apartment Maintenance Management"), "Header boldly displays 'Jahid Apartment Maintenance Management'");
assert(htmlContent.includes("cdn.tailwindcss.com"), "Integrates Tailwind CSS via CDN");
assert(!htmlContent.includes("Our Mission") && !htmlContent.includes("Meet The Team"), "Zero corporate fluff / agency blocks");

// Input Panels Form mappings
assert(htmlContent.includes('id="formAddResident"'), "Features 'Register Resident' native form");
assert(htmlContent.includes('id="res_name"') && htmlContent.includes('id="res_flat_no"'), "Maps Resident inputs: name, flat_no");

assert(htmlContent.includes('id="formAddStaff"'), "Features 'Onboard Staff' native form");
assert(htmlContent.includes('id="staff_name"') && htmlContent.includes('id="staff_specialization"'), "Maps Staff inputs: name, specialization");

assert(htmlContent.includes('id="formAddRequest"'), "Features 'File Maintenance Request' native form");
assert(htmlContent.includes('id="req_resident_id"') && htmlContent.includes('id="req_staff_id"'), "Maps Request foreign keys: req_resident_id, req_staff_id");
assert(htmlContent.includes('id="req_issue_type"') && htmlContent.includes('id="req_description"'), "Maps Request inputs: req_issue_type, req_description");

assert(htmlContent.includes('id="formAddRecord"'), "Features 'Log Completed Repair Record' native form");
assert(htmlContent.includes('id="rec_request_id"') && htmlContent.includes('id="rec_repair_cost"'), "Maps Record inputs: rec_request_id, rec_repair_cost");

// Dynamic Foreign Key Populate Logic
assert(htmlContent.includes("populateDropdowns"), "Implements dynamic foreign key dropdown population logic");

// Action Triggers (PUT & DELETE)
assert(htmlContent.includes("openEditResidentModal") && htmlContent.includes("handleDeleteResident"), "Row action triggers for Residents (PUT & DELETE)");
assert(htmlContent.includes("openEditStaffModal") && htmlContent.includes("handleDeleteStaff"), "Row action triggers for Staff (PUT & DELETE)");
assert(htmlContent.includes("openEditRequestModal") && htmlContent.includes("handleDeleteRequest"), "Row action triggers for Requests (PUT & DELETE)");
assert(htmlContent.includes("openEditRecordModal") && htmlContent.includes("handleDeleteRecord"), "Row action triggers for Records (PUT & DELETE)");

// --------------------------------------------------------------------
// 5. LIVE HTTP END-TO-END PIPELINE TESTS
// --------------------------------------------------------------------
console.log("\n--- [5] LIVE HTTP ENDPOINT EXECUTION TESTS ---");

const app = require('./server');
const TEST_PORT = 3188;
const server = app.listen(TEST_PORT, async () => {
    try {
        function apiRequest(method, endpoint, body = null) {
            return new Promise((resolve, reject) => {
                const opt = {
                    hostname: '127.0.0.1',
                    port: TEST_PORT,
                    path: endpoint,
                    method: method,
                    headers: { 'Content-Type': 'application/json' }
                };
                const req = http.request(opt, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        let parsed;
                        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                        resolve({ status: res.statusCode, data: parsed });
                    });
                });
                req.on('error', reject);
                if (body) req.write(JSON.stringify(body));
                req.end();
            });
        }

        // Test GET /
        const rootRes = await apiRequest('GET', '/');
        assert(rootRes.status === 200 && typeof rootRes.data === 'string' && rootRes.data.includes("Jahid Apartment Maintenance Management"), "GET / serves public/index.html");

        // Test Residents CRUD
        const getRes = await apiRequest('GET', '/residents');
        assert(getRes.status === 200 && Array.isArray(getRes.data), "GET /residents returns 200 and array");

        const postRes = await apiRequest('POST', '/residents', {
            name: "Test Tenant",
            flat_no: "Test-999",
            phone: "9998887770",
            email: "test.tenant@test.com"
        });
        assert(postRes.status === 201 && postRes.data.resident_id, "POST /residents inserts new resident (201)");
        const newResId = postRes.data.resident_id;

        const putRes = await apiRequest('PUT', `/residents/${newResId}`, {
            name: "Updated Tenant",
            flat_no: "Test-999-B",
            phone: "9998887771",
            email: "updated.tenant@test.com"
        });
        assert(putRes.status === 200, "PUT /residents/:id updates resident (200)");

        const delRes = await apiRequest('DELETE', `/residents/${newResId}`);
        assert(delRes.status === 200, "DELETE /residents/:id deletes resident (200)");

        // Test Staff CRUD
        const getStaff = await apiRequest('GET', '/staff');
        assert(getStaff.status === 200 && Array.isArray(getStaff.data), "GET /staff returns 200 and array");

        const postStaff = await apiRequest('POST', '/staff', {
            name: "Test Staff",
            phone: "9000000001",
            specialization: "Electrical",
            email: "staff.test@company.pro"
        });
        assert(postStaff.status === 201 && postStaff.data.staff_id, "POST /staff inserts new staff member (201)");
        const newStaffId = postStaff.data.staff_id;

        const putStaff = await apiRequest('PUT', `/staff/${newStaffId}`, {
            name: "Updated Staff",
            phone: "9000000002",
            specialization: "Plumbing",
            email: "staff.updated@company.pro"
        });
        assert(putStaff.status === 200, "PUT /staff/:id updates staff (200)");

        const delStaff = await apiRequest('DELETE', `/staff/${newStaffId}`);
        assert(delStaff.status === 200, "DELETE /staff/:id deletes staff (200)");

        // Test Requests CRUD
        const getReq = await apiRequest('GET', '/requests');
        assert(getReq.status === 200 && Array.isArray(getReq.data), "GET /requests returns 200 and array");

        const postReq = await apiRequest('POST', '/requests', {
            resident_id: 1,
            staff_id: 1,
            issue_type: "Plumbing",
            description: "Automated verification test leak issue",
            request_date: "2026-11-07 10:00:00",
            status: "Pending"
        });
        assert(postReq.status === 201 && postReq.data.request_id, "POST /requests files maintenance request (201)");
        const newReqId = postReq.data.request_id;

        const putReq = await apiRequest('PUT', `/requests/${newReqId}`, {
            resident_id: 1,
            staff_id: 1,
            issue_type: "Plumbing",
            description: "Updated leak description",
            request_date: "2026-11-07 10:30:00",
            status: "In Progress"
        });
        assert(putReq.status === 200, "PUT /requests/:id updates request (200)");

        // Test Records CRUD
        const getRec = await apiRequest('GET', '/records');
        assert(getRec.status === 200 && Array.isArray(getRec.data), "GET /records returns 200 and array");

        const postRec = await apiRequest('POST', '/records', {
            request_id: newReqId,
            work_description: "Completed test repair replacement",
            completion_date: "2026-11-07",
            repair_cost: 320.50,
            remarks: "Test passed seamlessly"
        });
        assert(postRec.status === 201 && postRec.data.record_id, "POST /records logs repair record (201)");
        const newRecId = postRec.data.record_id;

        const putRec = await apiRequest('PUT', `/records/${newRecId}`, {
            request_id: newReqId,
            work_description: "Completed test repair replacement - Updated",
            completion_date: "2026-11-07",
            repair_cost: 350.00,
            remarks: "Updated remark notes"
        });
        assert(putRec.status === 200, "PUT /records/:id updates repair record (200)");

        const delRec = await apiRequest('DELETE', `/records/${newRecId}`);
        assert(delRec.status === 200, "DELETE /records/:id deletes repair record (200)");

        const delReq = await apiRequest('DELETE', `/requests/${newReqId}`);
        assert(delReq.status === 200, "DELETE /requests/:id deletes maintenance request (200)");

        // Test Stats Endpoint
        const statsRes = await apiRequest('GET', '/stats');
        assert(statsRes.status === 200 && statsRes.data.totalResidents !== undefined, "GET /stats aggregates metrics (200)");

        console.log("\n====================================================================");
        console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
        console.log("====================================================================\n");

        server.close(() => {
            process.exit(passedTests === totalTests ? 0 : 1);
        });

    } catch (e) {
        console.error("Test execution error:", e);
        server.close(() => process.exit(1));
    }
});
