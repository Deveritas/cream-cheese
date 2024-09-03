import { Lox } from "./lox.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

export class Scanner {
    readonly source: string;
    tokens: Token[] = [];

    private start: number = 0;
    private current: number = 0;
    private line: number = 1;

    private keywords = new Map([
      ["and", TokenType.AND],
      ["class", TokenType.CLASS],
      ["else", TokenType.ELSE],
      ["false", TokenType.FALSE],
      ["for", TokenType.FOR],
      ["fun", TokenType.FUN],
      ["if", TokenType.IF],
      ["nil", TokenType.NIL],
      ["or", TokenType.OR],
      ["print", TokenType.PRINT],
      ["return", TokenType.RETURN],
      ["super", TokenType.SUPER],
      ["this", TokenType.THIS],
      ["true", TokenType.TRUE],
      ["var", TokenType.VAR],
      ["while", TokenType.WHILE],
    ]);

    constructor(script: string) {
        this.source = script;
    }

    isAtEnd() {
      return this.current >= this.source.length;
    }

    scanTokens(): Token[] {
      while (!this.isAtEnd()) {
        this.start = this.current;
        this.scanToken()
      }

      this.tokens.push(new Token(TokenType.EOF, "", null, this.line))
      return this.tokens;
    }

    scanToken(): void {
      const c = this.advance();
      switch (c) {
        case '(': this.addToken(TokenType.LEFT_PAREN); break;
        case ')': this.addToken(TokenType.RIGHT_PAREN); break;
        case '{': this.addToken(TokenType.LEFT_BRACE); break;
        case '}': this.addToken(TokenType.RIGHT_BRACE); break;
        case ',': this.addToken(TokenType.COMMA); break;
        case '.': this.addToken(TokenType.DOT); break;
        case '-': this.addToken(TokenType.MINUS); break;
        case '+': this.addToken(TokenType.PLUS); break;
        case ';': this.addToken(TokenType.SEMICOLON); break;
        case '*': this.addToken(TokenType.STAR); break;
        case '!':
          this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
          break;
        case '=':
          this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
          break;
        case '>':
          this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
          break;
        case '<':
          this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
          break;
        case '/':
          if (this.match('/')) {
            while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
          } else {
            this.addToken(TokenType.SLASH);
          }
          break;
        case ' ':
        case '\r':
        case '\t':
          break;
        case '\n':
          this.line++;
          break;
        
        case '"': this.string(); break;

        default:
          if (this.isDigit(c)) {
            this.number();
          } else if (this.isAlpha(c)) {
            this.identifier();
          } else {
            Lox.error(this.line, "Unexpected character.");
          }
          break;
      }
    }

    peek() {
      if (this.isAtEnd()) return '\0';
      return this.source.charAt(this.current);
    }

    peekNext() {
      if (this.isAtEnd()) return '\0';
      this.current++;
      if (this.isAtEnd()) return '\0';
      return this.source.charAt(this.current--);
    }

    match(expected: string): boolean {
      if (this.isAtEnd()) return false;
      if (this.source.charAt(this.current) != expected) return false;

      this.current++;
      return true;
    }

    advance(): string {
      return this.source.charAt(this.current++);
    }

    addToken(type: TokenType, literal: string | number | null = null) {
      const text = this.source.substring(this.start, this.current);
      this.tokens.push(new Token(type, text, literal, this.line));
    }

    isDigit(c: string) {
      const charCode = c.charCodeAt(0);
      const zeroChar = '0'.charCodeAt(0);
      const nineChar = '9'.charCodeAt(0);

      return zeroChar <= charCode && charCode <= nineChar;
    }

    isAlpha(c: string) {
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

    isAlphaNumeric(c: string) {
      return this.isAlpha(c) || this.isDigit(c);
    }

    string() {
      while(this.peek() != '"' && !this.isAtEnd()) {
        if (this.peek() === '\n') this.line++;
        this.advance();
      }

      if (this.isAtEnd()) {
        Lox.error(this.line, "Unterminated string.");
      }

      // Closing "
      this.advance();
  
      const value = this.source.substring(this.start + 1, this.current - 1);
      this.addToken(TokenType.STRING, value);
    }

    number() {
      while (this.isDigit(this.peek())) this.advance();
  
      if (this.peek() == '.' && this.isDigit(this.peekNext())) {
        this.advance();
        while (this.isDigit(this.peek())) this.advance();
      }

      this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
    }

    identifier() {
      while(this.isAlphaNumeric(this.peek())) this.advance();

      const text = this.source.substring(this.start, this.current);
      let type = this.keywords.get(text);
      if (type === undefined) type = TokenType.IDENTIFIER;
      this.addToken(type);
    }
}