/**
 * Return every chat ID (and optionally the full message logs) for the signed‑in user.
 * Required: id (session token).
 * Optional: full=true … include messages instead of just ids.
 */
export default function getAllChats(app, req, res) {
  const { id, full } = req.query;

  if (!id) return res.status(400).send('Session id is required');

  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  app.database.get(
    'SELECT chats FROM users WHERE username = ?',
    [user],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Internal DB error');
      }
      const chatIds = row?.chats ? JSON.parse(row.chats) : [];

      if (!full || chatIds.length === 0)
        return res.status(200).json({ chats: chatIds });

      // Pull every chat in parallel
      const placeholders = chatIds.map(() => '?').join(',');
      app.database.all(
        `SELECT id, contents FROM chats WHERE id IN (${placeholders})`,
        chatIds,
        (e, rows) => {
          if (e) {
            console.error(e.message);
            return res.status(500).send('Could not fetch chats');
          }
          const chats = rows.map(r => ({
            id: r.id,
            messages: JSON.parse(r.contents),
          }));
          res.status(200).json({ chats });
        }
      );
    }
  );
}
