import type { ChildVode } from "./vode.js";

/** argument that replaces {n} in translation */
export type I18nArg = string;

/** argument that replaces {1} in translation
 * and also selects plural form based on its value
 */
export type I18nFirstArg =
    | I18nArg
    | number // same as { type: 'cardinal', value: number }
    | { type: Intl.PluralRuleType; value: number }; // number is will replace {1} in translation

export function replaceArgsInString(template: string, ...args: I18nArg[]): string {
    let i = 1;
    for (const arg of args) {
        if (arg) template = template.replace(`{${i}}`, arg);
        i++;
    }
    return template;
}

/** replaces template arguments in place
 * (so better make a deep copy before passing a vode here) */
export function replaceArgsInVode(template: ChildVode, ...args: I18nArg[]): ChildVode {
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
