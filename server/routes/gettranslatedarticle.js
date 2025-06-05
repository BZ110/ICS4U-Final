/**
 * Dummy translation endpoint. In a real system you’d
 * call an external translation API here.
 * Required: articleId, target
 */
export default function getTranslatedArticle(app, req, res) {
  const { articleId, target } = req.query;
  if (!articleId || !target)
    return res.status(400).send('Missing required parameters');

  app.database.get(
    'SELECT contents, language FROM articles WHERE id = ?',
    [articleId],
    (err, row) => {
      if (err) return res.status(500).send('DB error');
      if (!row) return res.status(404).send('Article not found');

      // VERY naive fallback “translation”
      const translated =
        row.language === target
          ? row.contents
          : `[${row.language}→${target}] ${row.contents}`;

      res.status(200).json({
        articleId,
        originalLanguage: row.language,
        targetLanguage: target,
        contents: translated,
      });
    }
  );
}
