/**
 * @file getonline.js
 * @description This file handles the get online users route for the API.
 * It retrieves the online users from the signed-in keys stored in the application instance.
 * It will return a list of usernames that are currently online.
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */

export default function getOnline(app, req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).send('Session ID is required');

  // Validate session
  const user = Object.keys(app.keys).find(key => app.keys[key] === id);
  if (!user) return res.status(404).send('Invalid session');

  // Collect all users with valid session IDs
  const onlineUsers = Object.keys(app.keys).filter(key => app.keys[key] !== null);

  // Prepare adaptive response
  const response = { online: onlineUsers.length };
  onlineUsers.forEach((username, index) => {
    // Put the users in some weird way so the frontend will read it.
    response[`user-${index + 1}`] = username;
  });

  // Return response
  res.status(200).json(response);
}
