import type { I18nPluralForm, I18nRawPluralForm } from "./plural-form.js";
import type { ChildVode } from "./vode.js";

/** dotted path to a text leaf (string or plural form) in the catalog */
export type I18nKey<ObjectType> = {
    [Key in keyof ObjectType & (string | number | bigint)]: ObjectType[Key] extends I18nPluralForm
        ? `${Key}`
        : ObjectType[Key] extends string
          ? `${Key}`
          : ObjectType[Key] extends readonly unknown[]
            ? never
            : ObjectType[Key] extends object
              ? `${Key}.${I18nKey<ObjectType[Key]>}`
              : never;
}[keyof ObjectType & (string | number | bigint)];

/** dotted path to a vode, string, or plural form leaf in the catalog */
export type I18nVodeKey<ObjectType> = {
    // any object with _other is treated as a plural form at runtime
    [Key in keyof ObjectType & string]: ObjectType[Key] extends { _other: unknown }
        ? `${Key}`
        : ObjectType[Key] extends ChildVode | readonly unknown[]
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}.${I18nVodeKey<ObjectType[Key]>}`
            : never;
}[keyof ObjectType & string];

/** dotted path to any value in the catalog */
export type I18nRawKey<ObjectType> = {
    [Key in keyof ObjectType & (string | number | bigint)]: ObjectType[Key] extends I18nRawPluralForm
        ? `${Key}`
        : ObjectType[Key] extends
                | string
                | readonly unknown[]
                | ((...args: never[]) => unknown)
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${I18nRawKey<ObjectType[Key]>}`
            : `${Key}`;
}[keyof ObjectType & (string | number | bigint)];

/** dotted path to a nested subtree (non-leaf object) of the catalog,
 * usable as prefix for $TPrefix / $VPrefix / $RPrefix */
export type I18nSubtreeKey<ObjectType> = {
    // any object with _other is treated as a plural form (leaf) at runtime
    [Key in keyof ObjectType & (string | number | bigint)]: ObjectType[Key] extends
        | { _other: unknown }
        | string
        | readonly unknown[]
        | ((...args: never[]) => unknown)
        ? never
        : ObjectType[Key] extends object
          ? `${Key}` | `${Key}.${I18nSubtreeKey<ObjectType[Key]>}`
          : never;
}[keyof ObjectType & (string | number | bigint)];
