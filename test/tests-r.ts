import { createI18nContext } from "..";
import { expect } from "./helper";

export default {
    "$R(key): returns the raw value mapped to the given key in the catalog": () => {
        const { $R } = createI18nContext({
            locale: "en",
            catalog: {
                foo: { a: 1, b: 2 },
                date: new Date("2026-07-06"),
            },
        });

        expect($R("foo")).toEqual({ a: 1, b: 2 });
        expect($R("date")).toEqual(new Date("2026-07-06"));
    },

    "$R(key): returns undefined if it is not found in the catalog": () => {
        const { $R } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
        });

        expect($R("not.found" as any)).toEqual(undefined);
    },

    "$R(key): returns nested subtrees as raw objects": () => {
        const { $R } = createI18nContext({
            locale: "en",
            catalog: {
                a: { b: { c: "leaf" } },
            },
        });

        expect($R("a")).toEqual({ b: { c: "leaf" } });
        expect($R("a.b")).toEqual({ c: "leaf" });
        expect($R("a.b.c")).toEqual("leaf");
    },

    "$R(key): returns undefined when the path leads through a non-object value": () => {
        const { $R } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
        });

        expect($R("foo.deeper" as any)).toEqual(undefined);
    },
};
