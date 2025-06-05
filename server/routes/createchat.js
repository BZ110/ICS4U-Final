/**
 * Create a brand‑new chat and attach it to the signed‑in user.
 * Required query params: id (session token)
 * Optional: first (JSON‑encoded first message object – same schema as /text)
 */
export default function createChat(app, req, res) {
  const { id, first } = req.query;

  if (!id) return res.status(400).send('Session id is required');

  // map session → username
  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  // prepare initial contents array
  let contents = [];
  if (first) {
    try {
      const msg = JSON.parse(first);
      if (!msg.content || !msg.timestamp || !msg.sender)
        return res.status(400).send('First message has invalid schema');
      contents.push(msg);
    } catch {
      return res.status(400).send('Unable to parse first message JSON');
    }
  }

  // 1️⃣ insert new row in chats
  app.database.run(
    'INSERT INTO chats (contents) VALUES (?)',
    [JSON.stringify(contents)],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Failed to create chat');
      }
      const chatId = this.lastID;

      // 2️⃣ append chat id to user’s chat list
      app.database.get(
        'SELECT chats FROM users WHERE username = ?',
        [user],
        (e, row) => {
          if (e) {
            console.error(e.message);
            return res.status(500).send('Failed to update user chats');
          }
          const list = row?.chats ? JSON.parse(row.chats) : [];
          list.push(chatId);
          app.database.run(
            'UPDATE users SET chats = ? WHERE username = ?',
            [JSON.stringify(list), user],
            uErr => {
              if (uErr) {
                console.error(uErr.message);
                return res.status(500).send('Failed to link chat to user');
              }
              res.status(201).json({ chatId, messages: contents });
            }
          );
        }
      );
    }
  );
}
