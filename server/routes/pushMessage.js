/**
 * Push-message route handler.
 * @file pushMessage.js
 * @description Adds a new plain-text message to an existing chat between two users.
 * The chat must already exist (both users share the chat ID in their user records).
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */
export default function (app, req, res) {
    // Extract query params
    const { id, target, message } = req.query;

    // If anything is missing, return bad request
    if (!id || !target || !message) {
        return res.status(400).send('Missing required parameters');
    }

    // Convert session ID to actual username
    const sessionUser = Object.keys(app.keys).find(k => app.keys[k] === id);
    if (!sessionUser) {
        return res.status(404).send('Invalid session ID');
    }

    // Helper to parse the list of chats
    const parseChats = raw => {
        try { return JSON.parse(raw); }
        catch { return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []; }
    };

    // Get the current user's chat list
    app.database.get('SELECT chats FROM users WHERE username = ?', [sessionUser], (err, uRow) => {
        
        // Error handling
        if (err) return res.status(500).send('Internal server error');
        if (!uRow) return res.status(404).send('User not found');

        // Turn user's chat record into a usable array
        const userChats = parseChats(uRow?.chats ?? '');

        // Get the target user's chat list
        app.database.get('SELECT chats FROM users WHERE username = ?', [target], (err2, tRow) => {
            
            // More of it...
            if (err2) return res.status(500).send('Internal server error');
            if (!tRow) return res.status(404).send('Target user not found');

            // Turn target's chat record into a usable array
            const targetChats = parseChats(tRow?.chats ?? '');

            // Try to find the chat that they both share
            const chatId = userChats.find(id => targetChats.includes(id));
            if (!chatId) return res.status(404).send('Chat with that user not found');

            // Get the chat content
            app.database.get('SELECT contents FROM chats WHERE id = ?', [chatId], (err3, chatRow) => {
                if (err3) return res.status(500).send('Internal server error');
                if (!chatRow) return res.status(404).send('Chat record not found');

                let contents = [];
                try { contents = JSON.parse(chatRow.contents); } catch { /* fallback to empty */ }

                // Add the new message as an object to keep sender info
                contents.push({
                    sender: sessionUser,
                    text: message,
                    ts: Date.now() // optional timestamp, I thought I could implement it.
                    // Probably not. This project was slavery.
                });

                // Write the chat back into the database
                app.database.run(
                    'UPDATE chats SET contents = ? WHERE id = ?',
                    [JSON.stringify(contents), chatId],
                    err4 => {
                        if (err4) return res.status(500).send('Failed to push message');
                        
                        // Finally. I'm done.
                        res.status(200).json({ message: 'Message pushed successfully' });
                    }
                );
            });
        });
    });
}
