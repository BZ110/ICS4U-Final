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
  const { id } = req.query;

  // Some params are missing.
  if (!id) return res.status(400).send('Missing required parameters');

  const user = Object.keys(app.keys).find(key => app.keys[key] === id);
    
  // User isn't in object keys
  if (!user) return res.status(404).send('User not signed in');

  // Make database request
  app.database.get('SELECT * FROM users WHERE username = ?', [user], (err, row) => {
      
    // Error
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send('Internal server error');
    }

    if (!row) return res.status(404).send('User not found');

    // Get chat id info (abandoned)
    const chatIds = row.chats ? row.chats.split(',').map(id => id.trim()) : [];

    if (chatIds.length === 0) {
      // No chats
      return res.status(200).json({
        username: row.username,
        email: row.email,
        phone: row.phone,
        chatAmount: 0
      });
    }

    // Prepare tresult
    let result = {
      username: row.username,
      email: row.email,
      phone: row.phone,
      chatAmount: chatIds.length
    };

    let completed = 0;

    // Get information about chat id. (abandoned)
    chatIds.forEach((chatId, index) => {
      app.database.get('SELECT contents FROM chats WHERE rowid = ?', [chatId], (e, chatRow) => {
        completed++;
        if (!e && chatRow && chatRow.contents) {
          try {
            const messages = JSON.parse(chatRow.contents);
            const participants = messages.map(m => m.sender);
            const other = participants.find(name => name !== user);
            result[`chat${index}`] = other || '(unknown)';
          } catch {
            result[`chat${index}`] = '(invalid)';
          }
        } else {
          result[`chat${index}`] = '(unavailable)';
        }

        // It was completed
        if (completed === chatIds.length) {
          // Return the result
          res.status(200).json(result);
        }
      });
    });
  });
}
