/**
 * Delete an article (only its author can delete it).
 * Required: id (session), articleId
 */
export default function deleteArticle(app, req, res) {
  const { id, articleId } = req.query;
  if (!id || !articleId)
    return res.status(400).send('Missing required parameters');

  const user = Object.keys(app.keys).find(k => app.keys[k] === id);
  if (!user) return res.status(404).send('Invalid session');

  app.database.get(
    'SELECT author FROM articles WHERE id = ?',
    [articleId],
    (err, row) => {
      if (err) return res.status(500).send('DB error');
      if (!row) return res.status(404).send('Article not found');
      if (row.author !== user) return res.status(403).send('Not your article');

      app.database.run(
        'DELETE FROM articles WHERE id = ?',
        [articleId],
        delErr => {
          if (delErr) return res.status(500).send('Delete failed');
          res.status(200).send('Article deleted');
        }
      );
    }
  );
}
