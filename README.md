# vode-i18n

Internationalization (i18n) library for [vode](https://ryupold.de/post/vode) based apps.

Support for deeply nested json catalogs with plurals support (utilizing [`Intl.PluralRules`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)).
Templating with variadic arguments and translations can even be [vodes](#translations-as-vodes).

## Usage

### ESM

```js
import { createI18nContext } from 'https://unpkg.com/@ryupold/vode-i18n/dist/vode-i18n.min.mjs';
```

### IIFE

Binds the library to the global `Vi18n` object.

```html
<script src="https://unpkg.com/@ryupold/vode-i18n/dist/vode-i18n.es5.min.js"></script>
<script>
    const { createI18nContext } = Vi18n;
</script>
```

### NPM

[![NPM](https://nodei.co/npm/@ryupold/vode-i18n.svg?color=red&data=n,v,s,d,u)](https://www.npmjs.com/package/@ryupold/vode-i18n)

```ts
import { createI18nContext } from '@ryupold/vode-i18n';
```

## Quick start

```ts
import { createI18nContext } from '@ryupold/vode-i18n';

const { $T, $V } = createI18nContext({
    locale: "en",
    catalog: {
        greeting: "Hello, {1}!",
        menu: {
            file: {
                open: "Open…",
                save: "Save {1}",
            },
        },
        items: {
            0: "no items at all",
            _one: "{1} item",
            _other: "{1} items",
        },
        banner: ["div", { class: "banner" }, "Welcome ", ["b", "{1}"]],
    },
    onMissingKey: (key) => key, // return the key as-is if no translation is found
});

$T("greeting", "John");     // "Hello, John!"
$T("menu.file.open");       // "Open…"
$T("items", 1);             // "1 item"
$T("items", 0);             // "no items at all"
$V("banner", "John");       // ["div", { class: "banner" }, "Welcome ", ["b", "John"]]
```

> When using TypeScript, all keys are typed. So for example, `$T("menu.file.foobar")` is a compile error because `"foobar"` is not a valid key for `"menu.file"`.

## The catalog

A catalog is a plain nested object. Leaves can be:

- **strings**: optionally containing `{1}`, `{2}`, … placeholders
- **plural forms**: objects with `_other` (required) and optional `_zero`, `_one`, `_two`, `_few`, `_many` or exact numeric keys. See [plural forms](#plurals).
- **vodes**: `[TAG, PROPS?, ...CHILDREN]` tuples, for translations with markup
- **anything else**: numbers, dates, functions… accessible via [`$R`](#raw-catalog-access)

Nested objects become dot-separated key paths: `{ menu: { file: { open: "Open…" } } }` is addressed as `"menu.file.open"`.

For multiple languages, create one context per locale. Type the other languages against your primary one so the compiler tells you when a translation is missing:

```ts
const en = { greeting: "Hello, {1}!" };
const de: typeof en = { greeting: "Hallo, {1}!" };

const i18n = createI18nContext({
    locale: userLocale,
    catalog: userLocale === "de" ? de : en,
    fallbackCatalog: en,
});
```

## createI18nContext

```ts
function createI18nContext<C>(options: {
    locale: Intl.UnicodeBCP47LocaleIdentifier;
    catalog: C;
    fallbackCatalog?: DeepPartial<C | Record<string, unknown>> | undefined;
    onMissingKey?: (key: string) => unknown;
}): I18nContext<C>
```

- **`locale`**: a [BCP 47 locale identifier](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument) like `"en"`, `"es-MX"`, `"zh-Hant-TW"`. Used to pick the right plural rules.
- **`catalog`**: your translation object (readonly).
- **`fallbackCatalog`** *(optional)*: consulted whenever a key misses the main catalog.
- **`onMissingKey`** *(optional)*: consulted whenever a key misses the main catalog and the fallback catalog.

The returned context contains `locale` and the six functions below.

## Translate to text

```ts
$T(key, pluralAndFirstArg?, ...restArgs): string | undefined
```

Looks up `key` and returns the translated string. Returns `undefined` if the key exists in neither catalog.

**Placeholder arguments** (strings or numbers) fill `{1}`, `{2}`, … in order:

```ts
const { $T } = createI18nContext({
    locale: "en",
    catalog: {
        summary: "Today {1} finished {2}",
        reversed: "{2} before {1}",
    },
});

$T("summary", "John", "his homework"); // "Today John finished his homework"
$T("reversed", "world", "hello");      // "hello before world"
```

Placeholders without a matching argument stay in the text (`$T("summary", "John")` → `"Today John has accomplished {2} tasks"`), and extra arguments are silently ignored.

### Plurals

If the value at `key` is a plural form (an object with `_other` key) and the first argument is a **number**, it selects the plural category (cardinal) and also fills `{1}`:

```ts
const { $T } = createI18nContext({
    locale: "en",
    catalog: {
        files: {
            _one: "one file in {2}",
            _other: "{1} files in {2}",
        },
    },
});

$T("files", 1, "folder");   // "one file in folder"
$T("files", 3, "trash");    // "3 files in trash"
```

Selection order:

1. an **exact numeric key** (`0`, `2`, …) wins if present
2. otherwise the category chosen by `Intl.PluralRules` for your locale (`_zero`, `_one`, `_two`, `_few`, `_many`)
3. otherwise `_other`

Which of the six CLDR categories apply is decided by the locale, not by hardcoded English logic. French, for example, treats 0 as singular and uses `_many` for millions:

```ts
const { $T } = createI18nContext({
    locale: "fr",
    catalog: {
        jours: {
            _one: "{1} jour restant",
            _many: "{1} de jours restants",
            _other: "{1} jours restants",
        },
    },
});

$T("jours", 0);        // "0 jour restant" (singular!)
$T("jours", 1);        // "1 jour restant"
$T("jours", 5);        // "5 jours restants"
$T("jours", 1000000);  // "1000000 de jours restants"
```

For **ordinal** plurals (1st, 2nd, 3rd…), pass `{ type: "ordinal", value: n }` as first argument after the key instead of a plain number:

```ts
const { $T } = createI18nContext({
    locale: "en",
    catalog: {
        place: {
            _one: "{1}st place",
            _two: "{1}nd place",
            _few: "{1}rd place",
            _other: "{1}th place",
        },
    },
});

$T("place", { type: "ordinal", value: 1 });     // "1st place"
$T("place", { type: "ordinal", value: 22 });    // "22nd place"
$T("place", { type: "ordinal", value: 103 });   // "103rd place"
```

(`{ type: "cardinal", value: n }` is equivalent to passing `n` directly.)

## Translations as vodes

```ts
$V(key, pluralAndFirstArg?, ...restArgs): ChildVode
```

Same lookup, plural, and placeholder rules as `$T`, but the catalog value may be a vode:

```ts
const { $V } = createI18nContext({
    locale: "en",
    catalog: {
        banner: ["div", { class: "banner" }, "Welcome {1}", ["b", "to {2}"]],
        items: {
            _one: ["span", { class: "single" }, "one item"],
            _other: ["span", { class: "multi" }, "{1} items"],
        },
    },
});

$V("banner", "John", "Wonderland");
// ["div", { class: "banner" }, "Welcome John", ["b", "to Wonderland"]]

$V("items", 4);
// ["span", { class: "multi" }, "4 items"]
```

Drop the result straight into your view:

```ts
app(container, state, (s) => [DIV,
    $V("banner", s.userName, s.appName),
]);
```

Notes:

- Placeholders are replaced in **children** (recursively), never in props: a `{1}` inside `class` or `style` stays as-is.
- Plain strings work with `$V` too; it simply returns the translated string.

## Raw catalog access

```ts
$R(key): any
```

Returns whatever sits at `key`. No placeholder replacement, no plural selection. Use it for non-string values or to grab whole subtrees:

```ts
const { $R } = createI18nContext({
    locale: "en",
    catalog: {
        meta: { version: 3, released: new Date("2026-07-06") },
        a: { b: { c: "leaf" } },
    },
});

$R("meta.version");    // 3
$R("a.b");             // { c: "leaf" }
$R("a.b.c");           // "leaf"
```

## $TPrefix / $VPrefix / $RPrefix

Each function has a prefix companion that binds it to a subtree of the catalog. Great for components that only care about one corner of your translations:

```ts
const { $TPrefix } = createI18nContext({
    locale: "en",
    catalog: {
        menu: {
            file: {
                open: "Open…",
                save: "Save {1}",
                recent: { _one: "{1} recent file", _other: "{1} recent files" },
            },
        },
    },
});

const $file = $TPrefix("menu.file");

$file("open");           // "Open…"
$file("save", "a.txt");  // "Save a.txt"
$file("recent", 12);     // "12 recent files"
```

The returned function is fully typed against the subtree. `$file("nope")` won't compile in TS. `$VPrefix` and `$RPrefix` work the same way for vodes and raw values.

## Fallback catalog

When a key is missing from the main catalog, the `fallbackCatalog` is consulted before giving up:

```ts
const { $T } = createI18nContext({
    locale: "de",
    catalog: de,        // partial German translation
    fallbackCatalog: en, // complete English catalog
});
```

- The main catalog always wins when both have the key.
- Fallback values support everything the main catalog does: placeholders, plural forms, vodes.

A function can also be provided as fallback to handle missing keys. It is called when neither the main catalog nor the fallback catalog has the key. It can return anything that can be inside a catalog.

```ts
createI18nContext({
    locale: "en",
    catalog: en,
    fallbackCatalog: {},
    onMissingKey: (key) => key,
});
```

If nothing else is provided and the key is found nowhere, `$T`/`$V`/`$R` return `undefined`.

## Catalog mutation

Currently not supported as the catalog passed
to `createI18nContext()`is baked into a flat structure.

If you want to update the catalog at runtime
you need to call `createI18nContext` again with the updated object.

---

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript)](https://www.typescriptlang.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
