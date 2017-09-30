import { hub } from 'mvdom';
import { Dso, BaseEntity } from './ds';
import { Criteria } from 'common/criteria';
import { memEntityStore } from './mem-store';

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
		return memEntityStore.create(this._type, entity).then((createdEntity) => {
			// we publish the dataservice event
			hub('dataHub').pub(this._type, 'create', createdEntity);
			return createdEntity as E;
		});
	}

	update(id: number, entity: E): Promise<E> {
		return memEntityStore.update(this._type, id, entity).then((updatedEntity) => {
			hub('dataHub').pub(this._type, 'update', updatedEntity);

			return updatedEntity as E;
		});
	}

	get(id: number): Promise<E> {
		return memEntityStore.get(this._type, id) as Promise<E>;
	};

	list(criteria: Criteria): Promise<E[]> {
		return memEntityStore.list(this._type, criteria) as Promise<E[]>;
	};

	first(criteria: Criteria): Promise<E | null> {
		return memEntityStore.first(this._type, criteria) as Promise<E | null>;
	};

	remove(id: number): Promise<boolean> {
		return memEntityStore.remove(this._type, id).then((result) => {
			hub("dataHub").pub(this._type, "remove", id);
			return result;
		})
	};
}


