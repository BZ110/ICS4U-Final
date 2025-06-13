/**
 * @file index.js
 * @description This file is the entry point of the API.
 * It sets up the express server and imports the routes.
 * 
 * @author Bashar Zain
 */

// Import everything needed
import express from 'express';
import { setupRoutes } from './routes.js';
import fs from 'fs';
import { Database } from './database.js';

// We must use the FS module due to new JavaScript ES modules limitations
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Create an express app
const app = express();

// Initialize the database.
const db = new Database(config.database.name, config.database.path);

// Initialize the database. Top level await is supported in ES modules.
await db.init(config.database.verbose);

// Peg the database to the app.
app.database = db.connection;

// Peg sign in keys.
app.keys = {};

// Peg the config.
app.config = config;

// Set the port
const PORT = config.port || 3000;

// Set the routes
setupRoutes(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}! Welcome :3`);
});