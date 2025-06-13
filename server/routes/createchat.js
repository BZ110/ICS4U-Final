/**
 * Create a brand‑new chat and attach it to the signed‑in user and optional target.
 * 
 * @author Bashar Zain
 * @param {Express App} app The application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */
export default function createChat(app, req, res) {
  const { id, first, target } = req.query;

  if (!id) return res.status(400).send('Session id is required');

  // map session -> username
  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  // prepare initial contents array
  const contents = first ? [first] : [];

  app.database.run(
    'INSERT INTO chats (contents) VALUES (?)',
    [JSON.stringify(contents)],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Failed to create chat');
      }

      const chatId = this.lastID;

      const linkToUser = (username, cb) => {
        app.database.get(
          'SELECT chats FROM users WHERE username = ?',
          [username],
          (e, row) => {
            if (e) {
              console.error(`Failed to fetch chats for ${username}:`, e.message);
              return cb(e);
            }
            const list = parseChats(row?.chats);
            list.push(chatId);
            app.database.run(
              'UPDATE users SET chats = ? WHERE username = ?',
              [JSON.stringify(list), username],
              uErr => {
                if (uErr) {
                  console.error(`Failed to update chats for ${username}:`, uErr.message);
                  return cb(uErr);
                }
                cb(null);
              }
            );
          }
        );
      };

      // Link to the signed-in user
      linkToUser(user, err1 => {
        if (err1) return res.status(500).send('Failed to link chat to user');

        // Optionally link to the target user
        if (target) {
          linkToUser(target, err2 => {
            if (err2) return res.status(500).send('Failed to link chat to target user');
            res.status(201).json({ chatId, messages: contents });
          });
        } else {
          res.status(201).json({ chatId, messages: contents });
        }
      });
    }
  );
}

/**
 * Parse the chats in a readable manner.
 * 
 * @author Bashar Zain
 * @param raw The thing you're parsing.
 * @return The parsed result.
 */
const parseChats = raw => {
  if (!raw || raw === 'null') return [];

  try {
    // Try easily parsing it with JSON.parse()
    const parsed = JSON.parse(raw);
    
    // Return if it's an array, then we'll return it, else return nothing. Good null/undefined handling.
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(',')
              .map(s => s.trim())
              .filter(Boolean);
  }
};