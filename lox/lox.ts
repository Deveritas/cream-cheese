import { Scanner } from "./scanner.ts";
import { Token } from "./token.ts";

export class Lox {
    static hadError: boolean = false;

    static run(script: string): void {
        const scanner = new Scanner(script);
        const tokens: Token[] = scanner.scanTokens();

        for (const token of tokens) {
            console.log(token);
        }
    }

    static error(line:number, message: string) {
        this.report(line, "", message);
    }

    static report(line: number, where: string, message: string) {
        const encoder = new TextEncoder();
        Deno.stderr.writeSync(encoder.encode(`[line ${line}] Error${where}: ${message}`));
        this.hadError = true;
    }
}