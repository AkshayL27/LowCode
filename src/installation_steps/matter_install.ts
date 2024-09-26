import { spawn } from "child_process";
import path from "path";
import { Logger } from "./../Logger";

export const matter_location: string = path.join("$HOME", "esp", "esp_matter");
export function installMatter(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let logger = Logger.getInstance();
        logger.show();
        if (!matter_location) {
            reject(new Error("Matter location not found"));
            return;
        }
        const installProcess = spawn("sh", [path.join(__dirname, "build-setup", "install_matter.sh"), matter_location]);
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