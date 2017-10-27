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
		return entityStore.create(this._type, entity).then((resultEntity) => {
			const createdEntity = resultEntity.data;
			// we publish the dataservice event
			hub('dataHub').pub(this._type, 'create', resultEntity.data);
			return createdEntity as E;
		});
	}

	update(id: number, entity: E): Promise<E> {
		return entityStore.update(this._type, id, entity).then((resultEntity) => {
			const updatedEntity = resultEntity.data;

			hub('dataHub').pub(this._type, 'update', updatedEntity);

			return updatedEntity as E;
		});
	}

	get(id: number): Promise<E> {
		return entityStore.get(this._type, id).then((resultEntity) => {
			return resultEntity.data as E;
		});
	};

	async list(opts: QueryOptions): Promise<E[]> {
		const resultList = await entityStore.list(this._type, opts);
		return resultList.data as E[];
	};


	async first(opts: QueryOptions): Promise<E | null> {
		const result = await entityStore.first(this._type, opts);
		if (result && result.data != null) {
			return result.data as E;
		} else {
			return null;
		}
	};

	remove(id: number): Promise<boolean> {
		return entityStore.remove(this._type, id).then((result) => {
			hub("dataHub").pub(this._type, "remove", id);
			return result;
		})
	};
}


