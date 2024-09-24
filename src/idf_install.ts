import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import { PathLike } from 'fs';
import { Logger } from './Logger';

let idf_location: PathLike | undefined = "$HOME/esp/v5.3.1";

function checkForInstallationCompletion() {
    const interval = 5000; // Check every 5 seconds
    const timeout = 600000; // Timeout after 10 minutes
    const startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
            const espidfconfig = vscode.workspace.getConfiguration("idf");
            idf_location = espidfconfig.get<string>("espIdfPath");

            if (idf_location) {
                vscode.window.showInformationMessage(`ESP-IDF location configured: ${idf_location}`);
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                vscode.window.showErrorMessage('Timed out waiting for ESP-IDF installation.');
                clearInterval(checkInterval);
                reject(new Error('Installation timeout'));
            }
        }, interval);
    });
}

export function get_idf_location(): string | undefined {
    const espidfconfig = vscode.workspace.getConfiguration("idf");
    idf_location = espidfconfig.get<string>("espIdfPath");
    return idf_location;
}

export async function installIDFthruExt(context: vscode.ExtensionContext) {
    const command = 'espIdf.setup.start';
    vscode.commands.executeCommand(command);
    vscode.window.showInformationMessage('ESP-IDF setup has been initialized please complete the installation process using Express installation');
    checkForInstallationCompletion();
    installIDF(context);
}


export function isWeb(): boolean {
    return vscode.env.remoteName === "vscode-web";
}

export async function installIDF(context: vscode.ExtensionContext): Promise<void> {
    let scriptPath: string | undefined;
    let platform: string = os.platform();
    let logger = Logger.getInstance();
    logger.show();
    switch (platform) {
        case 'darwin':
        case 'linux':
            scriptPath = path.join(context.extensionPath, 'src', 'pre-requisites', 'install_IDF', 'install.sh');
            break;
        default:
            logger.error(`Unsupported operating system: ${platform}`);
            return;
    }

    if (!idf_location) {
        get_idf_location();
    }

    if (scriptPath) {
        const installProcess = spawn('sh', [`${idf_location}`]);
        installProcess.stdout.on("data", (data) => {
            logger.info(data);
        });
        installProcess.stderr.on("data", (data) => {
            logger.error(data);
        });
        installProcess.on("exit", (code) => {
            if (code === 0) {
                logger.info("ESP IDF has been installed successfully");
            }
        });
    }
}

export function completeIDFInstallation(): void{
    let logger = Logger.getInstance();
    logger.show();
    const installProcess = spawn('git', ['clone', '-b', 'v5.3.1', '--recursive', 'https://github.com/espressif/esp-idf.git', `${idf_location}`]);
    installProcess.stdout.on("data", (data) => {
        logger.info(data);
    });
    installProcess.stderr.on("data", (data) => {
        logger.error(data);
    });
    installProcess.on("exit", (code) => {
        if (code === 0) {
            logger.info("ESP IDF has been successfully cloned");
        }
    });
    
}