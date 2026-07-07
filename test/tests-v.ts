import { createI18nContext } from "../index.js";
import { expect } from "./helper.js";

export default {
    "$V(key): returns the child-vode mapped to the given key in the catalog": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                normalVode: ["span", { style: { color: "red" } }, "hello"],
                string: "world",
            },
        });

        expect($V("normalVode")).toEqual(["span", { style: { color: "red" } }, "hello"]);
        expect($V("string")).toEqual("world");
    },

    "$V(key): returns undefined if it is not found in the catalog": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                foo: "bar",
            },
        });

        expect($V("not.found" as any)).toEqual(undefined);
    },

    "$V(key, ...args): replaces placeholders in vode children but not in props": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                banner: ["div", { class: "banner {1}" }, "Welcome {1}", ["b", "to {2}"]],
            },
        });

        expect($V("banner", "Anna", "Wonderland")).toEqual([
            "div",
            { class: "banner {1}" },
            "Welcome Anna",
            ["b", "to Wonderland"],
        ]);
    },

    "$V(key, ...args): does not mutate the vode stored in the catalog": () => {
        const catalog = {
            banner: ["div", "Hello {1}"],
        };
        const { $V } = createI18nContext({ locale: "en", catalog });

        expect($V("banner", "First")).toEqual(["div", "Hello First"]);
        expect(catalog.banner).toEqual(["div", "Hello {1}"]);
        expect($V("banner", "Second")).toEqual(["div", "Hello Second"]);
    },

    "$V(key, ...args): replaces placeholders when the value is a plain string": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                greeting: "Hello, {1}",
            },
        });

        expect($V("greeting", "Anna")).toEqual("Hello, Anna");
    },

    "$V(key, ...args): replaces placeholders in children of a vode without props": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                plain: ["span", "Hello {1}", "and {2}"],
            },
        });

        expect($V("plain", "Anna", "Bert")).toEqual(["span", "Hello Anna", "and Bert"]);
    },

    "$V(key, ...args): replaces placeholders in nested vodes recursively": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                nested: ["div", ["b", "{1}"], ["span", { id: "x" }, ["i", "{2}"]]],
            },
        });

        expect($V("nested", "bold", "italic")).toEqual([
            "div",
            ["b", "bold"],
            ["span", { id: "x" }, ["i", "italic"]],
        ]);
    },

    "$V(key, ...args): preserves falsy children inside a vode": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                partial: ["div", null, "text {1}"],
            },
        });

        expect($V("partial", "X")).toEqual(["div", null, "text X"]);
    },
};
