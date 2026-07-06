import { createI18nContext } from "..";
import { expect } from "./helper";

export default {
    "$T(key, {type: 'ordinal', value}): selects the plural form using ordinal rules": () => {
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

        expect($T("place", { type: "ordinal", value: 1 })).toEqual("1st place");
        expect($T("place", { type: "ordinal", value: 2 })).toEqual("2nd place");
        expect($T("place", { type: "ordinal", value: 3 })).toEqual("3rd place");
        expect($T("place", { type: "ordinal", value: 4 })).toEqual("4th place");
        expect($T("place", { type: "ordinal", value: 11 })).toEqual("11th place");
        expect($T("place", { type: "ordinal", value: 21 })).toEqual("21st place");
        expect($T("place", { type: "ordinal", value: 22 })).toEqual("22nd place");
        expect($T("place", { type: "ordinal", value: 103 })).toEqual("103rd place");
    },

    "$T(key, {type: 'cardinal', value}): behaves like passing a plain number": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                items: {
                    _one: "{1} item",
                    _other: "{1} items",
                },
            },
        });

        expect($T("items", { type: "cardinal", value: 1 })).toEqual("1 item");
        expect($T("items", { type: "cardinal", value: 7 })).toEqual("7 items");
        expect($T("items", 1)).toEqual($T("items", { type: "cardinal", value: 1 }));
    },

    "$T(key, n): exact numeric keys take precedence over plural rule categories": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                items: {
                    0: "no items at all",
                    2: "a couple of items",
                    _one: "{1} item",
                    _other: "{1} items",
                },
            },
        });

        expect($T("items", 0)).toEqual("no items at all");
        expect($T("items", 2)).toEqual("a couple of items");
        expect($T("items", 1)).toEqual("1 item");
        expect($T("items", 3)).toEqual("3 items");
    },

    "$T(key, n, ...restArgs): plural count fills {1}, rest args fill {2} onwards": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                files: {
                    _one: "one file in {2}",
                    _other: "{1} files in {2}",
                },
            },
        });

        expect($T("files", 1, "folder")).toEqual("one file in folder");
        expect($T("files", 3, "trash")).toEqual("3 files in trash");
    },

    "$T(key, n): falls back to _other when the selected plural category is missing": () => {
        const { $T } = createI18nContext({
            locale: "en",
            catalog: {
                items: {
                    _other: "{1} items",
                },
            },
        });

        expect($T("items", 1)).toEqual("1 items");
        expect($T("items", 5)).toEqual("5 items");
    },

    "$V(key, n): selects the vode plural form and replaces the count": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                items: {
                    _one: ["span", { class: "single" }, "one item"],
                    _other: ["span", { class: "multi" }, "{1} items"],
                },
            },
        });

        expect($V("items", 1)).toEqual(["span", { class: "single" }, "one item"]);
        expect($V("items", 4)).toEqual(["span", { class: "multi" }, "4 items"]);
    },

    "$V(key, n): exact numeric keys take precedence over plural rule categories": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                items: {
                    0: ["i", "nothing here"],
                    _other: ["span", "{1} items"],
                },
            },
        });

        expect($V("items", 0)).toEqual(["i", "nothing here"]);
        expect($V("items", 2)).toEqual(["span", "2 items"]);
    },

    "$V(key, {type: 'ordinal', value}): selects the vode plural form using ordinal rules": () => {
        const { $V } = createI18nContext({
            locale: "en",
            catalog: {
                place: {
                    _one: ["b", "{1}st"],
                    _other: ["b", "{1}th"],
                },
            },
        });

        expect($V("place", { type: "ordinal", value: 21 })).toEqual(["b", "21st"]);
        expect($V("place", { type: "ordinal", value: 20 })).toEqual(["b", "20th"]);
    },

    "$V(key, n): does not mutate the vode stored in the catalog": () => {
        const catalog = {
            items: {
                _other: ["span", "{1} items"],
            },
        };
        const { $V } = createI18nContext({ locale: "en", catalog });

        expect($V("items", 5)).toEqual(["span", "5 items"]);
        expect(catalog.items._other).toEqual(["span", "{1} items"]);
        expect($V("items", 9)).toEqual(["span", "9 items"]);
    },
};
