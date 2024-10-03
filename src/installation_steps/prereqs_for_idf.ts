import { spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { Logger } from '../Logger';

export async function installDependencies(): Promise<void> {
    new Promise<void>(async (resolve, reject) => {
        let scriptPath: string | undefined;
        let platform: string = os.platform();
        let logger = Logger.getInstance();
        logger.show();
        switch (platform) {
            case 'darwin':
                scriptPath = path.join(__dirname, 'pre-requisites', 'macos', 'mac_prereqs.sh');
                break;
            case 'linux':
                scriptPath = path.join(__dirname, 'pre-requisites', 'linux', 'ubuntu_prereqs.sh');
                break;
            default:
                logger.error(`Unsupported operating system: ${platform}`);
                reject(new Error(`Unsupported operating system: ${platform}`));
                return;
        }

        if (scriptPath) {
            const installProcess = spawn("sh", [`${scriptPath}`]);
            installProcess.stdout.on("data", (data) => {
                logger.info(data);
            });
            installProcess.stderr.on("data", (data) => {
                logger.error(data);
            });
            installProcess.on("exit", (code) => {
                if (code === 0) {
                    logger.info("Dependencies installed successfully");
                    resolve();
                } else {
                    logger.error("Unexpected error encountered");
                    reject(new Error(`Installation process exited with code ${code}`));
                }
            });
        }
    });
}
