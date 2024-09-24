import * as vscode from 'vscode';

export class Logger {
    private static instance: Logger;
    private outputChannel: vscode.OutputChannel;

    private constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }

    public static getInstance(channelName: string = 'LowCode'): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(channelName);
        }
        return Logger.instance;
    }

    public log(message: string): void {
        this.outputChannel.appendLine(`[LOG] ${message}`);
    }

    public info(message: string): void {
        this.outputChannel.appendLine(`[INFO] ${message}`);
    }

    public warn(message: string): void {
        this.outputChannel.appendLine(`[WARN] ${message}`);
    }

    public error(message: string): void {
        this.outputChannel.appendLine(`[ERROR] ${message}`);
    }

    public show(): void {
        this.outputChannel.show();
    }
}
