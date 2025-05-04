const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

// เชื่อมต่อกับฐานข้อมูล TiDB Cloud
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);  // หยุดการทำงานเมื่อมีข้อผิดพลาด
    return;
  }
  console.log('Connected to the database successfully.');
});

app.get('/', (req, res) => {
    res.send('Hello world!!');
});

// API สำหรับดึงข้อมูลการซ่อมบำรุงทั้งหมด
app.get('/maintenance-logs', (req, res) => {
    connection.query(
        'SELECT * FROM maintenance_logs ORDER BY id', // เพิ่ม ORDER BY id ที่นี่
        function (err, results, fields) {
            if (err) {
                console.error('Error fetching maintenance logs:', err);
                return res.status(500).send('Error fetching maintenance logs');
            }
            res.send(results);
        }
    );
});

// API สำหรับดึงข้อมูลการซ่อมบำรุงตาม id
app.get('/maintenance-logs/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'SELECT * FROM maintenance_logs WHERE id = ?', [id],
        function (err, results, fields) {
            if (err) {
                console.error('Error fetching maintenance log by ID:', err);
                return res.status(500).send('Error fetching maintenance log');
            }
            res.send(results);
        }
    );
});

// API สำหรับเพิ่มการซ่อมบำรุงใหม่
app.post('/maintenance-logs', (req, res) => {
    connection.query(
        'INSERT INTO maintenance_logs (system, description, reportedAt, reportedBy, status, fixedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [req.body.system, req.body.description, req.body.reportedAt, req.body.reportedBy, req.body.status, req.body.fixedAt],
        function (err, results, fields) {
            if (err) {
                console.error('Error adding maintenance log:', err);
                return res.status(500).send('Error adding maintenance log');
            }
            res.status(200).send(results);
        }
    );
});

// API สำหรับอัปเดตข้อมูลการซ่อมบำรุง
app.put('/maintenance-logs', (req, res) => {
    connection.query(
        'UPDATE maintenance_logs SET system=?, description=?, reportedAt=?, reportedBy=?, status=?, fixedAt=? WHERE id=?',
        [req.body.system, req.body.description, req.body.reportedAt, req.body.reportedBy, req.body.status, req.body.fixedAt, req.body.id],
        function (err, results, fields) {
            if (err) {
                console.error('Error updating maintenance log:', err);
                return res.status(500).send('Error updating maintenance log');
            }
            res.send(results);
        }
    );
});

// API สำหรับลบการซ่อมบำรุง
app.delete('/maintenance-logs', (req, res) => {
    connection.query(
        'DELETE FROM maintenance_logs WHERE id=?',
        [req.body.id],
        function (err, results, fields) {
            if (err) {
                console.error('Error deleting maintenance log:', err);
                return res.status(500).send('Error deleting maintenance log');
            }
            res.send(results);
        }
    );
});

app.listen(process.env.PORT || 3000, () => {
    console.log('CORS-enabled web server listening on port 3000');
});

// export the app for vercel serverless functions
module.exports = app;
