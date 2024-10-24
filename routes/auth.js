const express = require('express');
const router = express.Router();
const db = require('../config/db');

// User Registration
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, password], (err, results) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

// User Login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM User WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.userId = results[0].id;
            res.redirect('/dashboard');
        } else {
            res.send('Invalid credentials');
        }
    });
});

module.exports = router;
