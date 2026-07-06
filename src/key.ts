import type { I18nPluralForm, I18nRawPluralForm, I18nVodePluralForm } from "./plural-form";
import type { ChildVode } from "./vode";

export type I18nKey<ObjectType> = {
    [Key in keyof ObjectType & (string | number | bigint)]: ObjectType[Key] extends I18nPluralForm
        ? `${Key}`
        : ObjectType[Key] extends string
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${I18nKey<ObjectType[Key]>}`
            : never;
}[keyof ObjectType & (string | number | bigint)];

export type I18nVodeKey<ObjectType> = {
    [Key in keyof ObjectType & string]: ObjectType[Key] extends I18nVodePluralForm
        ? `${Key}`
        : ObjectType[Key] extends ChildVode | readonly unknown[]
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${I18nVodeKey<ObjectType[Key]>}`
            : never;
}[keyof ObjectType & string];

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
