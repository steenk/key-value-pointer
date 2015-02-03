/* key-value-pointer v0.1.0, (c) 2015 Steen Klingberg. License: MIT */

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
			idx = {};
		if (typeof obj === 'string') {
			obj = JSON.parse(obj);
		}
		if (typeof obj === 'object') {
			f.collection = [obj];
		} else {
			console.error(new Error('Only objects are allowed.'))
		}
		function traverse (collection, cb) {
			var x, i, done, target, pointer, list = [];
			for (i=0; i<collection.length; i++) {
				target = collection[i];
				for (x in target) {
					pointer = target._xvq_pointer || '';
					var n = Object.create(null);
					n.node = target;
					n.key = x;
					idx[pointer + '/' + x] = n;
					done = cb.call(f, {
							key: x,
							value: target[x],
							pointer: pointer + '/' + x
						});
					if (done) {
						if (typeof target[x] === 'object') {
							delete target[x]._xvq_pointer;
						}
						return target[x];
					} else if (typeof target[x] === 'object') {
						target[x]._xvq_pointer = pointer + '/' +x;
						list.push(target[x]);
					}
				}
			}
			return traverse(list, cb);
		}

		f.query = function (cb) {
			return traverse(this.collection, cb);
		}

		f.select = function (pointer) {
			if (idx[pointer]) {
				return idx[pointer].node[idx[pointer].key];
			} else {
				return select(this.collection[0], pointer);
			}
		}

		f.replace = function (pointer, value) {
			if (idx[pointer]) {
				idx[pointer].node[idx[pointer].key] = value;
			} else {
				var sel = pointer.split('/'),
					key = sel.pop();
				select(this.collection[0], sel)[key] = value;
			}
		}

		f.remove = function (pointer) {
			if (idx[pointer]) {
				delete idx[pointer].node[idx[pointer].key];
			} else {
				var sel = pointer.split('/'),
					key = sel.pop();
				delete select(this.collection[0], sel)[key];
			}
		}

		return f;
	}
}))

