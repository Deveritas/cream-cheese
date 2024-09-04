export enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

    // One or two character tokens.
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    // Literals.
    IDENTIFIER, STRING, NUMBER,
    // Keywords.
    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

    EOF
}

type LiteralToken = {
    type: TokenType.NUMBER,
    literal: number,
} | {
    type: TokenType.STRING,
    literal: string,
};

export type Token = {
    lexeme: string,
    line: number,
    [Symbol.toStringTag](): string,
} & (LiteralToken | { type: Exclude<TokenType, LiteralToken['type']> })

export type LiteralFor<TType extends TokenType> = TType extends TokenType.NUMBER | TokenType.STRING 
    ? Extract<Token, { type: TType, literal: string | number }>['literal'] 
    : null;

export function makeToken<TType extends TokenType>(type: TType, lexeme: string, literal: LiteralFor<TType>, line: number): Token {
    if (type === TokenType.NUMBER) {
        return {
            type,
            lexeme,
            literal: literal as number,
            line,

            [Symbol.toStringTag]() {
                return `${this.type} ${this.lexeme} ${this.literal}`;
            }
        }
    } else if (type === TokenType.STRING) {
        return {
            type,
            lexeme,
            literal: literal as string,
            line,

            [Symbol.toStringTag]() {
                return `${this.type} ${this.lexeme} ${this.literal}`;
            }
        }
    } else {
        return {
            type,
            lexeme,
            line,

            [Symbol.toStringTag]() {
                return `${this.type} ${this.lexeme}`;
            }
        }
    }
}

// makeToken(TokenType.NUMBER, "", 0, 0);
// makeToken(TokenType.NUMBER, "", "", 0);
// makeToken(TokenType.NUMBER, "", null, 0);
// makeToken(TokenType.STRING, "", 0, 0);
// makeToken(TokenType.STRING, "", "", 0);
// makeToken(TokenType.STRING, "", null, 0);
// makeToken(TokenType.RETURN, "", 0, 0);
// makeToken(TokenType.RETURN, "", "", 0);
// makeToken(TokenType.RETURN, "", null, 0);