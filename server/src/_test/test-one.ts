import * as mockery from "mockery";

import { foo2 } from '../api/foo2';
import { foo } from '../foo';

describe('test-one', function () {

	it('foo', async function () {
		foo();
	});

	it('foo2', async function () {
		foo2();
	});

});

