import { installIDFthruExt } from "./idf_install";
import { installMatter } from "./matter_install";
//import { installAMP } from "./amp_install";

export function install_all_requirements(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        installMatter()
           //.then(() => installAMP())
           .then(() => installIDFthruExt())
           .then(() => resolve())
           .catch((err) => reject(err));
    });
}