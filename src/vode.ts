/**
 * this is a minimal recreation of the vode structure as type.
 * allows to not need to import vode from a separate package.
 */
export type Vode = [tag: string, propsOrChild: object | Vode, ...children: Vode[]];

/**
 * subset of vodes ChildVode type without Component functions
 */
export type ChildVode = Vode | string | false | null | undefined;

const TEXT_NODE = 3 as const;

/** index in vode at which child-vodes start */
export function childrenStart(vode: ChildVode): 1 | 2 | -1 {
    if (Array.isArray(vode) && vode.length > 1) {
        const first = vode[1];
        if (
            first &&
            typeof first === "object" &&
            !Array.isArray(first) &&
            (first as unknown as Node).nodeType !== TEXT_NODE
        )
            return vode.length > 2 ? 2 : -1;
        else return 1;
    }
    return -1;
}
