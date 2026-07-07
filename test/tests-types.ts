import { createI18nContext } from "../index.js";

export default {
    "type safety: keys are restricted to leaves matching the function's result type": () => {
        const { $T, $V, $R, $TPrefix } = createI18nContext({
            locale: "en",
            catalog: {
                greeting: "Hello, {1}!",
                menu: { file: { open: "Open…" } },
                banner: ["div", { class: "banner" }, "Welcome {1}"],
                items: { _one: "{1} item", _other: "{1} items" },
                meta: { version: 3 },
            },
        });

        // valid keys compile
        $T("greeting", "John");
        $T("menu.file.open");
        $T("items", 2);
        $V("banner", "John");
        $V("menu.file.open");
        $R("meta.version");
        $TPrefix("menu.file")("open");

        // @ts-expect-error intermediate object paths are not valid $T keys
        const t1 = () => $T("menu");
        // @ts-expect-error vode leaves are not valid $T keys
        const t2 = () => $T("banner");
        // @ts-expect-error unknown keys don't compile
        const t3 = () => $T("menu.file.foobar");
        // @ts-expect-error intermediate object paths are not valid $V keys
        const v1 = () => $V("menu");
        // @ts-expect-error prefixes must point to a subtree, not a leaf
        const p1 = () => $TPrefix("greeting");

        void [t1, t2, t3, v1, p1];
    },
};
