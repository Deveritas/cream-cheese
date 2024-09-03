import { unreachable } from "@std/assert";

import { Lox } from "./lox/lox.ts";

function runFile(path: string): void {
  const text = Deno.readTextFileSync(path);
  Lox.run(text);
  
  if (Lox.hadError) Deno.exit(65);
}

async function runPrompt(): Promise<never> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoderStream();
  
  let line = "";
  Deno.stdout.write(encoder.encode("> "));
  for await (const chunk of Deno.stdin.readable.pipeThrough(decoder)) {
    line += chunk;
    if (line.indexOf("\n") != -1) {
      const lines = line.split("\n");

      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].trim() === "") Deno.exit();

        Lox.run(lines[i]);
        Lox.hadError = false;
      }

      line = lines[lines.length - 1];
      Deno.stdout.write(encoder.encode("> "));
    }
  }

  unreachable("Did stdin unexpectedly close?");
}

if (import.meta.main) {
  if (Deno.args.length > 1) {
    console.error("Usage: cream-cheese [script]");
    Deno.exit(64);
  } else if (Deno.args.length == 1) {
    runFile(Deno.args[0]);
  } else {
    runPrompt()
  }
}