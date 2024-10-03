import * as vscode from 'vscode';
import { get_idf_location } from './installation_steps/idf_install';
import { install_all_requirements } from './installation_steps/final_setup';

function isWeb(): boolean {
    return vscode.env.remoteName === "vscode-web";
}
export function activate(context: vscode.ExtensionContext) {

	const espIdfExtension = vscode.extensions.getExtension("espressif.esp-idf-extension");

	if (!espIdfExtension) {
		vscode.window.showErrorMessage(
			'Required Extension ESP IDF extension is not installed.',
			{ modal: true },
			'Install Now'
		).then(selection => {
			if (selection === 'Install Now') {
				vscode.commands.executeCommand("workbench.extensions.search", "espressif.esp-idf-extension");
			}
		});
	}

	const setupCommand = vscode.commands.registerCommand('LowCode.setup', () => {
		install_all_requirements();
	});
	context.subscriptions.push(setupCommand);

	const setDeviceCommand = vscode.commands.registerCommand('LowCode.setDevice', () => {
		vscode.commands.executeCommand("espIdf.setTarget");
	});
	context.subscriptions.push(setDeviceCommand);

	//ToDO: Fix: all commands happen at the same time
	const runCommand = vscode.commands.registerCommand('LowCode.run', async () => {
		if (!get_idf_location) {
			vscode.commands.executeCommand('LowCode.setup');
		}
		vscode.window.showInformationMessage("Building the project...");
		vscode.commands.executeCommand('LowCode.build').then(() => {
			vscode.window.showInformationMessage("Project built successfully");
			vscode.window.showInformationMessage("Flashing the device...");
			vscode.commands.executeCommand('LowCode.flash').then(() => {
				vscode.window.showInformationMessage("Flashing completed successfully");
				vscode.window.showInformationMessage("Running the application...");
				vscode.commands.executeCommand('LowCode.monitor');
			});
		});
	});
	context.subscriptions.push(runCommand);

	const buildDevice = vscode.commands.registerCommand("LowCode.build", async (): Promise<void> => {
		return new Promise<void>(async (resolve, reject) => {
			try {
				vscode.workspace.saveAll();
				if (!get_idf_location) {
					vscode.commands.executeCommand('LowCode.setup');
				}
				if (context.workspaceState.get("LowCode_target") !== undefined) {
					await vscode.commands.executeCommand("espIdf.setTarget", "esp32c6");
					context.workspaceState.update("LowCode_target", "esp32c6");
				}
				vscode.commands.executeCommand("espIdf.buildDevice")
					.then(() => resolve());
			}
			catch (error) {
				vscode.window.showErrorMessage("Something went wrong during build.\nCheck if you have installed esp idf extension.");
				reject(error);
			}
		});
	});
	context.subscriptions.push(buildDevice);

	const flashDevice = vscode.commands.registerCommand( "LowCode.flash", async (): Promise<void> => {
		return new Promise<void>(async (resolve, reject) => {
			if (isWeb()) {
				try {
					const espIdfWebExtension = vscode.extensions.getExtension("espressif.esp-idf-web");
					if (!espIdfWebExtension) {
						vscode.window.showErrorMessage(
                            'Required Extension ESP Web IDF extension is not installed.',
                            { modal: true },
                            'Install Now'
                        ).then(selection => {
                            if (selection === 'Install Now') {
                                vscode.commands.executeCommand("workbench.extensions.search", "espressif.esp-idf-web");
                            }
                        });
                    }
					vscode.commands.executeCommand("esp-idf-web.flash")		// Change to our web extension before release
					.then(() => resolve());
				}
				catch (error) {
                    vscode.window.showErrorMessage("Something went wrong during flashing.\nCheck if you have installed esp web idf extension.");
                    reject(error);
                }
			} else {
				try {
					if (!get_idf_location) {
						vscode.commands.executeCommand('LowCode.setup');
					}
					await vscode.commands.executeCommand("espIdf.flashDevice")
						.then(() => resolve());
				}
				catch (error) {
                    vscode.window.showErrorMessage("Something went wrong during flashing.\nCheck if you have installed esp idf extension.");
                    reject(error);
                }
			}
		});
	});
	context.subscriptions.push(flashDevice);

	const monitorDevice = vscode.commands.registerCommand("LowCode.monitor", async (): Promise<void> => {
		return new Promise<void>(async (resolve, reject) => {
			if (isWeb()) {
				try {
					const espIdfWebExtension = vscode.extensions.getExtension("espressif.esp-idf-web");
					if (!espIdfWebExtension) {
						vscode.window.showErrorMessage(
                            'Required Extension ESP Web IDF extension is not installed.',
                            { modal: true },
                            'Install Now'
                        ).then(selection => {
							if (selection === 'Install Now') {
                                vscode.commands.executeCommand("workbench.extensions.search", "espressif.esp-idf-web");
                            }
						});
					}
                    await vscode.commands.executeCommand("esp-idf-web.monitor")        // Change to our web extension before release
                    .then(() => resolve());
                }
                catch (error) {
                    vscode.window.showErrorMessage("Something went wrong during monitoring.\nCheck if you have installed esp web idf extension.");
                    reject(error);
                }
			} 
			else {
				try {
					get_idf_location();
					await vscode.commands.executeCommand("espIdf.monitorDevice")
						.then(() => resolve());
				}
				catch (error) {
                    vscode.window.showErrorMessage("Something went wrong during monitoring.\nCheck if you have installed esp idf extension.");
                    reject(error);
                }
			}
		});
	});
	context.subscriptions.push(monitorDevice);

	const eraseflashDevice = vscode.commands.registerCommand("LowCode.eraseflash", () {
		if (isWeb()) {
			vscode.window.showInformationMessage("Erase flash device not supported on vscode web extension");
		}
		else {
			vscode.commands.executeCommand("espIdf.eraseFlash");
		}
		context.workspaceState.update("LowCode_target", undefined);
	});
	context.subscriptions.push(eraseflashDevice);

	const preBuildBinariesFlash = vscode.commands.registerCommand("prevuildbinariesflash", () => {
		//ToDO
		vscode.window.showInformationMessage("Command not supported yet");
	});
	context.subscriptions.push(preBuildBinariesFlash);

	const generatePerDeviceData = vscode.commands.registerCommand("generateperdevicedata", () => {
		//ToDO
		vscode.window.showInformationMessage("Command not supported yet");
	});
	context.subscriptions.push(generatePerDeviceData);

	const selectProduct = vscode.commands.registerCommand("selectproduct", () => {
		//ToDo

	});
	context.subscriptions.push(selectProduct);

	let statusBarItemBuild = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
	statusBarItemBuild.command = 'LowCode.build';
	statusBarItemBuild.text = "$(gear)Build";
	statusBarItemBuild.show();
	statusBarItemBuild.tooltip = "Build ESP Device";
	context.subscriptions.push(statusBarItemBuild);

	if (!isWeb()) {
		let statusBarItemRun = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		statusBarItemRun.command = 'LowCode.run';
		statusBarItemRun.text = "$(zap)LowCode Run";
		statusBarItemRun.show();
		statusBarItemRun.tooltip = "Build Flash Monitor ESP Device";
		context.subscriptions.push(statusBarItemRun);

		let statusBarItemFlash = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 80);
		statusBarItemFlash.command = 'LowCode.flash';
		statusBarItemFlash.text = "$(lightbulb)Flash";
		statusBarItemFlash.show();
		statusBarItemFlash.tooltip = "Flash ESP Device";
		context.subscriptions.push(statusBarItemFlash);

		let statusBarItemMonitor = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 70);
		statusBarItemMonitor.command = 'LowCode.monitor';
		statusBarItemMonitor.text = "$(arrow-swap)Monitor";
		statusBarItemMonitor.show();
		statusBarItemMonitor.tooltip = "Monitor ESP Device";
		context.subscriptions.push(statusBarItemMonitor);

		let statusBarItemErase = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 60);
		statusBarItemErase.command = 'LowCode.eraseflash';
		statusBarItemErase.text = "$(trash)";
		statusBarItemErase.show();
		statusBarItemErase.tooltip = "Erase Flash on ESP";
		context.subscriptions.push(statusBarItemErase);
	}
}

//export function deactivate() {}
