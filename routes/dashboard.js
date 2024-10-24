// Dashboard Route
router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    // Fetch user data
    db.query('SELECT * FROM User WHERE id = ?', [req.session.userId], (err, results) => {
        if (err) throw err;

        // Pass user data to the dashboard
        res.render('dashboard', { user: results[0] }); // Assuming user is an object
    });
});
