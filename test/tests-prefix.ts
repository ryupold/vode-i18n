import { createI18nContext } from "../index.js";
import { expect } from "./helper.js";

const catalog = {
    menu: {
        file: {
            open: "Open…",
            save: "Save {1}",
            recent: {
                _one: "{1} recent file",
                _other: "{1} recent files",
            },
        },
        edit: { undo: "Undo" },
    },
    ui: {
        banner: ["div", { class: "banner" }, "Welcome {1}"],
        meta: { version: 3 },
    },
};

export default {
    "$TPrefix(prefix): returns a $T bound to the given subtree": () => {
        const { $T, $TPrefix } = createI18nContext({ locale: "en", catalog });
        const $file = $TPrefix("menu.file");

        expect($file("open")).toEqual("Open…");
        expect($file("open")).toEqual($T("menu.file.open"));
    },

    "$TPrefix(prefix): passes plural count and args through to the translation": () => {
        const { $TPrefix } = createI18nContext({ locale: "en", catalog });
        const $file = $TPrefix("menu.file");

        expect($file("save", "draft.txt")).toEqual("Save draft.txt");
        expect($file("recent", 1)).toEqual("1 recent file");
        expect($file("recent", 12)).toEqual("12 recent files");
    },

    "$TPrefix(prefix): returns undefined for keys missing under the prefix": () => {
        const { $TPrefix } = createI18nContext({ locale: "en", catalog });
        const $edit = $TPrefix("menu.edit");

        expect($edit("nope" as any)).toEqual(undefined);
    },

    "$VPrefix(prefix): returns a $V bound to the given subtree": () => {
        const { $VPrefix } = createI18nContext({ locale: "en", catalog });
        const $ui = $VPrefix("ui");

        expect($ui("banner", "Anna")).toEqual(["div", { class: "banner" }, "Welcome Anna"]);
    },

    "$RPrefix(prefix): returns a $R bound to the given subtree": () => {
        const { $RPrefix } = createI18nContext({ locale: "en", catalog });
        const $meta = $RPrefix("ui.meta");

        expect($meta("version")).toEqual(3);
    },
};
