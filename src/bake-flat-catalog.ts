import type { I18nVodeKey } from "./key.js";
import type { I18nVodePluralForm } from "./plural-form.js";
import type { ChildVode } from "./vode.js";

export type FlatCatalog<C extends {}> = Map<I18nVodeKey<C>, ChildVode | I18nVodePluralForm>;

export function bakeFlatCatalog<C extends {}>(strings: C): FlatCatalog<C> {
    const flatMap = new Map<I18nVodeKey<C>, ChildVode | I18nVodePluralForm>();
    function bakeRecursive(currentNode: Record<string | number, any>, prefix: string | undefined) {
        for (const key of Object.keys(currentNode)) {
            const value = currentNode[key];
            if(value === undefined || value === null) continue;
            if (
                typeof value === "string" || // text
                Array.isArray(value) || // vode
                (typeof value === "object" && "_other" in value) // plural
            ) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                flatMap.set(fullKey as I18nVodeKey<C>, value);
            } else if (typeof value === "object") {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                bakeRecursive(value, fullKey);
            }
        }
    }

    bakeRecursive(strings, undefined);

    return flatMap;
}
