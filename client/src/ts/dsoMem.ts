import { hub } from 'mvdom';
import { Dso, BaseEntity } from './ds';
import { QueryOptions } from 'common/query-options';
import { entityStore } from 'common/mem-store';

/**
 * InMemory (browser) implementation of the DataService ("ds"). 
 * 
 * - Use this during initial development or proof of concepts that cannot have server persistence.
 * 
 * - All APIs respect the "ds" async contract (return Promise) so that changing 
 * 		to the dsAjax.js would be completely transparent.
 **/

export class DsoMem<E extends BaseEntity> implements Dso<E>{
	private _type: string;

	constructor(type: string) {
		this._type = type;
	}

	create(entity: E): Promise<E> {
		return entityStore.create(this._type, entity).then((createdEntity) => {
			// we publish the dataservice event
			hub('dataHub').pub(this._type, 'create', createdEntity);
			return createdEntity as E;
		});
	}

	update(id: number, entity: E): Promise<E> {
		return entityStore.update(this._type, id, entity).then((updatedEntity) => {
			hub('dataHub').pub(this._type, 'update', updatedEntity);

			return updatedEntity as E;
		});
	}

	get(id: number): Promise<E> {
		return entityStore.get(this._type, id) as Promise<E>;
	};

	list(opts: QueryOptions): Promise<E[]> {
		return entityStore.list(this._type, opts) as Promise<E[]>;
	};

	first(opts: QueryOptions): Promise<E | null> {
		return entityStore.first(this._type, opts) as Promise<E | null>;
	};

	remove(id: number): Promise<boolean> {
		return entityStore.remove(this._type, id).then((result) => {
			hub("dataHub").pub(this._type, "remove", id);
			return result;
		})
	};
}


