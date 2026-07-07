import { replaceArgsInString, replaceArgsInVode, type I18nArg, type I18nFirstArg } from "./arg.js";
import type { FlatCatalog } from "./bake-flat-catalog.js";
import type { I18nKey, I18nVodeKey } from "./key.js";
import type { I18nPluralForm, I18nVodePluralForm } from "./plural-form.js";
import type { ChildVode } from "./vode.js";

/** selects the entry of a plural form for the given first argument:
 * exact numeric key first, then the Intl.PluralRules category, then _other */
function selectPlural<PF extends I18nPluralForm | I18nVodePluralForm>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    plural: PF,
    pluralOrFirstArg: I18nFirstArg | undefined,
): { value: number | string; selected: PF["_other"] } {
    let rules: Intl.PluralRules;
    let value: number | string;
    if (typeof pluralOrFirstArg === "object" && pluralOrFirstArg !== null) {
        rules = pluralOrFirstArg.type === "ordinal" ? ordinal : cardinal;
        value = pluralOrFirstArg.value;
    } else {
        rules = cardinal;
        value = pluralOrFirstArg as number;
    }

    const entries = plural as unknown as Record<string | number, PF["_other"] | undefined>;
    let selected = entries[value];
    if (selected === undefined) {
        const pluralForm = rules.select(value as number);
        selected = entries[`_${pluralForm}`] ?? plural._other;
    }

    return { value, selected };
}

/** normalizes a plural selector object to its numeric value */
function firstArgValue(pluralOrFirstArg: I18nFirstArg | undefined): I18nArg | undefined {
    return typeof pluralOrFirstArg === "object" && pluralOrFirstArg !== null
        ? pluralOrFirstArg.value
        : pluralOrFirstArg;
}

function deepCopy<T>(value: T): T {
    return typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
}

export function translateText<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    onMissingKey: ((key: string) => unknown) | undefined,
    key: I18nKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): string | undefined {
    let raw = flatCatalog.get(key as I18nVodeKey<C>);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key as I18nVodeKey<C>);
    }
    if (raw === undefined) {
        raw = onMissingKey?.(key) as string | undefined;
    }
    if (raw === undefined) {
        return undefined;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, firstArgValue(pluralOrFirstArg), ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        const { value, selected } = selectPlural(
            ordinal,
            cardinal,
            raw as I18nPluralForm,
            pluralOrFirstArg,
        );
        return replaceArgsInString(selected, String(value), ...restArgs);
    }

    return undefined;
}

export function translateVode<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    onMissingKey: ((key: string) => unknown) | undefined,
    key: I18nVodeKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): ChildVode | undefined {
    let raw = flatCatalog.get(key);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key);
    }
    if (raw === undefined) {
        raw = onMissingKey?.(key) as ChildVode;
    }
    if (raw === undefined) {
        return undefined;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, firstArgValue(pluralOrFirstArg), ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        const { value, selected } = selectPlural(
            ordinal,
            cardinal,
            raw as I18nVodePluralForm,
            pluralOrFirstArg,
        );

        //deep copy to avoid modifying the original translation
        const vode = Array.isArray(selected) ? deepCopy(selected) : selected;
        return replaceArgsInVode(vode, String(value), ...restArgs);
    } else if (Array.isArray(raw)) {
        //deep copy to avoid modifying the original translation
        return replaceArgsInVode(deepCopy(raw), firstArgValue(pluralOrFirstArg), ...restArgs);
    }

    return undefined;
}

export function translateRaw<C extends {}>(
    catalog: C,
    fallbackCatalog: Partial<C> | object | undefined,
    onMissingKey: ((key: string) => unknown) | undefined,
    key: string,
): any {
    let raw: any = undefined;
    const path = key.split(".");

    let current: any = catalog;
    for (const segment of path) {
        if (typeof current === "object" && current !== null && Object.hasOwn(current, segment)) {
            current = current[segment];
        } else {
            current = undefined;
            break;
        }
    }

    raw = current;

    if (raw === undefined && fallbackCatalog) {
        current = fallbackCatalog;
        for (const segment of path) {
            if (
                typeof current === "object" &&
                current !== null &&
                Object.hasOwn(current, segment)
            ) {
                current = current[segment];
            } else {
                current = undefined;
                break;
            }
        }
        raw = current;
    }

    if (raw === undefined) {
        raw = onMissingKey?.(key) as string | undefined;
    }

    return raw;
}
