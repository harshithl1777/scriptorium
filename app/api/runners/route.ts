import { NextRequest } from 'next/server';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { APIUtils } from '@/utils';

const CONTAINER_NAME = 'scriptorium'; // Name of the predefined container
const WORKSPACE_DIR = '/workspace'; // Directory inside the container
const TIMEOUT_MS = 5000; // Execution timeout in ms

// Function to create a temporary file locally on the host
function createTempFileLocally(language: string, code: string): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = language === 'Java' ? 'Main.java' : `${uuidv4()}.${getFileExtension(language)}`;
    const filePath = path.join(tempDir, filename);

    fs.writeFileSync(filePath, code);

    return filePath;
}

// Function to copy the file to the Docker container
function copyFileToContainer(filePath: string, containerPath: string): void {
    try {
        execSync(`docker cp "${filePath}" ${CONTAINER_NAME}:${containerPath}`);
    } catch (error) {
        console.error('Error copying file to container', error);
        throw new Error('Failed to copy file to container');
    }
}

// Function to clean up the container file after execution
function cleanupContainerFile(containerFilePath: string): void {
    execSync(`docker exec ${CONTAINER_NAME} rm -f ${containerFilePath}`);
}

// Function to create a temporary input file for stdin (with multiple inputs)
function createTempInputFile(inputs: string[]): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Join multiple inputs with a newline character (or any other separator)
    const inputData = inputs.join('\n');
    const inputFilename = `${uuidv4()}.txt`;
    const inputFilePath = path.join(tempDir, inputFilename);
    fs.writeFileSync(inputFilePath, inputData);

    return inputFilePath; // Ensure this file is created locally before copying
}

// Get file extension based on language
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
        case 'Ruby':
            return 'rb';
        case 'Go':
            return 'go';
        case 'PHP':
            return 'php';
        case 'Rust':
            return 'rs';
        case 'Swift':
            return 'swift';
        default:
            throw new Error('Unsupported language');
    }
}

// Generate the command based on the language to execute the code
function getCommand(language: string, filePath: string, inputFilePath: string | null): string {
    const inputRedirection = inputFilePath ? `< ${inputFilePath}` : '';
    switch (language) {
        case 'C':
            return `gcc "${filePath}" -o "${filePath}.out" && "${filePath}.out" ${inputRedirection}`;
        case 'C++':
            return `g++ "${filePath}" -o "${filePath}.out" && "${filePath}.out" ${inputRedirection}`;
        case 'Java':
            return `javac "${filePath}" && java -cp "${WORKSPACE_DIR}" Main ${inputRedirection}`;
        case 'Python':
            return `python3 "${filePath}" ${inputRedirection}`;
        case 'JavaScript':
            return `node "${filePath}" ${inputRedirection}`;
        case 'Ruby':
            return `ruby "${filePath}" ${inputRedirection}`;
        case 'Go':
            return `go run "${filePath}" ${inputRedirection}`;
        case 'PHP':
            return `php "${filePath}" ${inputRedirection}`;
        case 'Rust':
            return `rustc "${filePath}" && "${filePath}" ${inputRedirection}`;
        case 'Swift':
            return `swift "${filePath}" ${inputRedirection}`;
        default:
            throw new Error('Unsupported language');
    }
}

// Main POST function to handle the code execution request
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code, language, stdin } = body;

    if (!code || !language) {
        return APIUtils.createNextResponse({ success: false, status: 400, message: 'Code and language are required' });
    }

    return new Promise((resolve) => {
        try {
            // Step 1: Create the temp file locally with the code
            const localFilePath = createTempFileLocally(language, code);

            // Step 2: Copy the local code file to the container
            const containerPath = `${WORKSPACE_DIR}/${path.basename(localFilePath)}`;
            copyFileToContainer(localFilePath, containerPath);

            // (Optional) Clean up the local code file after it's copied
            fs.unlinkSync(localFilePath);

            // Step 3: Create an input file if stdin is provided
            let inputFilePath: string | null = null;
            if (stdin && Array.isArray(stdin)) {
                inputFilePath = createTempInputFile(stdin); // stdin is an array of multiple inputs
            }

            // Step 4: Copy the input file to the container if it exists
            if (inputFilePath) {
                const inputContainerPath = `${WORKSPACE_DIR}/${path.basename(inputFilePath)}`;
                copyFileToContainer(inputFilePath, inputContainerPath);
                fs.unlinkSync(inputFilePath); // Clean up the local input file
            }

            // Step 5: Prepare the command to execute the code
            const command = getCommand(
                language,
                containerPath,
                inputFilePath ? `${WORKSPACE_DIR}/${path.basename(inputFilePath)}` : null,
            );

            const startTime = Date.now();

            exec(
                `docker exec ${CONTAINER_NAME} bash -c "${command}"`,
                { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
                (error, stdout, stderr) => {
                    const endTime = Date.now();
                    const timeTaken = endTime - startTime;

                    // Step 6: Clean up files in the container
                    cleanupContainerFile(containerPath);
                    if (inputFilePath) cleanupContainerFile(`${WORKSPACE_DIR}/${path.basename(inputFilePath)}`);

                    const response = {
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        timeTaken,
                        success:
                            !error ||
                            (error && !error.killed && (!error.message.includes('ENOMEM') || error.code === undefined)),
                    };

                    if (error) {
                        if (error.killed) {
                            response.stderr = 'Error: Execution timed out. Please optimize your code and try again.';
                            response.success = false;
                        } else if (error.message.includes('ENOMEM')) {
                            response.stderr =
                                'Error: Execution failed due to memory limits. Please optimize your code and try again.';
                            response.success = false;
                        }
                    }

                    resolve(APIUtils.createNextResponse({ success: true, status: 200, payload: response }));
                },
            );
        } catch (error: any) {
            APIUtils.logError(error);
            resolve(APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() }));
        }
    });
}
