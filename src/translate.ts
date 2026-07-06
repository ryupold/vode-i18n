import { replaceArgsInString, replaceArgsInVode, type I18nArg, type I18nFirstArg } from "./arg";
import type { FlatCatalog } from "./bake-flat-catalog";
import type { I18nKey, I18nVodeKey } from "./key";
import type { I18nPluralForm, I18nVodePluralForm } from "./plural-form";
import type { ChildVode } from "./vode";

export function translateText<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    key: I18nKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): string | undefined {
    let raw = flatCatalog.get(key as I18nVodeKey<C>);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key as I18nVodeKey<C>);
    }
    if (raw === undefined) {
        return undefined;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, pluralOrFirstArg as I18nArg, ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        let rules: Intl.PluralRules;
        let value: number | string;
        if (typeof pluralOrFirstArg === "object") {
            if (pluralOrFirstArg.type === "ordinal") rules = ordinal;
            else rules = cardinal;

            value = pluralOrFirstArg.value;
        } else {
            rules = cardinal;
            value = pluralOrFirstArg as number;
        }

        let pluralText = (raw as I18nPluralForm)[value];

        if (!pluralText) {
            const pluralForm = rules.select(value);

            pluralText =
                (raw as I18nPluralForm)[`_${pluralForm}`] || (raw as I18nPluralForm)._other;
        }

        return replaceArgsInString(pluralText, String(value), ...restArgs);
    }

    return undefined;
}

export function translateVode<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    key: I18nVodeKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): ChildVode | undefined {
    let raw = flatCatalog.get(key);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key);
    }
    if (raw === undefined) {
        return undefined;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, pluralOrFirstArg as I18nArg, ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        let rules: Intl.PluralRules;
        let value: number | string;
        if (typeof pluralOrFirstArg === "object") {
            if (pluralOrFirstArg.type === "ordinal") rules = ordinal;
            else rules = cardinal;

            value = pluralOrFirstArg.value;
        } else {
            rules = cardinal;
            value = pluralOrFirstArg as number;
        }

        let pluralTextOrVode = (raw as I18nVodePluralForm)[value];

        if (!pluralTextOrVode) {
            const pluralForm = rules.select(value);
            pluralTextOrVode =
                (raw as I18nVodePluralForm)[`_${pluralForm}`] || (raw as I18nVodePluralForm)._other;
        }

        //make deep copy to avoid modifying original translation
        if (Array.isArray(pluralTextOrVode)) {
            pluralTextOrVode = JSON.parse(JSON.stringify(pluralTextOrVode));
        }

        return replaceArgsInVode(pluralTextOrVode, String(value), ...restArgs);
    } else if (Array.isArray(raw)) {
        //make deep copy to avoid modifying original translation
        const copy = JSON.parse(JSON.stringify(raw)) as ChildVode;
        return replaceArgsInVode(copy, pluralOrFirstArg as I18nArg, ...restArgs);
    }

    return undefined;
}

export function translateRaw<C extends {}>(
    catalog: C,
    fallbackCatalog: Partial<C> | object | ((key: string) => unknown) | undefined,
    key: string,
): any {
    let raw: any = undefined;
    const path = key.split(".");

    let current: any = catalog;
    for (const segment of path) {
        if (typeof current === "object" && current !== null) {
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
            if (typeof current === "object" && current !== null) {
                current = current[segment];
            } else {
                current = undefined;
                break;
            }
        }
        raw = current;
    }

    return raw;
}
