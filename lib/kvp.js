/* key-value-pointer v0.3.0, (c) 2015 Steen Klingberg. License: MIT */

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
     * @method select
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

    /**
     * Constructor for the kvp object.
     *
     * @param {Object} obj A JavaScript object or a JSON string.
     * @return {Object} The __kvp__ object with methods.
     * @main kvp
     */
    return function (obj) {
        var f = function () {},
            idx = {'0/0':''};
        if (typeof obj === 'string') {
            obj = JSON.parse(obj);
        }
        if (typeof obj === 'object' && obj !== null) {
            f.collection = [obj];
        } else {
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
            } else {
                return f.collection[0];
            }
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
            }
        }

        /**
         * Insert a node in the object.
         *
         * @method insert
         * @param {String} pointer a JSON Poinger string
         * @param value the value to insert
         */
        f.insert = f.replace;

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
        f.basename = function (pointer) {
            return pointer.substr(pointer.lastIndexOf('/') + 1);
        }

        /**
         * Extract the dirname from a pointer.
         *
         * @method dirname
         * @param {String} pointer a JSON Poinger string
         * @return {String} the dirname of the pointer
         */
        f.dirname = function (pointer) {
            return pointer.substr(0, pointer.lastIndexOf('/'));
        }

        return f;
    }
}))

