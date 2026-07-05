/**
 * resolves the type of the nested value at a dotted-path key (e.g. `"a.b.c"`) within `ObjectType`
 */
export type I18nSubtree<ObjectType, K extends string> = K extends `${infer Head}.${infer Rest}`
    ? Head extends keyof ObjectType
        ? I18nSubtree<ObjectType[Head], Rest>
        : never
    : K extends keyof ObjectType
      ? ObjectType[K]
      : never;
