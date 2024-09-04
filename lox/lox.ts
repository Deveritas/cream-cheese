import { scan } from "./scanner.ts";
import { Token } from "./token.ts";
import { DenoReporter } from "./error/error_reporter.ts";

export class Lox {
    static hadError: boolean = false;

    static run(script: string): void {
        const reporter = new DenoReporter()
        const tokenSource = scan(script, reporter);
        const tokens: Token[] = Array.from(tokenSource);

        for (const token of tokens) {
            console.log(token);
        }

        if (reporter.hadError) this.hadError = true;
    }
}