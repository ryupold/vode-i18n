import { bakeFlatCatalog } from "./bake-flat-catalog.js";
import { translateRaw, translateText, translateVode } from "./translate.js";
import type { I18nKey, I18nVodeKey } from "./key.js";
import type { I18nArg, I18nFirstArg } from "./arg.js";
import type { I18nSubtree } from "./subtree.js";
import type { ChildVode } from "./vode.js";

export type $TFunction<C extends {}> = (
    key: I18nKey<C>,
    pluralAndFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
) => string;
export type $TPrefixFunction<C extends {}> = <K extends I18nKey<C>>(
    prefix: K,
) => $TFunction<I18nSubtree<C, K> & {}>;

export type $VFunction<C extends {}> = (
    key: I18nVodeKey<C>,
    pluralAndFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
) => ChildVode;
export type $VPrefixFunction<C extends {}> = <K extends I18nVodeKey<C>>(
    prefix: K,
) => $VFunction<I18nSubtree<C, K> & {}>;

export type $RFunction<C extends {}> = (key: I18nVodeKey<C>) => any;
export type $RPrefixFunction<C extends {}> = <K extends I18nVodeKey<C>>(
    prefix: K,
) => $RFunction<I18nSubtree<C, K> & {}>;

export interface I18nContext<C extends {}> {
    readonly languageTag: string;
    readonly catalog: C;
    readonly fallbackCatalog?: C | undefined;

    /**
     * Gets the translation as text for the given key.
     * @param key A {@link I18nKey} that points to a string in the catalog.
     * @param pluralAndFirstArg Argument (a {@link I18nFirstArg}) that is used to select plural form and also replaces {1} in translation. If it is a number, it is treated as cardinal plural form.
     * @param restArgs Arguments to replace in the translation by index (e.g. {2} {3} {4})
     * @returns Translated string with replaced arguments if any. If the key is not found, the key itself is returned
     */
    $T: $TFunction<C>;

    /**
     * Prefix companion to {@link $T}.
     * Type safe way to access subtrees of the translation catalog.
     * @param prefix Path prefix to be prepended to the key when looking up translations
     * @returns A {@link $T} function that prepends the given prefix to the key when looking up translations
     */
    $TPrefix: $TPrefixFunction<C>;

    /**
     * Gets the translation as {@link ChildVode} for the given key.
     * @param key A {@link I18nVodeKey} that points to a string in the catalog.
     * @param pluralAndFirstArg Argument (a {@link I18nFirstArg}) that is used to select plural form and also replaces {1} in translation. If it is a number, it is treated as cardinal plural form.
     * @param restArgs Arguments to replace in the translation by index (e.g. {2} {3} {4})
     * @returns Translated string with replaced arguments if any. If the key is not found, the key itself is returned
     */
    $V: $VFunction<C>;

    /**
     * Prefix companion to {@link $V}.
     * Type safe way to access subtrees of the translation catalog.
     * @param prefix Path prefix to be prepended to the key when looking up translations
     * @returns A {@link $V} function that prepends the given prefix to the key when looking up translations
     */
    $VPrefix: $VPrefixFunction<C>;

    /** Gets the raw value from the catalog for the given key.
     * @param key A {@link I18nKey} that points to a string in the catalog.
     * @returns The raw value at given key.
     */
    $R: $RFunction<C>;

    /**
     * Prefix companion to {@link $R}.
     * Type safe way to access subtrees of the translation catalog.
     * @param prefix Path prefix to be prepended to the key when looking up translations
     * @returns A {@link $R} function that prepends the given prefix to the key when looking up translations
     */
    $RPrefix: $RPrefixFunction<C>;
}

export interface CreateI18nContextOptions<C extends {}> {
    languageTag: string;
    catalog: C;
    fallbackCatalog?: C | undefined;
}
export function createI18nContext<C extends {}>(
    options: CreateI18nContextOptions<C>,
): I18nContext<C> {
    const cardinal = new Intl.PluralRules(options.languageTag, { type: "cardinal" });
    const ordinal = new Intl.PluralRules(options.languageTag, { type: "ordinal" });

    const flatCatalog = bakeFlatCatalog(options.catalog);
    const flatFallbackCatalog = options.fallbackCatalog
        ? bakeFlatCatalog(options.fallbackCatalog)
        : undefined;

    return {
        languageTag: options.languageTag,
        catalog: options.catalog,
        fallbackCatalog: options.fallbackCatalog,
        $T: (key, pluralOrFirstArg, ...restArgs) =>
            translateText(
                ordinal,
                cardinal,
                flatCatalog,
                flatFallbackCatalog,
                key,
                pluralOrFirstArg,
                ...restArgs,
            ) || key,
        $TPrefix:
            (prefix) =>
            (key, pluralOrFirstArg, ...restArgs) =>
                translateText(
                    ordinal,
                    cardinal,
                    flatCatalog,
                    flatFallbackCatalog,
                    `${prefix}.${key}` as I18nKey<C>,
                    pluralOrFirstArg,
                    ...restArgs,
                ) || key,
        $V: (key, pluralOrFirstArg, ...restArgs) =>
            translateVode(
                ordinal,
                cardinal,
                flatCatalog,
                flatFallbackCatalog,
                key,
                pluralOrFirstArg,
                ...restArgs,
            ) || key,
        $VPrefix:
            (prefix) =>
            (key, pluralOrFirstArg, ...restArgs) =>
                translateVode(
                    ordinal,
                    cardinal,
                    flatCatalog,
                    flatFallbackCatalog,
                    `${prefix}.${key}` as I18nVodeKey<C>,
                    pluralOrFirstArg,
                    ...restArgs,
                ) || key,
        $R: (key) => translateRaw(flatCatalog, flatFallbackCatalog, key) || key,
        $RPrefix: (prefix) => (key) =>
            translateRaw(flatCatalog, flatFallbackCatalog, `${prefix}.${key}` as I18nVodeKey<C>) ||
            key,
    };
}
