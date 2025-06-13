/**
 * @file routes.js
 * @description This file contains the routes for the API.
 * It defines the endpoints and their handlers.
 * 
 * @author Bashar Zain
 * 
 * @param {Express App} app The application instance 
 */

/*
    Available routes:
    - GET /: Returns a message indicating the API is working
    - GET /signup: Signs the user up
    - GET /signin: Signs the user in
    - GET /signout: Signs the user out
    - GET /get: Gets the user data
    - GET /getchat: Gets a specific chat
    - GET /createchat: Creates a new chat
*/

// Declare imports
import singUpRoute from './routes/signup.js';
import signInRoute from './routes/signin.js';
import signOutRoute from './routes/signout.js';
import getUser from './routes/get.js';
import getChat from './routes/getchat.js';
import createChat from './routes/createchat.js';
import pushMessage from './routes/pushMessage.js';
import getOnline from './routes/getonline.js';

export function setupRoutes(app) {

  // DEFAULT ROUTE
  app.get('/', (req, res) => {
    // Send a code 200, and a response message
    res.status(200).send('API is WORKING!');
  });


  app.get('/', (req, res) => res.status(200).send('API is WORKING!'));
  app.get('/signup', (req, res) => singUpRoute(app, req, res));
  app.get('/signin', (req, res) => signInRoute(app, req, res));
  app.get('/signout', (req, res) => signOutRoute(app, req, res));
  app.get('/getinfo', (req, res) => getUser(app, req, res));
  app.get('/getonline', (req, res) => getOnline(app, req, res));
  app.get('/pushMessage', (req, res) => pushMessage(app, req, res));
  app.get('/getchat', (req, res) => getChat(app, req, res));

  app.get('/createchat', (req, res) => createChat(app, req, res));

}