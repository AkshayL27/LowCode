import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import { Logger } from '../Logger';
import { installDependencies } from './pre_reqs_for_IDF';

let idf_location: string | undefined;

function checkForInstallationCompletion() {
    const interval = 5000;
    const timeout = 600000;
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

export async function installIDFthruExt() {
    const command = 'espIdf.setup.start';
    vscode.commands.executeCommand(command);
    vscode.window.showInformationMessage('ESP-IDF setup has been initialized please complete the installation process using Express installation');
    checkForInstallationCompletion();
    installDependencies();
}



export function completeIDFInstallation(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        installDependencies().catch((err) => {
            reject(err);
        });
        let logger = Logger.getInstance();
        logger.show();
        if (!idf_location) {
            reject(new Error("IDF location not found"));
            return;
        }
        const installProcess = spawn("sh", [path.join(__dirname, "build-setup", "install_idf.sh"), idf_location]);
        installProcess.stdout.on("data", (data) => {
            logger.info(data);
        });
        installProcess.stderr.on("data", (data) => {
            logger.error(data);
        });
        installProcess.on("exit", (code) => {
            if (code === 0) {
                logger.info("ESP IDF has been successfully cloned");
                resolve();
            }
            else {
                logger.error("Unexpected error encountered");
                reject(new Error("Installation process exited with code " + code));
            }
        });
    });
}