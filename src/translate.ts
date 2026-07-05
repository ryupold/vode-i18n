import { replaceArgsInString, replaceArgsInVode, type I18nArg, type I18nFirstArg } from "./arg.js";
import type { FlatCatalog } from "./bake-flat-catalog.js";
import type { I18nKey, I18nVodeKey } from "./key.js";
import type { I18nPluralForm, I18nVodePluralForm } from "./plural-form.js";
import type { ChildVode } from "./vode.js";

export function translateText<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    key: I18nKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): string | null {
    let raw = flatCatalog.get(key as I18nVodeKey<C>);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key as I18nVodeKey<C>);
    }
    if (raw === undefined) {
        console.warn(
            `Translation for key '${key}' not found neither in main nor in fallback catalog.`,
        );
        return null;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, pluralOrFirstArg as I18nArg, ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        let rules: Intl.PluralRules;
        let value: any;
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

        return replaceArgsInString(pluralText, value, ...restArgs);
    }

    console.warn(`Translation for key '${key}' is:`, raw);
    return null;
}

export function translateVode<C extends {}>(
    ordinal: Intl.PluralRules,
    cardinal: Intl.PluralRules,
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    key: I18nVodeKey<C>,
    pluralOrFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
): ChildVode | null {
    let raw = flatCatalog.get(key);
    if (raw === undefined && flatFallbackCatalog) {
        raw = flatFallbackCatalog.get(key);
    }
    if (raw === undefined) {
        console.warn(
            `Translation for key '${key}' not found neither in main nor in fallback catalog.`,
        );
        return null;
    }

    if (typeof raw === "string") {
        return replaceArgsInString(raw, pluralOrFirstArg as I18nArg, ...restArgs);
    } else if (raw && typeof raw === "object" && "_other" in raw) {
        let rules: Intl.PluralRules;
        let value: any;
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

        return replaceArgsInVode(pluralTextOrVode, value, ...restArgs);
    } else if (Array.isArray(raw)) {
        //make deep copy to avoid modifying original translation
        const copy = JSON.parse(JSON.stringify(raw)) as ChildVode;
        return replaceArgsInVode(copy, pluralOrFirstArg as I18nArg, ...restArgs);
    }

    console.warn(`translation for key ${key} is:`, raw);
    return null;
}

export function translateRaw<C extends {}>(
    flatCatalog: FlatCatalog<C>,
    flatFallbackCatalog: FlatCatalog<C> | undefined,
    key: I18nVodeKey<C>,
): any {
    const raw = flatCatalog.get(key);
    if (raw === undefined && flatFallbackCatalog) {
        return flatFallbackCatalog.get(key);
    }
    return raw;
}
