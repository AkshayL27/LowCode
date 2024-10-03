import { PathLike, readdirSync, statSync} from "fs";
import * as path from "path";
import { get_idf_location } from "./installation_steps/idf_install";
import * as vscode from "vscode";
export async function get_product_list(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const idf_location = get_idf_location();
        if (!idf_location) {
            vscode.window.showWarningMessage("Could not find ESP IDF");
            return reject(new Error("No location found for esp IDF"));
        }
        const examplesPath = path.join(idf_location, 'examples');
        try {
            const items = readdirSync(examplesPath);
            const folders = items.filter(item => {
                const itemPath = path.join(examplesPath, item);
                return statSync(itemPath).isDirectory();
            });
            return resolve(folders);
        } catch (err) {
            reject(err);
        }
    });
}