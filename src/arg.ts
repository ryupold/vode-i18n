import type { ChildVode } from "./vode.js";

/** argument that replaces {n} in translation */
export type I18nArg = string | number;

/** argument that replaces {1} in translation
 * and also selects plural form based on its value
 * (a plain number is the same as { type: 'cardinal', value: number })
 */
export type I18nFirstArg = I18nArg | { type: Intl.PluralRuleType; value: number };

const PLACEHOLDER = /\{(\d+)\}/g;

export function replaceArgsInString(
    template: string,
    ...args: (I18nArg | undefined)[]
): string {
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
        for (let i = kidsStartIndex; i < template.length; i++) {
            const child = template[i] as ChildVode;
            (template as ChildVode[])[i] = replaceArgsInVode(child, ...args);
        }
        return template;
    }
    return template;
}

const TEXT_NODE = 3 as const;

/** index in vode at which child-vodes start */
function childrenStart(vode: ChildVode): 1 | 2 | -1 {
    if (Array.isArray(vode) && vode.length > 1) {
        const first = vode[1];
        if (
            first &&
            typeof first === "object" &&
            !Array.isArray(first) &&
            (first as unknown as Node).nodeType !== TEXT_NODE
        )
            return vode.length > 2 ? 2 : -1;
        else return 1;
    }
    return -1;
}
