import { createI18nContext } from "..";
import { expect } from "./helper";

export default {
    "createContext(): creates a translation context for given catalog":
        () => {
            const catalog = {
                foo: "bar",
                bar: "hallo welt",
            };

            const l10n = createI18nContext({
                locale: "de",
                catalog: catalog,
            });

            expect(l10n.locale).toEqual("de");
        },

    "createContext(): returns $T, $V, $R, $TPrefix, $VPrefix, $RPrefix translation functions":
        () => {
            const { $T, $V, $R, $TPrefix, $VPrefix, $RPrefix } = createI18nContext({
                locale: "en",
                catalog: {
                    foo: "bar",
                    a: { b: { c: "baz" } },
                },
            });

            expect($T).toBeA("function");
            expect($V).toBeA("function");
            expect($R).toBeA("function");
            expect($TPrefix).toBeA("function");
            expect($VPrefix).toBeA("function");
            expect($RPrefix).toBeA("function");
        },
};
