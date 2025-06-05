/**
 * Create a new knowledge‑base article.
 * Required: id (session), contents, language
 */
export default function createArticle(app, req, res) {
  const { id, contents, language } = req.query;
  if (!id || !contents || !language)
    return res.status(400).send('Missing required parameters');

  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  app.database.run(
    'INSERT INTO articles (contents, language, author) VALUES (?,?,?)',
    [contents, language, user],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Failed to create article');
      }
      res.status(201).json({ articleId: this.lastID });
    }
  );
}
