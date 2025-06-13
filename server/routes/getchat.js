/**
 * Get chat messages for a specific chat between two users.
 * 
 * @author Bashar Zain
 * @param {Express App} app  The application instance
 * @param {*} req            The request object
 * @param {*} res            The response object
 * @return {void}
 */
export default function getChat(app, req, res) {
    // Pull the session and target usernames from the query
    const { id, targetUser } = req.query;

    // Make sure we have what we need
    if (!id || !targetUser) {
        return res.status(400).json({ error: 'Session ID and target user are required' });
    }

    // Convert session token -> username
    const sessionUser = Object.keys(app.keys).find(key => app.keys[key] === id);
    if (!sessionUser) {
        return res.status(404).json({ error: 'Invalid session ID' });
    }

    // Helper that makes a JSON list
    const parseList = raw => {
        try   { return JSON.parse(raw); }
        catch { return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []; }
    };

    /*
     * Get BOTH users chat‑ID lists so we can find the intersection.
     * This prevents returning a chat that belongs to a different friend.
     */
    app.database.get('SELECT chats FROM users WHERE username = ?', [sessionUser], (err, sRow) => {
        
        // Error handling
        if (err)  return res.status(500).json({ error: 'Internal server error' });
        if (!sRow) return res.status(404).json({ error: 'No chats found for user' });

        const userChats = parseList(sRow.chats);

        // Now fetch target’s chat list
        app.database.get('SELECT chats FROM users WHERE username = ?', [targetUser], (err2, tRow) => {
            if (err2)  return res.status(500).json({ error: 'Internal server error' });
            if (!tRow) return res.status(404).json({ error: 'Target user not found' });

            const targetChats = parseList(tRow.chats);

            // Find common chat IDs (could be more than one)
            const commonIds = userChats.filter(id => targetChats.includes(id));
            if (commonIds.length === 0) {
                return res.status(404).json({ error: 'Chat with that user not found' });
            }

            /*
             * Scan each shared chat until we hit one with contents.
             * If multiple chats exist, the first one (array order) wins.
             */
            let processed = 0, sent = false;

            for (const chatId of commonIds) {
                app.database.get('SELECT contents FROM chats WHERE id = ?', [chatId], (err3, chatRow) => {
                    processed++;
                    if (sent) return; // we already replied

                    if (!err3 && chatRow && chatRow.contents) {
                        let msgs;
                        try { msgs = JSON.parse(chatRow.contents); }
                        catch { msgs = []; }

                        if (Array.isArray(msgs)) {
                            sent = true; // make sure we only send once

                            // Build response in legacy format
                            const response = {
                                chats: msgs.length,
                                yourUsername: sessionUser,
                                theirUsername: targetUser
                            };

                            msgs.forEach((entry, idx) => {
                                let sender, text;

                                // Legacy string → assume alternating
                                if (typeof entry === 'string') {
                                    sender = idx % 2 === 0 ? sessionUser : targetUser;
                                    text = entry;
                                } else {
                                    sender = entry.sender ?? '(unknown)';
                                    text = entry.text;
                                }

                                response[`${sender}-${idx + 1}`] = text;
                            });

                            return res.status(200).json(response);
                        }
                    }

                    // Once all common IDs tried with no success
                    if (processed === commonIds.length && !sent) {
                        return res.status(404).json({ error: 'Chat with that user not found' });
                    }
                });
            }
        });
    });
}
