export interface ErrorReporter {
    error(line: number, message: string): void;
    report(line: number, where: string, message: string): void;
    hadError: boolean;
}

export class DenoReporter {
    hadError: boolean = false;

    error(line: number, message: string) {
        this.report(line, "", message);
    }

    report(line: number, where: string, message: string) {
        const encoder = new TextEncoder();
        Deno.stderr.writeSync(encoder.encode(`[line ${line}] Error${where}: ${message}`));
        this.hadError = true;
    }
}