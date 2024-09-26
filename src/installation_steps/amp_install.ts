import { spawn } from "child_process";
import path from "path";
import { Logger } from "./../Logger";

const amp_location: string = path.join("$HOME", "esp", "esp-amp");
export function installAMP(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let logger = Logger.getInstance();
        logger.show();
        if (!amp_location) {
            reject(new Error("AMP location not found"));
            return;
        }
        const installProcess = spawn("sh", [path.join(__dirname, "build-setup", "install_amp.sh"), amp_location]);
        installProcess.stdout.on("data", (data) => {
            logger.info(data);
        });
        installProcess.stderr.on("data", (data) => {
            logger.error(data);
        });
        installProcess.on("exit", (code) => {
            if (code === 0) {
                logger.info("AMP has been successfully cloned");
                resolve();
            }
            else {
                logger.error("Unexpected error encountered");
                reject(new Error("Installation process exited with code " + code));
            }
        });
    });
}