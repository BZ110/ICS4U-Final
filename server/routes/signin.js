/**
 * Sign in route handler.
 * @file signin.js
 * @description This file handles the sign-in route for the API.
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */

// Import necessary modules
import crypto from 'crypto';

export default function (app, req, res) {
    // Get the necessary parameters from the request
    const { user, pass } = req.query;

    // Validate the parameters
    if (!user || !pass) {
        return res.status(400).send('Missing required parameters');
    }

    // Check if the user exists in the database
    app.database.get('SELECT * FROM users WHERE username = ?', [user], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Internal server error');
        }

        if (!row) {
            return res.status(404).send('User not found');
        }

        // Check if the password matches
        if (row.password !== pass) {
            return res.status(401).send('Invalid password');
        }

        // Sign in successful, create a NEW session token.
        // Step 1: Randomize some string.
        let sessionToken = Math.random().toString(36).substring(2, 15); // Simple random token generation

        // Step 2: Add a salt.
        sessionToken += app.config.salt || 'default_salt';

        // Step 3: Hash the token (for security, sha512).
        sessionToken = crypto.createHash('sha512').update(sessionToken).digest('hex');

        // Step 4: Store the session token in the app keys.
        app.keys[user] = sessionToken;

        // Step 5: Send the session token back to the user.
        res.status(200).json({
            message: 'Sign in successful',
            sessionToken: sessionToken
        });
    });
}