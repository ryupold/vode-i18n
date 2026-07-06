import { createI18nContext } from "..";
import { expect } from "./helper";

export default {
    "fallback catalog is used when key is not found in main catalog": () => {
        const { $T } = createI18nContext({
            locale: "fr",
            catalog: {
                foo: "bar",
            },
            fallbackCatalog: {
                bar: "FALLBACK for bar",
            },
        });

        expect($T("bar" as any)).toEqual("FALLBACK for bar");
    },

    "main catalog takes precedence over the fallback catalog": () => {
        const { $T } = createI18nContext({
            locale: "fr",
            catalog: {
                foo: "MAIN",
            },
            fallbackCatalog: {
                foo: "FALLBACK",
            },
        });

        expect($T("foo")).toEqual("MAIN");
    },

    "$T returns undefined when the key is missing in both catalogs": () => {
        const { $T } = createI18nContext({
            locale: "fr",
            catalog: {
                foo: "bar",
            },
            fallbackCatalog: {
                bar: "baz",
            },
        });

        expect($T("nope" as any)).toEqual(undefined);
    },

    "fallback translations support args and plural forms": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: { unused: "x" },
            fallbackCatalog: {
                greeting: "Hello, {1}",
                items: {
                    _one: "{1} item",
                    _other: "{1} items",
                },
            },
        });

        expect($T("greeting" as any, "Anna")).toEqual("Hello, Anna");
        expect($T("items" as any, 1)).toEqual("1 item");
        expect($T("items" as any, 3)).toEqual("3 items");
    },

    "$V resolves vodes from the fallback catalog": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: { unused: "x" },
            fallbackCatalog: {
                hello: ["b", "Hello {1}"],
            },
        });

        expect($V("hello" as any, "You")).toEqual(["b", "Hello You"]);
    },

    "fallbackCatalog as function: is queried with the flat key when the main catalog misses": () => {
        const seen: string[] = [];
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
            fallbackCatalog: (key: string) => {
                seen.push(key);
                return `FB(${key})`;
            },
        });

        expect($T("missing.key" as any)).toEqual("FB(missing.key)");
        expect(seen[0]).toEqual("missing.key");
    },

    "fallbackCatalog as function: is not queried when the main catalog has the key": () => {
        const seen: string[] = [];
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
            fallbackCatalog: (key: string) => {
                seen.push(key);
                return "FALLBACK";
            },
        });

        expect($T("foo")).toEqual("bar");
        expect(seen.length).toEqual(0);
    },

    "$T returns undefined when the resolved value is not a string or plural form": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
            fallbackCatalog: () => 42,
        });

        expect($T("anything" as any)).toEqual(undefined);
    },

    "$R falls back to the fallback catalog for raw values": () => {
        const { $R } = createI18nContext({
            locale: "en",
            catalog: {
                a: "main",
            },
            fallbackCatalog: {
                x: { y: { z: 42 } },
            },
        });

        expect($R("x.y" as any)).toEqual({ z: 42 });
        expect($R("x.y.z" as any)).toEqual(42);
        expect($R("x.y.nope" as any)).toEqual(undefined);
    },
};
