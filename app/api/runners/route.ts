import { NextRequest } from 'next/server';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { APIUtils } from '@/utils';

const CONTAINER_NAME = 'jolly_zhukovsky'; // Name of the predefined container
const WORKSPACE_DIR = '/workspace'; // Directory inside the container
const TIMEOUT_MS = 5000; // Execution timeout in ms

function createTempFile(language: string, code: string): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const filename = language === 'Java' ? 'Main.java' : `${uuidv4()}.${getFileExtension(language)}`;
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, code);

    const containerPath = `${WORKSPACE_DIR}/${filename}`;
    execSync(`docker cp ${filePath} ${CONTAINER_NAME}:${containerPath}`);
    fs.unlinkSync(filePath); // Clean up the host temp file

    return containerPath;
}

function createTempInputFile(stdin: string): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const inputFilename = `${uuidv4()}.txt`;
    const inputFilePath = path.join(tempDir, inputFilename);
    fs.writeFileSync(inputFilePath, stdin);

    const containerInputPath = `${WORKSPACE_DIR}/${inputFilename}`;
    execSync(`docker cp ${inputFilePath} ${CONTAINER_NAME}:${containerInputPath}`);
    fs.unlinkSync(inputFilePath); // Clean up the host temp file

    return containerInputPath;
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

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code, language, stdin } = body;

    if (!code || !language) {
        return APIUtils.createNextResponse({ success: false, status: 400, message: 'Code and language are required' });
    }

    return new Promise((resolve) => {
        try {
            const filePath = createTempFile(language, code);
            const inputFilePath = stdin ? createTempInputFile(stdin) : null;
            const command = getCommand(language, filePath, inputFilePath);

            const startTime = Date.now();

            exec(
                `docker exec ${CONTAINER_NAME} bash -c "${command}"`,
                { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
                (error, stdout, stderr) => {
                    const endTime = Date.now();
                    const timeTaken = endTime - startTime;

                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    if (inputFilePath && fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);

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
