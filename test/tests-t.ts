import { createI18nContext } from "..";
import { expect } from "./helper";

export default {
    "$T(key): returns the string mapped to the given key in the catalog": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
                a: { b: { c: "baz" } },
            },
        });

        expect($T("foo")).toEqual("bar");
        expect($T("a.b.c")).toEqual("baz");
    },

    "$T(key): returns undefined if it is not found in the catalog": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
        });

        expect($T("not.found" as any)).toEqual(undefined);
    },

    "$T(key, ...args): replaces placeholders in the string with the given args": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                greeting: "Hello, {1}",
                detail: {
                    summary: "Today {1} has accomplished {2} tasks: {3}",
                },
            },
        });

        expect($T("greeting", "John")).toEqual("Hello, John");
        expect($T("detail.summary", "John", "2", "clean house & pay bills")).toEqual(
            "Today John has accomplished 2 tasks: clean house & pay bills",
        );
    },

    "$T(key): returns the string untouched when no args are given": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                template: "Hello, {1}",
            },
        });

        expect($T("template")).toEqual("Hello, {1}");
    },

    "$T(key, ...args): fills placeholders regardless of their position in the template": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                reversed: "{2} before {1}",
            },
        });

        expect($T("reversed", "world", "hello")).toEqual("hello before world");
    },

    "$T(key, ...args): leaves placeholders untouched for missing or empty args": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                pair: "{1} and {2}",
            },
        });

        expect($T("pair", "only one")).toEqual("only one and {2}");
        expect($T("pair", "", "two")).toEqual("{1} and two");
    },

    "$T(key, ...args): ignores extra args without placeholders": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                static: "static text",
            },
        });

        expect($T("static", "unused", "also unused")).toEqual("static text");
    },

    "$T(key, pluralAndFirstArg, ...restArgs): if the first arg is a number, treats it as a plural count": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                cardinal: {
                    weeks: {
                        _other: "It will take {1} weeks",
                        _one: "It will take {1} week",
                    }
                },
            },
        });

        expect($T("cardinal.weeks", 1)).toEqual("It will take 1 week");
        expect($T("cardinal.weeks", 5)).toEqual("It will take 5 weeks");
    },

    "$T(key, pluralAndFirstArg, ...restArgs): support up to 6 six plural categories": () => {
        const { $T } = createI18nContext({
            locale: "ar", // Arabic
            catalog: {
                cardinal: {
                    weeks: {
                        _other: "سيستغرق {1} أسبوع",
                        _zero: "سيستغرق {1} أسابيع",
                        _one: "سيستغرق {1} أسبوع",
                        _two: "سيستغرق {1} أسبوعين",
                        _few: "سيستغرق {1} أسابيع",
                        _many: "سيستغرق {1} أسبوعاً",
                    }
                },
            },
        });

        expect($T("cardinal.weeks", 0)).toEqual("سيستغرق 0 أسابيع");
        expect($T("cardinal.weeks", 1)).toEqual("سيستغرق 1 أسبوع");
        expect($T("cardinal.weeks", 2)).toEqual("سيستغرق 2 أسبوعين");
        expect($T("cardinal.weeks", 3)).toEqual("سيستغرق 3 أسابيع");
        expect($T("cardinal.weeks", 11)).toEqual("سيستغرق 11 أسبوعاً");
        expect($T("cardinal.weeks", 100)).toEqual("سيستغرق 100 أسبوع");
    },
};
