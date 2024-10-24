const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Set up session
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
}));

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your database username
    password: '', // your database password
    database: 'personal_budget' // your database name
});

// Connect to database
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to the database.');
});

// Root route
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect to the login page
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});


// User registration route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/register.html'));
});
// User registration route
app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});
// Session management
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.loggedin) {
        return res.status(403).send('Unauthorized');
    }
    next();
};
// Get all expenses
app.get('/get-expenses', (req, res) => {
    const query = 'SELECT id, amount, category, description, date FROM budgets WHERE userId = ?';
    connection.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error fetching expenses');
        }
        res.json(results);
    });
});

// Get a single expense by ID
app.get('/get-expense/:id', (req, res) => {
    const expenseId = req.params.id;
    const query = 'SELECT id, amount, category, description, date FROM budgets WHERE id = ? AND userId = ?';
    connection.query(query, [expenseId, req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error fetching expense');
        }
        res.json(results[0]); // Send the first result
    });
});

// Get a single expense by ID
app.get('/get-expense/:id', (req, res) => {
    const expenseId = req.params.id;
    const query = 'SELECT id, amount, category, description, date FROM budgets WHERE id = ? AND userId = ?';
    connection.query(query, [expenseId, req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json(results[0]); // Send the first result
    });
});
// Add a new income/expense
app.post('/add-income-expense', isAuthenticated, (req, res) => {
    const { amount, category, description, date } = req.body;
    const query = 'INSERT INTO budgets (amount, category, description, date, userId) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(query, [amount, category, description, date, req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).json({ message: 'Error adding expense' });
        }
        res.json({ message: 'Expense added successfully!' });
    });
});

// Update an existing expense
app.put('/update-income-expense/:id', isAuthenticated, (req, res) => {
    const entryId = req.params.id;
    const { amount, category, description, date } = req.body;

    const query = 'UPDATE budgets SET amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND userId = ?';
    connection.query(query, [amount, category, description, date, entryId, req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).json({ error: 'Error updating entry' });
        }
        res.json({ message: 'Entry updated successfully!' });
    });
});

// Delete an expense
app.delete('/delete-income-expense/:id', (req, res) => {
    const expenseId = req.params.id;
    const query = 'DELETE FROM budgets WHERE id = ? AND userId = ?';
    connection.query(query, [expenseId, req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error deleting expense');
        }
        res.json({ message: 'Expense deleted successfully!' });
    });
});
// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists (example validation)
    connection.query('SELECT * FROM User WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Redirect back to register with an error if the username already exists
            res.redirect('/register?error=Username%20already%20exists');
        } else {
            // If the username is available, hash the password and insert into the database
            const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password
            connection.query('INSERT INTO User (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
                if (err) throw err;
                res.redirect('/login');
            });
        }
    });
});


// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM User WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            // Redirect to the login page with an error message
            return res.redirect('/login?error=Incorrect%20username%20or%20password');
        }

        req.session.loggedin = true;
        req.session.userId = results[0].id;
        res.redirect('/dashboard');
    });
});


// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM User WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error logging in user');
        }

        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            // Redirect to the login page with an error message
            return res.redirect('/login?error=Incorrect username or password');
        }

        req.session.loggedin = true;
        req.session.userId = results[0].id;
        res.redirect('/dashboard');
    });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'views/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});
app.post('/add-income-expense', (req, res) => {
    const { amount, category, description, date } = req.body;

    // Check if all fields are filled
    if (!amount || !category || !description || !date) {
        return res.status(400).send('All fields are required!');
    }

    // Insert income/expense into the database
    const query = 'INSERT INTO IncomeExpense (amount, category, description, date, userId) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [amount, category, description, date, req.session.userId], (err) => {
        if (err) {
            console.error("Database error: ", err); // Log the detailed error
            return res.status(500).send('Error adding income/expense');
        }
        res.status(200).json({ message: 'Income/Expense added successfully!' });
    });
});


// Manage Income and Expenses route
app.get('/manage-income-expenses', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'views/manage-income-expenses.html'));
    } else {
        res.redirect('/login');
    }
});
// Serve the reports page
app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reports.html'));
});
app.get('/api/monthly-report', (req, res) => {
    const { startDate, endDate } = req.query;

    const sql = `
        SELECT MONTH(date) AS month, 
               SUM(CASE WHEN category = 'income' THEN amount ELSE 0 END) AS total_income, 
               SUM(CASE WHEN category = 'expense' THEN amount ELSE 0 END) AS total_expense 
        FROM budgets 
        WHERE date BETWEEN ? AND ? AND userId = ?
        GROUP BY MONTH(date)
        ORDER BY MONTH(date);
    `;

    connection.query(sql, [startDate, endDate, req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching monthly report:', err);
            return res.status(500).send('Error fetching monthly report');
        }
        res.json(results);
    });
});
// Get user budget limit
app.get('/get-budget-limit', isAuthenticated, (req, res) => {
    const query = 'SELECT budget_limit FROM budgets WHERE userId = ? LIMIT 1'; // Adjust if you have multiple budgets
    connection.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error fetching budget limit');
        }
        res.json(results[0]); // Send the budget limit
    });
});

// Get total expenses (already implemented)

// Handle logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/login');
    });
});
// Get total income
app.get('/get-total-income', isAuthenticated, (req, res) => {
    const query = 'SELECT SUM(amount) AS total FROM budgets WHERE userId = ? AND category = "income"';
    connection.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error fetching total income');
        }
        res.json(results[0]); // Send the total income
    });
});

// Get total expenses
app.get('/get-total-expenses', isAuthenticated, (req, res) => {
    const query = 'SELECT SUM(amount) AS total FROM budgets WHERE userId = ? AND category = "expense"';
    connection.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error("Database error: ", err);
            return res.status(500).send('Error fetching total expenses');
        }
        res.json(results[0]); // Send the total expenses
    });
});
// Route to get monthly report data
app.get('/api/monthly-report', (req, res) => {
    const sql = `
        SELECT MONTH(date) AS month, 
               SUM(income) AS total_income, 
               SUM(expense) AS total_expense 
        FROM transactions 
        GROUP BY MONTH(date)
        ORDER BY MONTH(date);
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching monthly report:', err);
            return res.status(500).send('Error fetching monthly report');
        }
        res.json(results);
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
