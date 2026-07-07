import { bakeFlatCatalog, FlatCatalog } from "./bake-flat-catalog.js";
import { translateRaw, translateText, translateVode } from "./translate.js";
import type { I18nKey, I18nRawKey, I18nSubtreeKey, I18nVodeKey } from "./key.js";
import type { I18nArg, I18nFirstArg } from "./arg.js";
import type { I18nSubtree } from "./subtree.js";
import type { ChildVode } from "./vode.js";

export type $TFunction<C extends {}> = (
    key: I18nKey<C>,
    pluralAndFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
) => string;
export type $TPrefixFunction<C extends {}> = <K extends I18nSubtreeKey<C>>(
    prefix: K,
) => $TFunction<I18nSubtree<C, K> & {}>;

export type $VFunction<C extends {}> = (
    key: I18nVodeKey<C>,
    pluralAndFirstArg?: I18nFirstArg,
    ...restArgs: I18nArg[]
) => ChildVode;
export type $VPrefixFunction<C extends {}> = <K extends I18nSubtreeKey<C>>(
    prefix: K,
) => $VFunction<I18nSubtree<C, K> & {}>;

export type $RFunction<C extends {}> = (key: I18nRawKey<C>) => any;
export type $RPrefixFunction<C extends {}> = <K extends I18nSubtreeKey<C>>(
    prefix: K,
) => $RFunction<I18nSubtree<C, K> & {}>;

type DeepPartial<S> = {
    [P in keyof S]?: S[P] extends Array<infer I> ? Array<DeepPartial<I>> : DeepPartial<S[P]>;
};

export interface I18nContext<C extends {}> {
    /**
     * A string that is a valid [Unicode BCP 47 Locale Identifier](https://unicode.org/reports/tr35/#Unicode_locale_identifier).
     *
     * For example: "fa", "es-MX", "zh-Hant-TW".
     *
     * See [MDN - Intl - locales argument](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
     */
    readonly locale: Intl.UnicodeBCP47LocaleIdentifier;

    /**
     * Gets the translation as text for the given key.
     * @param key A {@link I18nKey} that points to a string in the catalog.
     * @param pluralAndFirstArg Argument (a {@link I18nFirstArg}) that is used to select plural form and also replaces {1} in translation. If it is a number, it is treated as cardinal plural form.
     * @param restArgs Arguments to replace in the translation by index (e.g. {2} {3} {4})
     * @returns Translated string with replaced arguments if any. If the key is found in neither catalog, `undefined` is returned
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
     * @param key A {@link I18nVodeKey} that points to a vode, string, or plural form in the catalog.
     * @param pluralAndFirstArg Argument (a {@link I18nFirstArg}) that is used to select plural form and also replaces {1} in translation. If it is a number, it is treated as cardinal plural form.
     * @param restArgs Arguments to replace in the translation by index (e.g. {2} {3} {4})
     * @returns Translated {@link ChildVode} with replaced arguments if any. If the key is found in neither catalog, `undefined` is returned
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
     * @param key A {@link I18nRawKey} that points to any value in the catalog.
     * @returns The raw value at given key. If the key is found in neither catalog, `undefined` is returned.
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
    /**
     * A string that is a valid [Unicode BCP 47 Locale Identifier](https://unicode.org/reports/tr35/#Unicode_locale_identifier).
     *
     * For example: "fa", "es-MX", "zh-Hant-TW".
     *
     * See [MDN - Intl - locales argument](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
     */
    locale: Intl.UnicodeBCP47LocaleIdentifier;

    /**
     * The translation catalog to use for this context.
     * An variably deep nested object that maps translation keys to their corresponding values.
     */
    catalog: C;

    /**
     * The fallback catalog to use for this context.
     * This is used when a translation key is not found in the main catalog.
     */
    fallbackCatalog?: DeepPartial<C | Record<string, unknown>> | undefined;

    /**
     * This is used when a translation key is not found in the main catalog and the fallback catalog.
     */
    onMissingKey?: ((key: string) => unknown) | undefined;
}
export function createI18nContext<C extends {}>(
    options: CreateI18nContextOptions<C>,
): I18nContext<C> {
    const cardinal = new Intl.PluralRules(options.locale, { type: "cardinal" });
    const ordinal = new Intl.PluralRules(options.locale, { type: "ordinal" });

    const flatCatalog = bakeFlatCatalog(options.catalog);
    const flatFallbackCatalog =
        !!options.fallbackCatalog && typeof options.fallbackCatalog === "object"
            ? (bakeFlatCatalog(options.fallbackCatalog) as FlatCatalog<C>)
            : undefined;

    return {
        locale: options.locale,
        $T: (key, pluralOrFirstArg, ...restArgs) =>
            translateText(
                ordinal,
                cardinal,
                flatCatalog,
                flatFallbackCatalog,
                options.onMissingKey,
                key,
                pluralOrFirstArg,
                ...restArgs,
            )!,
        $TPrefix:
            (prefix) =>
            (key, pluralOrFirstArg, ...restArgs) =>
                translateText(
                    ordinal,
                    cardinal,
                    flatCatalog,
                    flatFallbackCatalog,
                    options.onMissingKey,
                    `${prefix}.${key}` as I18nKey<C>,
                    pluralOrFirstArg,
                    ...restArgs,
                )!,
        $V: (key, pluralOrFirstArg, ...restArgs) =>
            translateVode(
                ordinal,
                cardinal,
                flatCatalog,
                flatFallbackCatalog,
                options.onMissingKey,
                key,
                pluralOrFirstArg,
                ...restArgs,
            ),
        $VPrefix:
            (prefix) =>
            (key, pluralOrFirstArg, ...restArgs) =>
                translateVode(
                    ordinal,
                    cardinal,
                    flatCatalog,
                    flatFallbackCatalog,
                    options.onMissingKey,
                    `${prefix}.${key}` as I18nVodeKey<C>,
                    pluralOrFirstArg,
                    ...restArgs,
                ),
        $R: (key) =>
            translateRaw(options.catalog, options.fallbackCatalog, options.onMissingKey, key),
        $RPrefix: (prefix) => (key) =>
            translateRaw(
                options.catalog,
                options.fallbackCatalog,
                options.onMissingKey,
                `${prefix}.${key}`,
            ),
    };
}
