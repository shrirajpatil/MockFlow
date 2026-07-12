/**
 * Safe expression evaluator for Conditional nodes.
 *
 * Replaces eval(): supports literals, dot-path identifiers resolved against a
 * context object, comparison/logical/arithmetic operators and parentheses.
 * No function calls, no assignment, no prototype access.
 *
 * Examples:
 *   request.body.age >= 18
 *   state.count > 0 && request.method == 'POST'
 *   variables.user.name == "John"
 */

type Token =
    | { kind: 'num'; value: number }
    | { kind: 'str'; value: string }
    | { kind: 'ident'; value: string }
    | { kind: 'op'; value: string }
    | { kind: 'lparen' }
    | { kind: 'rparen' };

const OPERATORS = ['===', '!==', '==', '!=', '>=', '<=', '&&', '||', '>', '<', '+', '-', '*', '/', '%', '!'];

const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        const ch = input[i]!;

        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        if (ch === '(') {
            tokens.push({ kind: 'lparen' });
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ kind: 'rparen' });
            i++;
            continue;
        }

        if (ch === '"' || ch === "'") {
            const quote = ch;
            let j = i + 1;
            let value = '';
            while (j < input.length && input[j] !== quote) {
                if (input[j] === '\\' && j + 1 < input.length) {
                    value += input[j + 1];
                    j += 2;
                } else {
                    value += input[j];
                    j++;
                }
            }
            if (j >= input.length) throw new Error('Unterminated string literal');
            tokens.push({ kind: 'str', value });
            i = j + 1;
            continue;
        }

        if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(input[i + 1] ?? ''))) {
            let j = i;
            while (j < input.length && /[0-9.]/.test(input[j]!)) j++;
            tokens.push({ kind: 'num', value: parseFloat(input.slice(i, j)) });
            i = j;
            continue;
        }

        if (/[A-Za-z_$]/.test(ch)) {
            let j = i;
            while (j < input.length && /[A-Za-z0-9_$.]/.test(input[j]!)) j++;
            tokens.push({ kind: 'ident', value: input.slice(i, j) });
            i = j;
            continue;
        }

        const op = OPERATORS.find((o) => input.startsWith(o, i));
        if (op) {
            tokens.push({ kind: 'op', value: op });
            i += op.length;
            continue;
        }

        throw new Error(`Unexpected character '${ch}' in expression`);
    }

    return tokens;
}

class Parser {
    private tokens: Token[];
    private pos = 0;

    constructor(tokens: Token[], private context: Record<string, unknown>) {
        this.tokens = tokens;
    }

    parse(): unknown {
        const value = this.parseOr();
        if (this.pos < this.tokens.length) throw new Error('Unexpected trailing tokens in expression');
        return value;
    }

    private peek(): Token | undefined {
        return this.tokens[this.pos];
    }

    private matchOp(...ops: string[]): string | null {
        const t = this.peek();
        if (t && t.kind === 'op' && ops.includes(t.value)) {
            this.pos++;
            return t.value;
        }
        return null;
    }

    private parseOr(): unknown {
        let left = this.parseAnd();
        while (this.matchOp('||')) {
            const right = this.parseAnd();
            left = Boolean(left) || Boolean(right);
        }
        return left;
    }

    private parseAnd(): unknown {
        let left = this.parseEquality();
        while (this.matchOp('&&')) {
            const right = this.parseEquality();
            left = Boolean(left) && Boolean(right);
        }
        return left;
    }

    private parseEquality(): unknown {
        let left = this.parseRelational();
        let op: string | null;
        while ((op = this.matchOp('===', '!==', '==', '!='))) {
            const right = this.parseRelational();
            if (op === '===' ) left = left === right;
            else if (op === '!==') left = left !== right;
            // Loose equality intentionally uses strict comparison after
            // normalizing numbers/strings, avoiding JS coercion surprises.
            else if (op === '==') left = looseEquals(left, right);
            else left = !looseEquals(left, right);
        }
        return left;
    }

    private parseRelational(): unknown {
        let left = this.parseAdditive();
        let op: string | null;
        while ((op = this.matchOp('>=', '<=', '>', '<'))) {
            const right = this.parseAdditive();
            const l = Number(left);
            const r = Number(right);
            if (op === '>') left = l > r;
            else if (op === '<') left = l < r;
            else if (op === '>=') left = l >= r;
            else left = l <= r;
        }
        return left;
    }

    private parseAdditive(): unknown {
        let left = this.parseMultiplicative();
        let op: string | null;
        while ((op = this.matchOp('+', '-'))) {
            const right = this.parseMultiplicative();
            if (op === '+') {
                left = typeof left === 'string' || typeof right === 'string'
                    ? String(left) + String(right)
                    : Number(left) + Number(right);
            } else {
                left = Number(left) - Number(right);
            }
        }
        return left;
    }

    private parseMultiplicative(): unknown {
        let left = this.parseUnary();
        let op: string | null;
        while ((op = this.matchOp('*', '/', '%'))) {
            const right = this.parseUnary();
            if (op === '*') left = Number(left) * Number(right);
            else if (op === '/') left = Number(left) / Number(right);
            else left = Number(left) % Number(right);
        }
        return left;
    }

    private parseUnary(): unknown {
        if (this.matchOp('!')) return !this.parseUnary();
        if (this.matchOp('-')) return -Number(this.parseUnary());
        return this.parsePrimary();
    }

    private parsePrimary(): unknown {
        const t = this.peek();
        if (!t) throw new Error('Unexpected end of expression');

        if (t.kind === 'lparen') {
            this.pos++;
            const value = this.parseOr();
            const close = this.peek();
            if (!close || close.kind !== 'rparen') throw new Error('Missing closing parenthesis');
            this.pos++;
            return value;
        }

        if (t.kind === 'num' || t.kind === 'str') {
            this.pos++;
            return t.value;
        }

        if (t.kind === 'ident') {
            this.pos++;
            if (t.value === 'true') return true;
            if (t.value === 'false') return false;
            if (t.value === 'null') return null;
            if (t.value === 'undefined') return undefined;
            return resolvePath(this.context, t.value);
        }

        throw new Error(`Unexpected token in expression`);
    }
}

function looseEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || a === undefined || b === null || b === undefined) {
        return (a === null || a === undefined) && (b === null || b === undefined);
    }
    // Compare number-like values numerically ("5" == 5)
    if ((typeof a === 'number' || typeof b === 'number') && !isNaN(Number(a)) && !isNaN(Number(b))) {
        return Number(a) === Number(b);
    }
    return String(a) === String(b);
}

function resolvePath(context: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let value: unknown = context;

    for (const part of parts) {
        if (BLOCKED_SEGMENTS.has(part)) return undefined;
        if (value !== null && typeof value === 'object') {
            value = (value as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }

    return value;
}

/**
 * Evaluate an expression against a context. Returns the raw value.
 * Throws on syntax errors.
 */
export function evaluateExpression(expression: string, context: Record<string, unknown>): unknown {
    const trimmed = expression.trim();
    if (!trimmed) return false;
    return new Parser(tokenize(trimmed), context).parse();
}

/**
 * Evaluate an expression as a boolean condition. Never throws — evaluation
 * errors return false so a bad condition fails closed.
 */
export function evaluateCondition(expression: string, context: Record<string, unknown>): boolean {
    try {
        return Boolean(evaluateExpression(expression, context));
    } catch {
        return false;
    }
}
