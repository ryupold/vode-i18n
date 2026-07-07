// src/bake-flat-catalog.ts
function bakeFlatCatalog(strings) {
  const flatMap = /* @__PURE__ */ new Map();
  function bakeRecursive(currentNode, prefix) {
    for (const key of Object.keys(currentNode)) {
      const value = currentNode[key];
      if (value === void 0 || value === null) continue;
      if (typeof value === "string" || // text
      Array.isArray(value) || // vode
      typeof value === "object" && "_other" in value) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        flatMap.set(fullKey, value);
      } else if (typeof value === "object") {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        bakeRecursive(value, fullKey);
      }
    }
  }
  bakeRecursive(strings, void 0);
  return flatMap;
}

// src/vode.ts
var TEXT_NODE = 3;
function childrenStart(vode) {
  if (Array.isArray(vode) && vode.length > 1) {
    const first = vode[1];
    if (first && typeof first === "object" && !Array.isArray(first) && first.nodeType !== TEXT_NODE)
      return vode.length > 2 ? 2 : -1;
    else return 1;
  }
  return -1;
}

// src/arg.ts
var PLACEHOLDER = /\{(\d+)\}/g;
function replaceArgsInString(template, ...args) {
  return template.replace(PLACEHOLDER, (placeholder, n) => {
    const arg = args[Number(n) - 1];
    return arg === void 0 || arg === null ? placeholder : String(arg);
  });
}
function replaceArgsInVode(template, ...args) {
  if (typeof template === "string") {
    return replaceArgsInString(template, ...args);
  } else if (Array.isArray(template)) {
    const kidsStartIndex = childrenStart(template);
    for (let i = kidsStartIndex; i < template.length; i++) {
      const child = template[i];
      template[i] = replaceArgsInVode(child, ...args);
    }
    return template;
  }
  return template;
}

// src/translate.ts
function selectPlural(ordinal, cardinal, plural, pluralOrFirstArg) {
  let rules;
  let value;
  if (typeof pluralOrFirstArg === "object" && pluralOrFirstArg !== null) {
    rules = pluralOrFirstArg.type === "ordinal" ? ordinal : cardinal;
    value = pluralOrFirstArg.value;
  } else {
    rules = cardinal;
    value = pluralOrFirstArg;
  }
  const entries = plural;
  let selected = entries[value];
  if (selected === void 0) {
    const pluralForm = rules.select(value);
    selected = entries[`_${pluralForm}`] ?? plural._other;
  }
  return { value, selected };
}
function firstArgValue(pluralOrFirstArg) {
  return typeof pluralOrFirstArg === "object" && pluralOrFirstArg !== null ? pluralOrFirstArg.value : pluralOrFirstArg;
}
function deepCopy(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
function translateText(ordinal, cardinal, flatCatalog, flatFallbackCatalog, onMissingKey, key, pluralOrFirstArg, ...restArgs) {
  let raw = flatCatalog.get(key);
  if (raw === void 0 && flatFallbackCatalog) {
    raw = flatFallbackCatalog.get(key);
  }
  if (raw === void 0) {
    raw = onMissingKey?.(key);
  }
  if (raw === void 0) {
    return void 0;
  }
  if (typeof raw === "string") {
    return replaceArgsInString(raw, firstArgValue(pluralOrFirstArg), ...restArgs);
  } else if (raw && typeof raw === "object" && "_other" in raw) {
    const { value, selected } = selectPlural(
      ordinal,
      cardinal,
      raw,
      pluralOrFirstArg
    );
    return replaceArgsInString(selected, String(value), ...restArgs);
  }
  return void 0;
}
function translateVode(ordinal, cardinal, flatCatalog, flatFallbackCatalog, onMissingKey, key, pluralOrFirstArg, ...restArgs) {
  let raw = flatCatalog.get(key);
  if (raw === void 0 && flatFallbackCatalog) {
    raw = flatFallbackCatalog.get(key);
  }
  if (raw === void 0) {
    raw = onMissingKey?.(key);
  }
  if (raw === void 0) {
    return void 0;
  }
  if (typeof raw === "string") {
    return replaceArgsInString(raw, firstArgValue(pluralOrFirstArg), ...restArgs);
  } else if (raw && typeof raw === "object" && "_other" in raw) {
    const { value, selected } = selectPlural(
      ordinal,
      cardinal,
      raw,
      pluralOrFirstArg
    );
    const vode = Array.isArray(selected) ? deepCopy(selected) : selected;
    return replaceArgsInVode(vode, String(value), ...restArgs);
  } else if (Array.isArray(raw)) {
    return replaceArgsInVode(deepCopy(raw), firstArgValue(pluralOrFirstArg), ...restArgs);
  }
  return void 0;
}
function translateRaw(catalog, fallbackCatalog, onMissingKey, key) {
  let raw = void 0;
  const path = key.split(".");
  let current = catalog;
  for (const segment of path) {
    if (typeof current === "object" && current !== null) {
      current = current[segment];
    } else {
      current = void 0;
      break;
    }
  }
  raw = current;
  if (raw === void 0 && fallbackCatalog) {
    current = fallbackCatalog;
    for (const segment of path) {
      if (typeof current === "object" && current !== null) {
        current = current[segment];
      } else {
        current = void 0;
        break;
      }
    }
    raw = current;
  }
  if (raw === void 0) {
    raw = onMissingKey?.(key);
  }
  return raw;
}

// src/context.ts
function createI18nContext(options) {
  const cardinal = new Intl.PluralRules(options.locale, { type: "cardinal" });
  const ordinal = new Intl.PluralRules(options.locale, { type: "ordinal" });
  const flatCatalog = bakeFlatCatalog(options.catalog);
  const flatFallbackCatalog = !!options.fallbackCatalog && typeof options.fallbackCatalog === "object" ? bakeFlatCatalog(options.fallbackCatalog) : void 0;
  return {
    locale: options.locale,
    $T: (key, pluralOrFirstArg, ...restArgs) => translateText(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      options.onMissingKey,
      key,
      pluralOrFirstArg,
      ...restArgs
    ),
    $TPrefix: (prefix) => (key, pluralOrFirstArg, ...restArgs) => translateText(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      options.onMissingKey,
      `${prefix}.${key}`,
      pluralOrFirstArg,
      ...restArgs
    ),
    $V: (key, pluralOrFirstArg, ...restArgs) => translateVode(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      options.onMissingKey,
      key,
      pluralOrFirstArg,
      ...restArgs
    ),
    $VPrefix: (prefix) => (key, pluralOrFirstArg, ...restArgs) => translateVode(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      options.onMissingKey,
      `${prefix}.${key}`,
      pluralOrFirstArg,
      ...restArgs
    ),
    $R: (key) => translateRaw(options.catalog, options.fallbackCatalog, options.onMissingKey, key),
    $RPrefix: (prefix) => (key) => translateRaw(
      options.catalog,
      options.fallbackCatalog,
      options.onMissingKey,
      `${prefix}.${key}`
    )
  };
}
export {
  childrenStart,
  createI18nContext
};
