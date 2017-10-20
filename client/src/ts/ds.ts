import * as ajax from "./ajax";
import { QueryOptions } from 'common/query-options';

// The 'ds' module is the DataService module which is the layer to access data. The pattern here is that, 
// the first param is the object type, which allows to have a single access points to data and start with dynamic/generic
// CRUD behavior and customize as needed behind the scene.

// dso by name
var dsoDic: { [name: string]: any } = {};

type DsoFallbackFn = (type: string) => any;

// optional dso fallback factory
var _dsoFallbackFn: DsoFallbackFn;

export module ds {
	export function register(type: string, dso: any) {
		dsoDic[type] = dso;
	}

	export function fallback(dsoFallbackFn: DsoFallbackFn) {
		_dsoFallbackFn = dsoFallbackFn;
	}
}

export function dso(type: string): Dso<AnyEntity> {
	var dso = dsoDic[type] as Dso<AnyEntity>;

	// if no dso found, but we have a dsoFallback factory, then, we create it.
	if (!dso && _dsoFallbackFn) {
		dsoDic[type] = dso = _dsoFallbackFn(type);
	}

	// throw exception if still no dso
	if (!dso) {
		throw new Error("No dso for type " + type);
	}

	return dso;
}

export interface BaseEntity {
	id: number;
}

export interface AnyEntity extends BaseEntity {
	[prop: string]: any;
}

export interface Dso<E> {

	create(entity: object): Promise<E>;

	update(id: number, entity: object): Promise<E>;

	get(id: number): Promise<E>;

	list(opts?: QueryOptions): Promise<E[]>;

	first(opts?: QueryOptions): Promise<E | null>;

	remove(id: number): Promise<boolean>;
}