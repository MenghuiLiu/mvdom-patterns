import * as ajax from "./ajax";
import { Criteria } from 'common/criteria';

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

export function dso(type: string): any {
	var dso = dsoDic[type];

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
	id?: number;
}


export interface Dso<E> {

	create(entity: E): Promise<E>;

	update(id: number, entity: E): Promise<E>;

	get(id: number): Promise<E>;

	list(criteria: Criteria): Promise<E[]>;

	first(criteria: Criteria): Promise<E | null>;

	remove(id: number): Promise<boolean>;
}