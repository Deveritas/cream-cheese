import { ErrorReporter } from "./error/error_reporter.ts";
import { Token, TokenType as TType, LiteralFor, makeToken } from "./token.ts";

const KEYWORDS = new Map([
  ["and", TType.AND],
  ["class", TType.CLASS],
  ["else", TType.ELSE],
  ["false", TType.FALSE],
  ["for", TType.FOR],
  ["fun", TType.FUN],
  ["if", TType.IF],
  ["nil", TType.NIL],
  ["or", TType.OR],
  ["print", TType.PRINT],
  ["return", TType.RETURN],
  ["super", TType.SUPER],
  ["this", TType.THIS],
  ["true", TType.TRUE],
  ["var", TType.VAR],
  ["while", TType.WHILE],
]);

export interface Scanner extends Iterable<Token> {
  start: number,
  current: number,
  line: number,

  scanToken: () => Token | ScanError | null,
  [Symbol.iterator]: () => Iterator<Token, Token, undefined>,
}

interface ScanError {
  line: number,
  message: string,
}

function isScanError(thing: ReturnType<Scanner['scanToken']>): thing is ScanError {
  if (thing === null) return false;
  return ("message" in thing);
}

export function scan(source: string, reporter: ErrorReporter): Scanner {

  const isAtEnd = () => scanner.current >= source.length;

  const isDigit = (c: string) => {
    const charCode = c.charCodeAt(0);
    const zeroChar = '0'.charCodeAt(0);
    const nineChar = '9'.charCodeAt(0);

    return zeroChar <= charCode && charCode <= nineChar;
  }

  const isAlpha = (c: string) => {
    const charCode = c.charCodeAt(0);
    const aChar = 'a'.charCodeAt(0);
    const zChar = 'z'.charCodeAt(0);
    const AChar = 'A'.charCodeAt(0);
    const ZChar = 'Z'.charCodeAt(0);
    const _Char = '_'.charCodeAt(0);

    return (aChar <= charCode && charCode <= zChar) ||
           (AChar <= charCode && charCode <= ZChar) ||
            charCode == _Char;
  }

  const isAlphaNumeric = (c: string) => isAlpha(c) || isDigit(c);


  const scanner = {
    start: 0,
    current: 0,
    line: 1,

    isAtEnd(): boolean {
      return this.current >= source.length
    },

    peek(): string {
      if (this.isAtEnd()) return '\0';
      return source.charAt(this.current);
    },

    peekNext() {
      if (this.isAtEnd()) return '\0';
      this.current++;
      if (this.isAtEnd()) return '\0';
      return source.charAt(this.current--);
    },

    match(expected: string): boolean {
      if (this.isAtEnd()) return false;
      if (source.charAt(this.current) != expected) return false;

      this.current++;
      return true;
    },

    advance(): string {
      return source.charAt(this.current++);
    },



    makeToken: function(type: TType, literal: LiteralFor<typeof type> = null) {
      const text = source.substring(this.start, this.current);
      return makeToken(type, text, literal, this.line);
    },

    // Returns the next token, an error, or null in the case of whitespace
    scanToken: function(): Token | ScanError | null {
      const c = this.advance();
      switch (c) {
        case '(': return this.makeToken(TType.LEFT_PAREN);
        case ')': return this.makeToken(TType.RIGHT_PAREN);
        case '{': return this.makeToken(TType.LEFT_BRACE);
        case '}': return this.makeToken(TType.RIGHT_BRACE);
        case ',': return this.makeToken(TType.COMMA);
        case '.': return this.makeToken(TType.DOT);
        case '-': return this.makeToken(TType.MINUS);
        case '+': return this.makeToken(TType.PLUS);
        case ';': return this.makeToken(TType.SEMICOLON);
        case '*': return this.makeToken(TType.STAR);
        case '!':
          return this.makeToken(this.match('=') ? TType.BANG_EQUAL : TType.BANG);
        case '=':
          return this.makeToken(this.match('=') ? TType.EQUAL_EQUAL : TType.EQUAL);
        case '>':
          return this.makeToken(this.match('=') ? TType.GREATER_EQUAL : TType.GREATER);
        case '<':
          return this.makeToken(this.match('=') ? TType.LESS_EQUAL : TType.LESS);
        case '/':
          if (this.match('/')) {
            while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
          } else {
            return this.makeToken(TType.SLASH);
          }
          break;
        case ' ':
        case '\r':
        case '\t':
          break;
        case '\n':
          this.line++;
          break;
        
        case '"': return this.string();

        default:
          if (isDigit(c)) {
            return this.number();
          } else if (isAlpha(c)) {
            return this.identifier();
          } else {
            return {
              line: this.line,
              message: "Unexpected character."
            };
          }
      }

      return null;
    },


    string(): Token | ScanError {
      while(this.peek() != '"' && !this.isAtEnd()) {
        if (this.peek() === '\n') this.line++;
        this.advance();
      }

      if (this.isAtEnd()) {
        return {
          line: this.line,
          message: "Unterminated string.",
        };
      }

      // Closing "
      this.advance();
  
      const value = source.substring(this.start + 1, this.current - 1);
      return this.makeToken(TType.STRING, value);
    },

    number(): Token {
      while (isDigit(this.peek())) this.advance();
  
      if (this.peek() == '.' && isDigit(this.peekNext())) {
        this.advance();
        while (isDigit(this.peek())) this.advance();
      }

      return this.makeToken(TType.NUMBER, Number(source.substring(this.start, this.current)));
    },

    identifier(): Token {
      while(isAlphaNumeric(this.peek())) this.advance();

      const text = source.substring(this.start, this.current);
      let type = KEYWORDS.get(text);
      if (type === undefined) type = TType.IDENTIFIER;
      return this.makeToken(type);
    },
  
    [Symbol.iterator]: function* (): Iterator<Token, Token, undefined> {
      while (!isAtEnd()) {
        this.start = this.current;
        const token = this.scanToken();
        if (isScanError(token)) {
          reporter.error(token.line, token.message)
        } else if (token === null) {
          //Whitespace, continue
        } else {
          yield token;
        }
      }

      return makeToken(TType.EOF, "", null, this.line);
    }
  }

  return scanner;
}