// utils/logger.ts

import fs from 'fs';
import path from 'path';

// Define the log file path
const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'error.log');

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
    fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

/**
 * Logs an error to the console and writes it to a log file.
 * @param error The error object or message to log.
 */
export function logError(error: any): void {
    const timestamp = new Date().toISOString();
    const errorMessage = typeof error === 'string' ? error : error.stack || error.message || JSON.stringify(error);
    const logMessage = `[${timestamp}] ERROR: ${errorMessage}\n`;

    // Log to the console
    console.error(logMessage);

    // Append the error message to the log file
    fs.appendFile(LOG_FILE_PATH, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
}