import contextTests from "./tests-context";
import tTests from "./tests-t";
import vTests from "./tests-v";
import rTests from "./tests-r";
import pluralTests from "./tests-plural";
import prefixTests from "./tests-prefix";
import fallbackTests from "./tests-fallback";

export const tests = {
    ...contextTests,

    ...tTests,
    ...vTests,
    ...rTests,

    ...pluralTests,
    ...prefixTests,

    ...fallbackTests,
};
