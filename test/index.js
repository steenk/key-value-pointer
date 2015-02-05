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
		it('should not crash, but return undefined', function () {
			var t = kvp();
			console.error('(should give error in test)');
			assert(typeof t.getObject() === 'undefined');
		})
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
			var res = k.query(function (node) {
				if (node.key === 'c') {
					this.replace(node.pointer, 'doggy');
					return true;
				}
			});
			assert(res === 'doggy');
		});
		it('should return changed value', function () {
			var res = k.query(function (node) {
				if (node.key === 'aaa') {
					node.value.y = 'YYY';
					return true;
				}
			});
			assert(o['aa']['aaa']['y'] === 'YYY');
		});
		it('should return undefined without error', function () {
			var res = k.query(function () {});
			assert(res === undefined);
		});
	});

	describe('select tests', function () {
		it('should return node value "ex"', function () {
			var res = k.select('/aa/aaa/x');
			assert(res === 'ex');
		});
		it('should return node value 5', function () {
			var res = k.select('/d/4');
			assert(res === 5);
		});
		it('should not crash when select from an undefined object', function () {
			var t = kvp();
			console.error('(should give error in test)');
			assert(typeof t.select('/') === 'undefined');
		});
		it('should not crash when select a non existent node', function () {
			assert(typeof k.select('/dummy') === 'undefined');
		});
		it('should not crash when no pointer in select', function () {
			assert(typeof k.select() === 'undefined');
		});
	});

	describe('replace tests', function () {
		it('should return false', function () {
			k.replace('/e', false);
			assert(!o['e']);
		});
		it('should return true', function () {
			k.replace('/e', !k.select('/e'));
			var res = k.select('/e');
			assert(res);
		});
		it('should insert', function () {
			var i = kvp({});
			i.insert('/foo', 'bar');
			assert(i.getJSON() === '{"foo":"bar"}');
		});
	});

	describe('remove tests', function () {
		it('should not crash when remove something undefined', function () {
			var res = k.remove('/dummy');
			assert(typeof res === 'undefined');
		})
	});

	describe('exports', function () {
		it('should return an object', function () {
			var obj = k.getObject();
			assert(typeof obj === 'object');
		});
		it('should return a string', function () {
			var str = k.getJSON();
			assert(typeof str === 'string');
		});
		it('should ', function () {
			var k = kvp({"foo": "bar"});
			assert(k.getJSON() === '{"foo":"bar"}');
		})
	})
})

