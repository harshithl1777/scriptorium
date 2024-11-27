// pages/api/execute.ts

import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { APIHelper } from '@/utils/helpers';

const TEMP_DIR = path.join(process.cwd(), 'temp');
const TIMEOUT_MS = 5000; // Maximum execution time in milliseconds

// Helper functions (same as before but in TypeScript)
function createTempFile(language: string, code: string): string {
    const filename = language === 'Java' ? 'Main.java' : `${uuidv4()}.${getFileExtension(language)}`;
    const filePath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filePath, code);
    return filePath;
}

function createTempInputFile(stdin: string): string {
    const inputFilePath = path.join(TEMP_DIR, `${uuidv4()}.txt`);
    fs.writeFileSync(inputFilePath, stdin);
    return inputFilePath;
}

function getFileExtension(language: string): string {
    switch (language) {
        case 'C':
            return 'c';
        case 'C++':
            return 'cpp';
        case 'Java':
            return 'java';
        case 'Python':
            return 'py';
        case 'JavaScript':
            return 'js';
        default:
            throw new Error('Unsupported language');
    }
}

function getCommand(language: string, filePath: string, inputFilePath: string | null): string {
    const inputRedirection = inputFilePath ? `< "${inputFilePath}"` : '';
    switch (language) {
        case 'C':
            return `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" ${inputRedirection}`;
        case 'C++':
            return `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" ${inputRedirection}`;
        case 'Java':
            return `javac "${filePath}" && java -cp "${TEMP_DIR}" Main ${inputRedirection}`;
        case 'Python':
            return `python3 "${filePath}" ${inputRedirection}`;
        case 'JavaScript':
            return `node "${filePath}" ${inputRedirection}`;
        default:
            throw new Error('Unsupported language');
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code, language, stdin } = body;

    if (!code || !language) {
        return APIHelper.createNextResponse({ success: false, status: 400, message: 'Code and language are required' });
    }

    return new Promise((resolve) => {
        try {
            if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

            const filePath = createTempFile(language, code);
            const inputFilePath = stdin ? createTempInputFile(stdin) : null;
            const command = getCommand(language, filePath, inputFilePath);

            const startTime = Date.now();

            exec(command, { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                const endTime = Date.now();
                const timeTaken = endTime - startTime;

                // Clean up temp files
                fs.unlinkSync(filePath);
                if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

                if (['C', 'C++'].includes(language)) {
                    const outputFilePath = `${filePath}.out`;
                    if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
                }

                if (language === 'Java') {
                    const classFilePath = path.join(TEMP_DIR, 'Main.class');
                    if (fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);
                }

                const response = {
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    timeTaken,
                    success: !error || (error && !error.killed && error.code !== 'ENOMEM'),
                };

                if (error) {
                    if (error.killed) {
                        response.stderr = 'Error: Execution timed out. Please optimize your code and try again.';
                        response.success = false;
                    } else if (error.code === 'ENOMEM' || error.message.includes('ENOMEM')) {
                        response.stderr = 'Error: Execution failed due to memory limits. Please optimize your code and try again.';
                        response.success = false;
                    }
                }

                resolve(APIHelper.createNextResponse({ success: true, status: 200, payload: response }));
            });
        } catch (err) {
            console.error(err);
            resolve(APIHelper.createNextResponse({ success: false, status: 500, message: 'Server error' }));
        }
    });
}