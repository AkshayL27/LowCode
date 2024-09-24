import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from './Logger';

const execPromise = promisify(exec);

export async function installDependencies(context: vscode.ExtensionContext): Promise<void> {
    let scriptPath: string | undefined;
    let platform: string = os.platform();
    let logger = Logger.getInstance();
    logger.show();
    switch (platform) {
        case 'darwin':
            scriptPath = path.join(context.extensionPath, 'src', 'pre-requisites', 'macos', 'mac_prereqs.sh');
            break;
        case 'linux':
            scriptPath = path.join(context.extensionPath, 'src', 'pre-requisites', 'ubuntu', 'ubuntu_prereqs.sh');
            break;
        default:
            logger.error(`Unsupported operating system: ${platform}`);
            return;
    }

    if (scriptPath) {
        try {
            const { stdout, stderr } = await execPromise(`bash ${scriptPath}`);
            if (stdout) {
                logger.info(`\n${stdout}`);
            }
            if (stderr) {
                logger.error(`\n${stderr}`);
            }
        } catch (error) {
            // Type assertion to handle unknown error type
            if (error instanceof Error) {
                logger.error(`Error executing script: ${error.message}`);
                vscode.window.showErrorMessage(error.message);
            } else {
                logger.error('Error executing script: An unknown error occurred.');
                vscode.window.showErrorMessage('An unknown error occurred during ESP-IDF installation.');
            }
        }
    }
}
