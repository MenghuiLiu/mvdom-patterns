import { hub } from 'mvdom';
import { Dso, BaseEntity } from './ds';
import { Criteria } from 'common/criteria';
import { get, post, patch, delet } from './ajax';
import { memEntityStore } from './mem-store';

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

	list(criteria?: Criteria): Promise<E[]> {
		return get(`api/crud/${this._type}`, criteria).then((response) => {
			return response.data as Promise<E[]>;
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

	first(criteria?: Criteria): Promise<E | null> {
		return this.list({ ...criteria, ...{ limit: 1 } }).then((list) => {
			return (list.length > 0) ? list[0] as E : null;
		});
	};

}


