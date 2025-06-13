/**
 * Database configuration file
 * @file database.js
 * @description This file contains the database configuration for the API.
 * It sort of acts like a database connection file.
 * 
 * @author Bashar Zain
 */

// Import necessary modules
import sqlite3 from 'sqlite3';
import fs from 'fs';

export class Database {

    // Private fields to store the database name, path, and connection.
    /**
     * @private
     * @type {String}
     */
    #name;

    /**
     * @private
     * @type {String}
     */
    #path;

    /**
     * @private
     * @type {sqlite3.Database|null}
     */
    #db;
    
    /**
     * This constructor initializes the database configuration.
     * It sets the name and path of the database.
     * @param {String} name Indicates the name of the database file
     * @param {String} path Indicates the path to the database file
     * @returns {Database} Returns the database instance. You must initialize it with the `init` method.
     * @throws {Error} Invalid parameters were given.
    */
    constructor(name = 'sqlite.#db', path = './database') {
        this.#name = name;
        this.#path = path;
        this.#db = null;

        // Validate parameters
        if (typeof name !== 'string' || typeof path !== 'string') {
            throw new Error('Invalid parameters: name and path must be strings.');
        }
    }

    /**
     * Initializes the database connection.
     * This should probably await this.
     * @param {Boolean} verbose Indicates whether to log verbose output to the console
     * @returns {Promise} Returns a promise that resolves when the database is initialized.
     * @throws {Error} Throws an error if the database connection fails.
     */
    init(verbose = false) {
        // Return a new promise, meaning we "promise" that this code will eventually have something, we just need to wait.
        return new Promise((resolve, reject) => {

            // If verbose is true, enable verbose logging for sqlite3
            if (verbose) sqlite3.verbose();
            
            if (!fs.existsSync(this.#path)) {
                // If the path does not exist, create it
                fs.mkdirSync(this.#path, { recursive: true });
                console.log(`Database path created: ${this.#path}`);
            }

            // Open the database connection using sqlite3
            this.#db = new sqlite3.Database(`${this.#path}/${this.#name}`, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                    throw new Error(`Failed to open database: ${err.message}`);
                } else {
                    console.log('Database connection established successfully.');
                    resolve(this.#db);
                }
            });
        });
    }

    /**
     * This method gets the database connection.
     * @returns {sqlite3.Database} Returns the database connection instance.
     * @throws {Error} Throws an error if the database is not initialized.
     */
    get connection() {
        // Return the database connection
        if (!this.#db) {
            throw new Error('Database is not initialized. Please call init() first.');
        }

        // Before returning the connection, ensure the tables are initialized
        this.initTables();

        // Return the database connection
        return this.#db;
    }

    /**
     * @description Initializes the necessary tables in the database.
     * This method should be called after the database is initialized.
     * 
     * @returns {void}
     * @throws {Error} Throws an error if the table creation fails.
     * 
     */
    initTables() {
        // Initialize the necessary tables in the database
        this.#db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            chats TEXT,
            phone TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table created or already exists.');
            }
        });


        // Do a chat table, probably save ID then a JSON.
        this.#db.run(`CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contents JSON NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating chats table:', err.message);
            } else {
                console.log('Chats table created or already exists.');
            }
        });
    }
}