import { spawn } from "child_process";
import path from "path";
import { Logger } from "./../Logger";

export function installMatter(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let logger = Logger.getInstance();
        logger.show();
        const scriptPath = path.join(__dirname, "build-setup", "install_matter.sh");
        logger.info(`Executing script at: ${scriptPath}`);
        const installProcess = spawn("sh", [scriptPath]);
        installProcess.stdout.on("data", (data) => {
            logger.info(data);
        });
        installProcess.stderr.on("data", (data) => {
            logger.error(data);
        });
        installProcess.on("exit", (code) => {
            if (code === 0) {
                logger.info("Matter has been successfully cloned");
                resolve();
            }
            else {
                logger.error("Unexpected error encountered");
                reject(new Error("Installation process exited with code " + code));
            }
        });
    });
}