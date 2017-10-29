import { hub } from 'mvdom';
import { Dso, BaseEntity } from './ds';
import { QueryOptions } from "common/query-options";
import { get, post, patch, delet } from './ajax';

/**
 * InMemory (browser) implementation of the DataService ("ds"). 
 * 
 * - Use this during initial development or proof of concepts that cannot have server persistence.
 * 
 * - All APIs respect the "ds" async contract (return Promise) so that changing 
 * 		to the dsAjax.js would be completely transparent.
 **/

export class DsoRemote<E extends BaseEntity> implements Dso<E>{
	private _type: string;

	constructor(type: string) {
		this._type = type;
	}

	create(entity: object): Promise<E> {
		return post(`api/crud/${this._type}`, { data: entity }).then((result) => {
			const entity = result.data;
			hub("dataHub").pub(this._type, "create", entity);
			return entity as E;
		});
	}

	list(queryOptions?: QueryOptions): Promise<E[]> {

		const data = (queryOptions) ? { queryOptions } : null;

		return get(`api/crud/${this._type}`, data).then((response) => {
			return response.data as E[];
		});
	};

	remove(id: number): Promise<boolean> {
		return delet(`api/crud/${this._type}/${id}`).then((result) => {
			hub("dataHub").pub(this._type, "delete", id);
			return result.data;
		});
	};

	update(id: number, data: object): Promise<E> {
		return patch(`api/crud/${this._type}/${id}`, { data: data }).then((result) => {
			var entity = result.data as E;
			hub("dataHub").pub(this._type, "update", entity);
			return entity;
		});
	}


	get(id: number): Promise<E> {
		return get(`api/crud/${this._type}/${id}`).then((result) => {
			var entity = result.data as E;
			return entity;
		});
	};

	// NOTE: for now, we use the list to not create another crud/rest API to conform to the spec, but we might change that later.
	first(opts?: QueryOptions): Promise<E | null> {
		// for now, we use the 
		return this.list({ ...opts, ...{ limit: 1 } }).then((list) => {
			return (list.length > 0) ? list[0] as E : null;
		});
	};

}


