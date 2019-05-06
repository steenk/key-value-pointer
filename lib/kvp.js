/**
 * Handle JSON and JavaScript Objects.
 *
 * @module key-value-pointer
 */
(function (glob, f) {
    if (typeof define === 'function' && define.amd) {
        define(f);
    } else if (typeof module !== 'undefined') {
        module.exports = f();
    } else {
        glob.keyValuePointer = f();
    }
}(this, function () {

    /**
     * Internal implementation of JSON Pointer.
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
        r = obj;
        s.forEach(function (key) {
            if (done) return;
            key = key.replace('~1','/').replace('~0','~');
            if (key !== '') {
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

	function basename (pointer, suffix) {
    if (suffix) {
      var r = new RegExp(suffix.replace('.', '\.') + '$');
      pointer = pointer.replace(r, '');
    }
		return pointer.substr(pointer.lastIndexOf('/') + 1);
	}

	function dirname (pointer) {
		return pointer.substr(0, pointer.lastIndexOf('/'));
	}

    /**
     * Constructor for the kvp object.
     *
     * @param {Object} obj A JavaScript object or a JSON string.
     * @return {Object} The __kvp__ object with methods.
     * @main kvp
     */
    function kvp (obj) {
        var f = function () {},
            idx = {'0/0':''},
            res;
        if (typeof obj === 'string') {
            obj = JSON.parse(obj);
        }
        if (typeof obj === 'object' && obj !== null) {
            f.collection = [obj];
        } else {
            f.collection = [undefined];
        }
        function traverse (collection, cb, level, ack) {
            var x, i, done, target, list = [];
            for (i=0; i<collection.length; i++) {
                target = collection[i];
                for (x in target) {
                    var pos = level + '/' + i;
                    done = cb.call(f, {
                            key: x,
                            value: target[x],
                            pointer: idx[pos] + '/' + x,
                            level: level
                        });
                    if (done) {
                        if (ack) {
                            ack.insert(idx[pos] + '/' + x, target[x]);
                            done = false;
                        } else {
                            if (typeof done !== 'boolean') {
                                return done;
                            } else {
                                return target[x];
                            }
                        }
                    } else if (typeof target[x] === 'object' && target[x] !== null) {
                        idx[(level+1) + '/' + list.length] = idx[pos] + '/' + x;
                        list.push(target[x]);
                    }
                    if (f.done) break;
                }
            }
            if (list.length > 0) {
                return traverse(list, cb, level + 1, ack);
            } else if (ack) {
                return kvp(ack.collection[0]);
            } else {
                return f.collection[0];
            }
        }

        /**
         * Apply a callback to the JavaScript object.
         *
         * @param {function} cb callback
         */
        f.apply = function (cb) {
            cb.call(f);
            return this;
        }

        /**
         * The query method for traversing a JavaScript object.
         *
         * The callback gets a parameter with three properties: _key_, _value_, and _pointer_.
         *
         * @param {string} pointer optional json pointer
         * @param {function} cb callback
         * @method query
         */
        f.query = function (pointer, cb) {
            if (typeof pointer === 'function') {
                cb = pointer;
                return traverse(this.collection, cb, 0);
            } else {
                var s = select(this.collection[0], pointer);
                if (typeof s === 'object') {
                    idx['0/0'] = pointer;
                    return traverse([s], cb, 0);
                }
            }
        }

        /**
         * The filter method for traversing a JavaScript object and returning a filtered object.
         *
         * The callback gets a parameter with three properties: _key_, _value_, and _pointer_.
         *
         * @param {string} pointer optional json pointer
         * @param {function} cb callback
         * @method filter
         */
        f.filter = function (pointer, cb) {
            if (typeof pointer === 'function') {
                cb = pointer;
                return traverse(this.collection, cb, 0, kvp({}));
            } else {
                // if just a pointer and no callback, use a callback
                // that accepts everything
                if (typeof cb !== 'function') {
                    cb = function () {return true;};
                }
                var s = select(this.collection[0], pointer);
                if (typeof s === 'object') {
                    idx['0/0'] = pointer;
                    return traverse([s], cb, 0, kvp({}));
                }
            }
        }

        /**
         * Select anything i the object.
         *
         * @method select
         * @param {String} pointer a JSON Pointer string
         * @return {} the part of the object pointed at by the pointer
         */
        f.select = function (pointer) {
            return select(this.collection[0], pointer);
        }

        /**
         * Replace a node in the object.
         *
         * @method replace
         * @param {String} pointer a JSON Poinger string
         * @param value the value to insert
         */
        f.replace = function (pointer, value) {
            var sel = pointer.split('/'),
                key = sel.pop(),
                par = select(this.collection[0], sel);
            if (typeof par === 'object') {
                select(this.collection[0], sel)[key] = value;
                return true;
            } else {
                return false;
            }
        }

        /**
         * Remove a node from the object.
         *
         * @method remove
         * @param {String} pointer a JSON Poinger string
         */
        f.remove = function (pointer) {
            var sel = pointer.split('/'),
                key = sel.pop(),
                par = select(this.collection[0], sel);
            if (typeof par === 'object' && par[key]) {
                delete par[key];
                return true;
            } else {
                return false;
            }
        }

        /**
         * Insert a node in the object.
         *
         * @method insert
         * @param {String} pointer a JSON Poinger string
         * @param value the value to insert
         */
        f.insert = function (pointer, value) {
            var sel = pointer.split('/'),
                o,
                res = false,
                r = this.collection[0],
                a = [];
            sel.forEach(function (v, i) {
                a.push(v);
                o = select(obj, a);
                if (! o) {
                    if (i < sel.length - 1) {
                        if (/^\d+$/.test(sel[i+1])) {
                            r[v] = [];
                        } else {
                            r[v] = {};
                        }
                        r = r[v];
                    } else {
                        r[v] = value;
                        res = true;
                    }
                } else {
                    r = o;
                }
            });
            return res;
        }
        /**
         * Get the object after transformations.
         *
         * @method getObject
         */
        f.getObject = function () {
            return this.collection[0];
        }

        /**
         * Get the JSON string of the object after transformations.
         *
         * @method getJSON
         */
        f.getJSON = function () {
            return JSON.stringify(this.collection[0]);
        }

        /**
         * Extract the basename from a pointer.
         *
         * @method basename
         * @param {String} pointer a JSON Poinger string
         * @return {String} the basename of the pointer
         */
        f.basename = basename;

        /**
         * Extract the dirname from a pointer.
         *
         * @method dirname
         * @param {String} pointer a JSON Poinger string
         * @return {String} the dirname of the pointer
         */
        f.dirname = dirname;

        return f;
    }

	kvp.basename = basename;
	kvp.dirname = dirname;

	return kvp;
}))

