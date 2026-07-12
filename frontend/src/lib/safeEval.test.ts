import { describe, it, expect } from 'vitest';
import { evaluateExpression, evaluateCondition } from './safeEval';

describe('evaluateExpression', () => {
    const ctx = {
        request: { method: 'POST', body: { age: 21, name: 'Ada', active: true } },
        state: { count: 3 },
        variables: { user: { name: 'Ada' } },
    };

    it('resolves dot-path identifiers', () => {
        expect(evaluateExpression('request.method', ctx)).toBe('POST');
        expect(evaluateExpression('request.body.age', ctx)).toBe(21);
        expect(evaluateExpression('variables.user.name', ctx)).toBe('Ada');
    });

    it('evaluates comparisons', () => {
        expect(evaluateExpression('request.body.age >= 18', ctx)).toBe(true);
        expect(evaluateExpression('request.body.age < 18', ctx)).toBe(false);
        expect(evaluateExpression('state.count == 3', ctx)).toBe(true);
        expect(evaluateExpression("request.method == 'POST'", ctx)).toBe(true);
        expect(evaluateExpression('request.method === "GET"', ctx)).toBe(false);
    });

    it('evaluates logical operators with short-circuit precedence', () => {
        expect(evaluateExpression("request.body.age >= 18 && request.method == 'POST'", ctx)).toBe(true);
        expect(evaluateExpression("request.body.age < 18 || request.method == 'POST'", ctx)).toBe(true);
        expect(evaluateExpression('!request.body.active', ctx)).toBe(false);
    });

    it('respects parentheses', () => {
        expect(evaluateExpression('(state.count + 1) * 2 == 8', ctx)).toBe(true);
    });

    it('handles literals', () => {
        expect(evaluateExpression('true', ctx)).toBe(true);
        expect(evaluateExpression('1 + 2', ctx)).toBe(3);
        expect(evaluateExpression("'a' + 'b'", ctx)).toBe('ab');
    });

    it('resolves missing paths to undefined without throwing', () => {
        expect(evaluateExpression('request.body.missing', ctx)).toBeUndefined();
    });

    it('blocks prototype-polluting path segments', () => {
        expect(evaluateExpression('request.__proto__', ctx)).toBeUndefined();
        expect(evaluateExpression('request.constructor', ctx)).toBeUndefined();
    });

    it('throws on invalid syntax', () => {
        expect(() => evaluateExpression('request.body.age >=', ctx)).toThrow();
        expect(() => evaluateExpression('(1 + 2', ctx)).toThrow();
    });
});

describe('evaluateCondition', () => {
    it('coerces truthy/falsy results to boolean', () => {
        expect(evaluateCondition('1', {})).toBe(true);
        expect(evaluateCondition('0', {})).toBe(false);
        expect(evaluateCondition("''", {})).toBe(false);
    });

    it('fails closed on evaluation errors instead of throwing', () => {
        expect(evaluateCondition('this is not valid )(', {})).toBe(false);
        expect(evaluateCondition('', {})).toBe(false);
    });

    it('cannot execute arbitrary code (no eval escape)', () => {
        // Attempts at code execution should just fail to parse / resolve, never run.
        expect(evaluateCondition('require("fs")', {})).toBe(false);
        expect(evaluateCondition('process.exit()', {})).toBe(false);
    });
});
