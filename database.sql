-- ====================================================================
-- Jahid Apartment Maintenance Management System
-- Database Initialization and Schema Definition Script
-- Database Name: maintenance_db
-- ====================================================================

-- 1. Create and switch to maintenance_db
CREATE DATABASE IF NOT EXISTS maintenance_db;
USE maintenance_db;

-- 2. Drop existing tables if re-initializing (in reverse foreign key order)
DROP TABLE IF EXISTS maintainance_records;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS maintainance_staff;
DROP TABLE IF EXISTS residents;

-- ====================================================================
-- Table 1: residents
-- Stores resident details, flat numbers, and contact information.
-- ====================================================================
CREATE TABLE residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flat_no VARCHAR(20) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- ====================================================================
-- Table 2: maintainance_staff
-- Stores on-site technical maintenance crew and specializations.
-- ====================================================================
CREATE TABLE maintainance_staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- ====================================================================
-- Table 3: requests
-- Stores tenant service tickets referencing residents and assigned staff.
-- issue_type is restricted to 'Plumbing', 'Electrical', 'Cleaning', 'Other'.
-- ====================================================================
CREATE TABLE requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    staff_id INT NULL,
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    CONSTRAINT chk_issue_type CHECK (issue_type IN ('Plumbing', 'Electrical', 'Cleaning', 'Other')),
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES maintainance_staff(staff_id) ON DELETE SET NULL
);

-- ====================================================================
-- Table 4: maintainance_records
-- Stores final resolution records, work descriptions, and repair costs.
-- ====================================================================
CREATE TABLE maintainance_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    work_description TEXT NOT NULL,
    completion_date DATE NOT NULL,
    repair_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    remarks VARCHAR(255) NULL,
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE
);

-- ====================================================================
-- SEED DATA INSERTION
-- Realistic operational records for evaluation and demonstration
-- ====================================================================

-- Seed Table 1: residents
INSERT INTO residents (resident_id, name, flat_no, phone, email) VALUES
(1, 'Jahid Hasan', 'Tower A - 401', '9876543210', 'jahid.hasan@apartment.com'),
(2, 'Sarah Jenkins', 'Tower A - 203', '9876543211', 'sarah.j@gmail.com'),
(3, 'Michael Chang', 'Tower B - 105', '9876543212', 'mchang@techcorp.io'),
(4, 'Priya Sharma', 'Tower B - 502', '9876543213', 'priya.sharma@outlook.com'),
(5, 'David Miller', 'Tower C - 301', '9876543214', 'dmiller@fintech.net'),
(6, 'Fatima Al-Sayed', 'Tower C - 604', '9876543215', 'fatima.alsayed@mail.com');

-- Seed Table 2: maintainance_staff
INSERT INTO maintainance_staff (staff_id, name, phone, specialization, email) VALUES
(1, 'Marcus Vance', '9123456780', 'Plumbing', 'marcus.v@maintenance.pro'),
(2, 'Elena Rostova', '9123456781', 'Electrical', 'elena.r@maintenance.pro'),
(3, 'Tariq Rahman', '9123456782', 'Cleaning', 'tariq.rahman@cleanpro.com'),
(4, 'Carlos Mendez', '9123456783', 'Electrical', 'carlos.m@maintenance.pro'),
(5, 'Anil Kulkarni', '9123456784', 'Plumbing', 'anil.k@maintenance.pro');

-- Seed Table 3: requests
INSERT INTO requests (request_id, resident_id, staff_id, issue_type, description, request_date, status) VALUES
(1, 1, 1, 'Plumbing', 'Master bathroom sink drain pipe leaking water onto floor cabinet.', '2026-11-05 09:30:00', 'Completed'),
(2, 2, 2, 'Electrical', 'Main circuit breaker trips intermittently when microwave and AC run together.', '2026-11-06 11:15:00', 'Completed'),
(3, 3, 3, 'Cleaning', 'Balcony drain clogged with foliage debris causing water pooling after rainfall.', '2026-11-06 14:40:00', 'In Progress'),
(4, 4, 1, 'Plumbing', 'Kitchen faucet aerator broken and low water pressure in cold feed.', '2026-11-07 08:20:00', 'Pending'),
(5, 5, 4, 'Electrical', 'Living room ceiling fan regulator sparking on switch speed change.', '2026-11-07 10:05:00', 'Pending'),
(6, 6, NULL, 'Other', 'Balcony sliding glass door latch stuck and off-track.', '2026-11-07 12:15:00', 'Pending');

-- Seed Table 4: maintainance_records
INSERT INTO maintainance_records (record_id, request_id, work_description, completion_date, repair_cost, remarks) VALUES
(1, 1, 'Replaced rubber gasket seal and re-aligned PVC U-bend trap beneath vanity basin.', '2026-11-05', 450.00, 'Tested under full water flow; zero leakage detected. 6-month warranty on seal.'),
(2, 2, 'Diagnosed loose neutral wire terminal in distribution box; replaced faulty 32A MCB.', '2026-11-06', 1250.00, 'Load balance test executed under 4.2kW peak draw; breakers operating safely.');
