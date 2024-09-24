import * as vscode from 'vscode';
import { installDependencies } from './pre_reqs';
import { installIDFthruExt, get_idf_location, isWeb } from './idf_install';

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
		installDependencies(context);
		vscode.window.showInformationMessage("Prerequisites have been installed");
		installIDFthruExt(context);
		vscode.window.showInformationMessage("ESP IDF has been installed successfully");
	});
	context.subscriptions.push(setupCommand);

	const setDeviceCommand = vscode.commands.registerCommand('LowCode.setDevice', () => {
		vscode.commands.executeCommand("espIdf.setTarget");
	});
	context.subscriptions.push(setDeviceCommand);

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

	const buildDevice = vscode.commands.registerCommand("LowCode.build", async () => {
		vscode.workspace.saveAll();
		if (context.workspaceState.get("LowCode_target") !== undefined) {
			await vscode.commands.executeCommand("espIdf.setTarget", "esp32c6");
			context.workspaceState.update("LowCode_target", "esp32c6");
		}
		await vscode.commands.executeCommand("espIdf.buildDevice");
	});
	context.subscriptions.push(buildDevice);

	const flashDevice = vscode.commands.registerCommand( "LowCode.flash", async () => {
		vscode.window.showInformationMessage("Entering flash mode...");
		if (isWeb()) {
			vscode.window.showInformationMessage(`
				Flashing through LowCode is not supported in a web browser.\n
				Please use LowCode web extension instead`
			);
		} else {
			await vscode.commands.executeCommand("espIdf.flashDevice");
		}
	});
	context.subscriptions.push(flashDevice);

	const monitorDevice = vscode.commands.registerCommand("LowCode.monitor", async () => {
		vscode.window.showInformationMessage("Entering monitor mode...");
		if (isWeb()) {
			vscode.window.showInformationMessage(`
                Monitoring through LowCode is not supported in a web browser.\n
                Please use LowCode web extension instead`
            );
		} else {
			await vscode.commands.executeCommand("espIdf.monitorDevice");
		}
	});
	context.subscriptions.push(monitorDevice);

	const eraseflashDevice = vscode.commands.registerCommand("LowCode.eraseflash", async () => {
		vscode.commands.executeCommand("espIdf.eraseFlash");
		context.workspaceState.update("LowCode_target", undefined);
	});
	context.subscriptions.push(eraseflashDevice);

	let statusBarItemRun = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItemRun.command = 'LowCode.run';
	statusBarItemRun.text = "$(zap)LowCode Run";
	statusBarItemRun.show();
	statusBarItemRun.tooltip = "Build Flash Monitor ESP Device";
	context.subscriptions.push(statusBarItemRun);

	let statusBarItemBuild = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
	statusBarItemBuild.command = 'LowCode.build';
	statusBarItemBuild.text = "$(gear)Build";
	statusBarItemBuild.show();
	statusBarItemBuild.tooltip = "Build ESP Device";
	context.subscriptions.push(statusBarItemBuild);

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

//export function deactivate() {}
