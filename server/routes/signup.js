/**
 * This function handles user registration.
 * It checks if the user already exists and inserts a new user into the database.
 * 
 * @author Bashar Zain
 * 
 * @param {Express} app The express application instance
 * @param {*} req The request object
 * @param {*} res The response object
 * @return {void}
 */
export default function (app, req, res) {
    // Get the necessary parameters from the request
    const { user, email, pass, phone } = req.query;

    // Validate the parameters
    if (!user || !email || !pass || !phone) {
      return res.status(400).send('Missing required parameters');
    }

    // Assume lengths
    if (user.length < 3 || user.length > 20) {
      return res.status(400).send('Username must be between 3 and 20 characters');
    }

    // Check if the data already exists in the database (username is unique)
    app.database.get('SELECT * FROM users WHERE username = ?', [user], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).send('Internal server error');
      }

      if (row) {
        return res.status(409).send('Username already exists');
      }

      // Insert the new user into the database
      app.database.run(
        'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
        [user, email, pass, phone],
        function(err) {
          if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Internal server error');
          }
          res.status(201).send('User created successfully');
        }
      );
    });
}