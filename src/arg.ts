import { childrenStart, type ChildVode } from "./vode.js";

/** argument that replaces {n} in translation */
export type I18nArg = string | number;

/** argument that replaces {1} in translation
 * and also selects plural form based on its value
 * (a plain number is the same as { type: 'cardinal', value: number })
 */
export type I18nFirstArg = I18nArg | { type: Intl.PluralRuleType; value: number };

const PLACEHOLDER = /\{(\d+)\}/g;

export function replaceArgsInString(template: string, ...args: (I18nArg | undefined)[]): string {
    return template.replace(PLACEHOLDER, (placeholder, n: string) => {
        const arg = args[Number(n) - 1];
        return arg === undefined || arg === null ? placeholder : String(arg);
    });
}

/** replaces template arguments in place
 * (so better make a deep copy before passing a vode here) */
export function replaceArgsInVode(
    template: ChildVode,
    ...args: (I18nArg | undefined)[]
): ChildVode {
    if (typeof template === "string") {
        return replaceArgsInString(template, ...args);
    } else if (Array.isArray(template)) {
        const kidsStartIndex = childrenStart(template);
        if (kidsStartIndex < 0) return template;
        for (let i = kidsStartIndex; i < template.length; i++) {
            const child = template[i] as ChildVode;
            (template as ChildVode[])[i] = replaceArgsInVode(child, ...args);
        }
        return template;
    }
    return template;
}
