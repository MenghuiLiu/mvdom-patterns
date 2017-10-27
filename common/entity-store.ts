import { QueryOptions, JoinOptions, Filter, PropertyJoin, EntityJoin } from './query-options';
import { ensureArray } from 'common/utils';

export type AnyEntity = { id: number, [prop: string]: any };

// --------- Result Types --------- //
interface ResultBase {
	format: 'graph' | 'rel';
}

/** Return type for all create/get/update entityStore methods (when we know we have a entity back) */
export interface ResultEntity extends ResultBase {
	data: AnyEntity;
}

/** Return type for 'first' which might or might not have a .data */
export interface ResultMaybeEntity extends ResultBase {
	data: AnyEntity | null;
}

export type EntityDic = { [entityId: string]: AnyEntity };
export type Rel = {
	[entityTypeName: string]: EntityDic
};


/** Return type of EntityStore.list, where data is the array of Entities (empty array, but never null). 
 * The `.rel` contain the eventual joined entity when the resultFormat is 'rel'
 */
export interface ResultList extends ResultBase {
	data: AnyEntity[];
	rel?: Rel;
}
// --------- /Result Types --------- //


/** Common interface for all EntityStore */
export interface EntityStore {
	create(type: string, data: object): Promise<ResultEntity>;
	update(type: string, id: number, data: object): Promise<ResultEntity>;
	get(type: string, id: number): Promise<ResultEntity>;
	first(type: string, opts?: QueryOptions): Promise<ResultMaybeEntity>;
	list(type: string, opts?: QueryOptions): Promise<ResultList>;
	remove(type: string, id: number): Promise<boolean>
}