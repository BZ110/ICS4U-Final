/**
 * Get user information route handler.
 * @file get.js
 * @description This file handles the get user information route for the API.
 * It retrieves the user information from the database based on the username provided in the request.
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */
export default function (app, req, res) {
    // Get the id from the request query
    const { id } = req.query;

    // The id passed is the session token, so we need to find the user by that token.
    if (!id) {
        return res.status(400).send('Missing required parameters');
    }

    // Check if the user is signed in
    const user = Object.keys(app.keys).find(key => app.keys[key] === id);
    if (!user) {
        return res.status(404).send('User not signed in');
    }

    // Retrieve the user information from the database
    app.database.get('SELECT * FROM users WHERE username = ?', [user], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Internal server error');
        }

        if (!row) {
            return res.status(404).send('User not found');
        }

        // Send the user information back to the client
        res.status(200).json({
            username: row.username,
            email: row.email,
            phone: row.phone
        });
    });
}