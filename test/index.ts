import contextTests from "./tests-context.js";
import tTests from "./tests-t.js";
import vTests from "./tests-v.js";
import rTests from "./tests-r.js";
import pluralTests from "./tests-plural.js";
import prefixTests from "./tests-prefix.js";
import fallbackTests from "./tests-fallback.js";
import typesTests from "./tests-types.js";

export const tests = {
    ...contextTests,

    ...tTests,
    ...vTests,
    ...rTests,

    ...pluralTests,
    ...prefixTests,

    ...fallbackTests,
    ...typesTests,
};
