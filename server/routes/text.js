/**
 * @file text.js
 * @description This file contains the route for sending text messages.
 * It handles the logic for sending a text message to a specific chat.
 * 
 * @author Bashar Zain
 * @param {Object} app - The Express application instance.
 * @param {Object} req - The request object containing the chat ID and message.
 * @param {Object} res - The response object to send the result of the operation.
 */
export default function (app, req, res) {
  // Extract chat ID and message from the request query parameters
  const { chatId, message } = req.query;

  // Check if chatId and message are provided
  if (!chatId || !message) {
    return res.status(400).json({ error: 'chatId and message are required' });
  }

  // We must validate message.
  /*
    It should look like this
    {
      "content": "Hello, world!",
      "timestamp": "2023-10-01T12:00:00Z",
      "sender": "user123"
    }
  */

    // Validate the message format
    try {
        const parsedMessage = JSON.parse(message);
        if (!parsedMessage.content || !parsedMessage.timestamp || !parsedMessage.sender) {
            return res.status(400).json({ error: 'Invalid message format' });
        }
    } catch (error) {
        console.error('Error parsing message:', error.message);
        return res.status(400).json({ error: 'An error occurred while parsing the message' });
    }
    
  // Insert the text message into the database for the specified chat
  // Read from the database
    app.database.get('SELECT contents FROM chats WHERE id = ?', [chatId], (err, row) => {
        if (err) {
            console.error('Error fetching chat:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    
        if (!row) {
            return res.status(404).json({ error: 'Chat not found' });
        }
    
        // Parse the existing chat messages
        let chatMessages;
        try {
            chatMessages = JSON.parse(row.contents);
        } catch (parseError) {
            console.error('Error parsing chat contents:', parseError.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
    
        // Add the new message to the chat messages
        chatMessages.push(parsedMessage);
    
        // Update the chat in the database
        app.database.run('UPDATE chats SET contents = ? WHERE id = ?', [JSON.stringify(chatMessages), chatId], (updateErr) => {
            if (updateErr) {
                console.error('Error updating chat:', updateErr.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
    
            // Send a success response
            res.status(200).json({ message: 'Text sent successfully', chatId, messages: chatMessages });
        });
    });
}