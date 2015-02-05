var kvp = require('../kvp'),
	assert = require('assert');

var o = {
	a: 100,
	aa: {
		aaa: {
			x: 'ex',
			y: 'YY'
		}
	},
	c: "billi",
	d: [1,2,3,4,5],
	e: true
}

describe('Testing KVP 2', function () {
	var k = kvp(o);
	describe('select tests', function () {
		it('should return undefined withour error', function () {
			var res = k.select('/a/b/c');
			assert(res === undefined);
		});
	});

	describe('wrong pointer tests', function () {
		it('should return undefined', function () {
			var res = k.remove('/a/b/c');
			assert(res === undefined);
		});
		it('should return error', function () {
			var res = k.remove('/aa/aaa/z');
			assert(res === undefined); 
		});
		it('should not crash', function () {
			var res = k.replace('/a/b/c');
			assert(res === undefined);
		});
	});
})
