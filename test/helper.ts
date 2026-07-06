export class Expectation {
    constructor(public readonly what: any) {}

    toBeA(
        type:
            | "undefined"
            | "object"
            | "function"
            | "bigint"
            | "boolean"
            | "number"
            | "string"
            | "symbol",
        failMessage?: string,
    ) {
        if (typeof this.what !== type) {
            throw new ExpectationError(
                this,
                `expected \n\ntypeof ${this.what}\n\nto be \n\n${type}${failMessage ? `\n\n${failMessage}` : ""}`,
            );
        }
    }

    toBeGreaterThan(other: number, failMessage?: string) {
        if (!(this.what > other)) {
            throw new ExpectationError(
                this,
                `expected \n\n${this.what}\n\nto be >\n\n${other}${failMessage ? `\n\n${failMessage}` : ""}`,
            );
        }
    }

    toBeGreaterOrEqualThan(other: number, failMessage?: string) {
        if (!(this.what >= other)) {
            throw new ExpectationError(
                this,
                `expected \n\n${this.what}\n\nto be >= \n\n${other}${failMessage ? `\n\n${failMessage}` : ""}`,
            );
        }
    }

    toBeSmallerThan(other: number, failMessage?: string) {
        if (!(this.what < other)) {
            throw new ExpectationError(
                this,
                `expected \n\n${this.what}\n\nto be <\n\n${other}${failMessage ? `\n\n${failMessage}` : ""}`,
            );
        }
    }

    toBeSmallerOrEqual(other: number, failMessage?: string) {
        if (!(this.what <= other)) {
            throw new ExpectationError(
                this,
                `expected \n\n${this.what}\n\nto be <= \n\n${other}${failMessage ? `\n\n${failMessage}` : ""}`,
            );
        }
    }

    toEqual(other: any, failMessage?: string) {
        const failSuffix = failMessage ? `\n\n${failMessage}` : "";

        function deepCompare(a: any, b: any, path: string[]): string[] | null {
            if (typeof a !== typeof b) {
                if (path.length === 0) path.push(``);
                path[path.length - 1] += ` (type: ${typeof a} != ${typeof b})`;
                return path;
            }

            if (typeof a !== "object" || a === null) {
                if (path.length === 0) path.push(``);
                path[path.length - 1] += ` (value: ${a} != ${b})`;
                return a !== b ? path : null;
            }

            for (const prop of Object.entries(a)) {
                const [k, v] = prop;
                const result = deepCompare(v, b[k], [...path, k]);
                if (result) {
                    return result;
                }
            }

            for (const prop of Object.entries(b)) {
                const [k, v] = prop;
                const result = deepCompare(a[k], v, [...path, k]);
                if (result) {
                    return result;
                }
            }

            return null;
        }

        if (
            typeof this.what === "object" &&
            typeof other === "object" &&
            this.what !== null &&
            other !== null
        ) {
            const unequal = deepCompare(this.what, other, []);
            if (unequal) {
                throw new ExpectationError(
                    this,
                    `expected \n\n${JSON.stringify(this.what, null, 2)}\n\n to equal \n\n${JSON.stringify(other, null, 2)}\n\nThey differ in: ${unequal.join(".")}${failSuffix}`,
                );
            }
        } else {
            if (this.what !== other) {
                throw new ExpectationError(
                    this,
                    `expected (${typeof this.what})\n\n${this.what}\n\nto equal (${typeof other})\n\n${other}${failSuffix}`,
                );
            }
        }
    }

    toSucceed<Result>(failMessage?: string): Result {
        const failSuffix = failMessage ? `\n\n${failMessage}` : "";
        if (typeof this.what !== "function") {
            throw new ExpectationError(
                this,
                `expected a function\n\nbut it is a ${typeof this.what}${failSuffix}`,
            );
        }
        return this.what();
    }

    toFail(failMessage?: string): Error {
        const failSuffix = failMessage ? `\n\n${failMessage}` : "";
        if (typeof this.what !== "function") {
            throw new ExpectationError(
                this,
                `expected a function\n\nbut it is a ${typeof this.what}${failSuffix}`,
            );
        }

        let r: any;
        try {
            r = this.what();
        } catch (err: any) {
            return err;
        }
        throw new ExpectationError(
            this,
            `expected function to fail\n\nbut it succeeded with a result of type ${typeof r}\n\n${r}${failSuffix}`,
        );
    }
}

export class ExpectationError extends Error {
    constructor(
        public readonly expectation: Expectation,
        message?: string,
    ) {
        super(message);
    }
}

export function expect(what: any) {
    return new Expectation(what);
}
