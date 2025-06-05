/**
 * Get chat messages for a specific chat ID.
 * * @param {Object} app - The Express application instance.
 * * @param {Object} req - The request object containing the chat ID.
 * * @param {Object} res - The response object to send the chat messages.
 * 
 * @returns {void} - Sends the chat messages as a JSON response.
 */
export default function getChat(app, req, res) {
  // Extract chat ID from the request query parameters
  const { id, chatId } = req.query;

  // ID is the session ID
  // Check if chatId is provided
  if (!chatId && !id) {
    return res.status(400).json({ error: 'IDs are required' });
  }

  // Get the chat messages for the provided chat from the database or service
    app.database.get('SELECT contents FROM chats WHERE id = ?', [chatId || id], (err, row) => {
        if (err) {
            console.error('Error fetching chat messages:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
            }
        if (!row) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        // Parse the chat messages from the row
        const chatMessages = JSON.parse(row.contents);

        // Send the chat messages as a JSON response
        res.status(200).json({ chatId, messages: chatMessages });
    });

};