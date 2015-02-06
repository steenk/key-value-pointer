/* key-value-pointer v0.2.5, (c) 2015 Steen Klingberg. License: MIT */

(function (glob, f) {
    if (typeof define === 'function' && define.amd) {
        define(f);
    } else if (typeof module !== 'undefined') {
        module.exports = f();
    } else {
        glob.keyValuePointer = f();
    }
}(this, function () {

	/*
     * Implementation of JSON Pointer.
     */
    function select (obj, sel) {
        var s,
            r,
            done = false;
        if (typeof obj === 'string') {
            obj = JSON.parse(obj);
        }
        if (typeof obj !== 'object') {
            return;
        }
        if (typeof sel === 'string') {
            s = sel.split('/');
        } else if (Array.isArray(sel)) {
            s = sel;
        } else {
            return;
        }
        s.forEach(function (key) {
            if (done) return;
            key = key.replace('~1','/').replace('~0','~');
            if (key === '') {
                r = obj;
            } else {
                if (typeof r[key] === 'undefined') {
                    done = true;
                    r = undefined;
                } else {
                    r = r[key];
                }
            }
        })
        return r;
    }

	return function (obj) {
		var f = function () {},
			idx = {'0/0':''};
		if (typeof obj === 'string') {
			obj = JSON.parse(obj);
		}
		if (typeof obj === 'object' && obj !== null) {
			f.collection = [obj];
		} else {
			console.error(new Error('Only objects are allowed.'));
			f.collection = [undefined];
		}
		function traverse (collection, cb, level) {
			var x, i, done, target, list = [];
			for (i=0; i<collection.length; i++) {
				target = collection[i];
				for (x in target) {
					var pos = level + '/' + i;
					done = cb.call(f, {
							key: x,
							value: target[x],
							pointer: idx[pos] + '/' + x
						});
					if (done) {
						return target[x];
					} else if (typeof target[x] === 'object' && target[x] !== null) {
						idx[(level+1) + '/' + list.length] = idx[pos] + '/' + x;
						list.push(target[x]);
					}
				}
			}
			if (list.length > 0) {
				return traverse(list, cb, level + 1);
			}
		}

		f.query = function (pointer, cb) {
			if (typeof pointer === 'function') {
				cb = pointer;
				return traverse(this.collection[0], cb, 0);
			} else {
				var s = select(this.collection[0], pointer);
				if (typeof s === 'object') {
					idx['0/0'] = pointer;
					return traverse([s], cb, 0);
				}
			}
		}

		f.select = function (pointer) {
			return select(this.collection[0], pointer);
		}

		f.replace = function (pointer, value) {
			var sel = pointer.split('/'),
				key = sel.pop(),
				par = select(this.collection[0], sel);
			if (typeof par === 'object') {
				select(this.collection[0], sel)[key] = value;
			}
		}

		f.remove = function (pointer) {
			var sel = pointer.split('/'),
				key = sel.pop(),
				par = select(this.collection[0], sel);
			if (typeof par === 'object' && par[key]) {
				delete par[key];
			}
		}

		f.insert = f.replace;

		f.getObject = function () {
			return this.collection[0];
		}

		f.getJSON = function () {
			return JSON.stringify(this.collection[0]);
		}

		return f;
	}
}))

