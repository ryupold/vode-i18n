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

// src/arg.ts
function replaceArgsInString(template, ...args) {
  let i = 1;
  for (const arg of args) {
    if (arg) template = template.replace(`{${i}}`, arg);
    i++;
  }
  return template;
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

// src/translate.ts
function translateText(ordinal, cardinal, flatCatalog, flatFallbackCatalog, key, pluralOrFirstArg, ...restArgs) {
  let raw = flatCatalog.get(key);
  if (raw === void 0 && flatFallbackCatalog) {
    raw = flatFallbackCatalog.get(key);
  }
  if (raw === void 0) {
    return void 0;
  }
  if (typeof raw === "string") {
    return replaceArgsInString(raw, pluralOrFirstArg, ...restArgs);
  } else if (raw && typeof raw === "object" && "_other" in raw) {
    let rules;
    let value;
    if (typeof pluralOrFirstArg === "object") {
      if (pluralOrFirstArg.type === "ordinal") rules = ordinal;
      else rules = cardinal;
      value = pluralOrFirstArg.value;
    } else {
      rules = cardinal;
      value = pluralOrFirstArg;
    }
    let pluralText = raw[value];
    if (!pluralText) {
      const pluralForm = rules.select(value);
      pluralText = raw[`_${pluralForm}`] || raw._other;
    }
    return replaceArgsInString(pluralText, String(value), ...restArgs);
  }
  return void 0;
}
function translateVode(ordinal, cardinal, flatCatalog, flatFallbackCatalog, key, pluralOrFirstArg, ...restArgs) {
  let raw = flatCatalog.get(key);
  if (raw === void 0 && flatFallbackCatalog) {
    raw = flatFallbackCatalog.get(key);
  }
  if (raw === void 0) {
    return void 0;
  }
  if (typeof raw === "string") {
    return replaceArgsInString(raw, pluralOrFirstArg, ...restArgs);
  } else if (raw && typeof raw === "object" && "_other" in raw) {
    let rules;
    let value;
    if (typeof pluralOrFirstArg === "object") {
      if (pluralOrFirstArg.type === "ordinal") rules = ordinal;
      else rules = cardinal;
      value = pluralOrFirstArg.value;
    } else {
      rules = cardinal;
      value = pluralOrFirstArg;
    }
    let pluralTextOrVode = raw[value];
    if (!pluralTextOrVode) {
      const pluralForm = rules.select(value);
      pluralTextOrVode = raw[`_${pluralForm}`] || raw._other;
    }
    if (Array.isArray(pluralTextOrVode)) {
      pluralTextOrVode = JSON.parse(JSON.stringify(pluralTextOrVode));
    }
    return replaceArgsInVode(pluralTextOrVode, String(value), ...restArgs);
  } else if (Array.isArray(raw)) {
    const copy = JSON.parse(JSON.stringify(raw));
    return replaceArgsInVode(copy, pluralOrFirstArg, ...restArgs);
  }
  return void 0;
}
function translateRaw(catalog, fallbackCatalog, key) {
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
  return raw;
}

// src/context.ts
function createI18nContext(options) {
  const cardinal = new Intl.PluralRules(options.locale, { type: "cardinal" });
  const ordinal = new Intl.PluralRules(options.locale, { type: "ordinal" });
  const flatCatalog = bakeFlatCatalog(options.catalog);
  const flatFallbackCatalog = typeof options.fallbackCatalog === "function" ? { get: options.fallbackCatalog } : !!options.fallbackCatalog && typeof options.fallbackCatalog === "object" ? bakeFlatCatalog(options.fallbackCatalog) : void 0;
  return {
    locale: options.locale,
    $T: (key, pluralOrFirstArg, ...restArgs) => translateText(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      key,
      pluralOrFirstArg,
      ...restArgs
    ),
    $TPrefix: (prefix) => (key, pluralOrFirstArg, ...restArgs) => translateText(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      `${prefix}.${key}`,
      pluralOrFirstArg,
      ...restArgs
    ),
    $V: (key, pluralOrFirstArg, ...restArgs) => translateVode(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      key,
      pluralOrFirstArg,
      ...restArgs
    ),
    $VPrefix: (prefix) => (key, pluralOrFirstArg, ...restArgs) => translateVode(
      ordinal,
      cardinal,
      flatCatalog,
      flatFallbackCatalog,
      `${prefix}.${key}`,
      pluralOrFirstArg,
      ...restArgs
    ),
    $R: (key) => translateRaw(options.catalog, options.fallbackCatalog, key),
    $RPrefix: (prefix) => (key) => translateRaw(options.catalog, options.fallbackCatalog, `${prefix}.${key}`)
  };
}
export {
  createI18nContext
};
