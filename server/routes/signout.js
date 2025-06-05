/**
 * Sign-out route handler.
 * @file signout.js
 * @description This file handles the sign-out route for the API.
 * It removes the session token for the user, effectively signing them out.
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */
export default function (app, req, res) {
    // Get the user from the request query
    const { user } = req.query;

    // Validate the user parameter
    if (!user) {
        return res.status(400).send('Missing required parameters');
    }

    // Check if the user is signed in
    if (!app.keys[user]) {
        return res.status(404).send('User not signed in');
    }

    // Remove the session token for the user
    delete app.keys[user];

    // Send a success response
    res.status(200).json({
        message: 'Sign out successful'
    });
}