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

describe('Testing KVP', function () {
	var k = kvp(o);
	describe('methods', function () {
		it('should have a query method', function () {
			assert(typeof k.query === 'function');
		});
		it('should have a select method', function () {
			assert(typeof k.select === 'function');
		});
		it('should have a replace method', function () {
			assert(typeof k.replace === 'function');
		});
		it('should have a remove method', function () {
			assert(typeof k.remove === 'function');
		});
	});

	describe('query tests', function () {
		it('should return value 100', function () {
			var res = k.query(function (n) {
					if (n.key === 'a') {
						return true;
					}
			});
			assert(res === 100);
		});
		it('should return changed value', function () {
			res = k.query(function (node) {
				if (node.key === 'c') {
					this.replace(node.pointer, 'doggy');
					return true;
				}
			});
			assert(res === 'doggy');
		})
	});

	describe('select tests', function () {
		it('should return node value "YY"', function () {
			var res = k.select('/aa/aaa/y');
			assert(res === 'YY');
		});
		it('should return node value 5', function () {
			var res = k.select('/d/4');
			assert(res === 5);
		});
	});
})

