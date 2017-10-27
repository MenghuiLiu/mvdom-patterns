export type Partial<T> = {
	[P in keyof T]?: T[P];
}

type AnyButArray = object | number | string | boolean;

export function ensureArray<T extends AnyButArray>(a: T | Array<T>): Array<T> {
	return (a instanceof Array) ? a : [a];
}