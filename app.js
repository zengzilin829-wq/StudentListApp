require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'c237_studentlistapp',
  dateStrings: true
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// List all students
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM student';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('index', { students: results });
  });
});

// Show one student's details
app.get('/student/:id', (req, res) => {
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }
    res.render('student', { student: results[0] });
  });
});

// Show add student form
app.get('/addStudent', (req, res) => {
  res.render('addStudent');
});

// Handle add student form submission
app.post('/addStudent', (req, res) => {
  const { name, dob, contact, image } = req.body;
  const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, dob, contact, image], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

// Handle delete student
app.post('/deleteStudent/:id', (req, res) => {
  const sql = 'DELETE FROM student WHERE studentId = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

// Show edit student form
app.get('/editStudent/:id', (req, res) => {
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    if (results.length === 0) {
      return res.status(404).send('Student not found');
    }
    res.render('editStudent', { student: results[0] });
  });
});

// Handle edit student form submission
app.post('/editStudent/:id', (req, res) => {
  const { name, dob, contact, image } = req.body;
  const sql = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentId = ?';
  db.query(sql, [name, dob, contact, image, req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.redirect('/student/' + req.params.id);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));