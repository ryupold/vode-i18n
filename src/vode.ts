/**
 * this is a minimal recreation of the vode structure as type.
 * allows to not need to import vode from a separate package.
 */
export type Vode = [tag: string, propsOrChild: object | Vode, ...children: Vode[]];

/**
 * subset of vodes ChildVode type without Component functions
 */
export type ChildVode = Vode | string | false | null | undefined;
