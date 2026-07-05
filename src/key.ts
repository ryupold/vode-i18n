import type { I18nPluralForm, I18nVodePluralForm } from "./plural-form.js";
import type { ChildVode } from "./vode.js";

export type I18nKey<ObjectType> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends I18nPluralForm
        ? `${Key}`
        : ObjectType[Key] extends string
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${I18nKey<ObjectType[Key]>}`
            : never;
}[keyof ObjectType & (string | number)];

export type I18nVodeKey<ObjectType> = {
    [Key in keyof ObjectType & string]: ObjectType[Key] extends I18nVodePluralForm
        ? `${Key}`
        : ObjectType[Key] extends ChildVode
          ? `${Key}`
          : ObjectType[Key] extends object
            ? `${Key}` | `${Key}.${I18nVodeKey<ObjectType[Key]>}`
            : never;
}[keyof ObjectType & string];
