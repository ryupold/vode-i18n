import type { ChildVode } from "./vode.js";

/**
 * plural form for i18n texts
 */
export interface I18nPluralForm {
    [n: number]: string;
    _other: string;
    _zero?: string;
    _one?: string;
    _two?: string;
    _few?: string;
    _many?: string;
}

/**
 * plural form for i18n resulting child-vodes
 */
export interface I18nVodePluralForm {
    [n: number]: ChildVode;
    _other: ChildVode;
    _zero?: ChildVode;
    _one?: ChildVode;
    _two?: ChildVode;
    _few?: ChildVode;
    _many?: ChildVode;
}
