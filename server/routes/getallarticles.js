/**
 * Retrieve every article. If the caller passes mine=true
 * they only get their own articles.
 * Required: id (session)
 */
export default function getAllArticles(app, req, res) {
  const { id, mine } = req.query;
  if (!id) return res.status(400).send('Session id is required');

  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  const sql = mine ? 'SELECT * FROM articles WHERE author = ?' : 'SELECT * FROM articles';
  const params = mine ? [user] : [];

  app.database.all(sql, params, (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.status(200).json(
      rows.map(r => ({
        id: r.id,
        contents: r.contents,
        language: r.language,
        author: r.author,
      }))
    );
  });
}
