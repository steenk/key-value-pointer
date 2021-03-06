# Key-Value-Pointer

The KVP library is for query and handle JSON and JavaScript objects with a tree structure. The purpose is to use simple methods that feels very natural for a JavaScript programmer, instead of using some kind of query language that tries to imitate CSS and XML querying.

JavaScript arrays have built-in methods like __forEach__ and __map__, and simple property objects can be searched by a `for(x in obj) {...}`, but when the object structure gets deeper and more arbitrary, you need to make special solutions to go through the object. Key-Value-Pointer is a library that can help you with that. You simply make a callback function and pass it to the __query__ method. For each node, your callback gets called with a parameter with the three properties __key__, __value__, and __pointer__. With this information, and a few methods in this library, you can do all kinds of search and transformations in your JavaScript object.

Start by wrap your JavaScript object, or JSON string with the __kvp__ function. The resulting object has a few methods that you can use for easy handling of your object.

## query

The __query__ method takes a callback and stop searching when the callback returns __true__. The parameter passed to the callback is a JavaScript object with the properties _key_, _value_, and _pointer_, where _key_ is a string with the name of the node, _value_ is its value or reference, if it is an object, and _pointer_ is the [JSON Pointer](https://tools.ietf.org/html/rfc6901) string for the node. By evaluating these properties, the callback can decide to stop the search by returning a true value. The return value of the _query_ method is the value of the hit.

```js
// "obj" is a JavaScript object or a JSON structure
var res = kvp(obj).query(function (node) {
	// the node parameter is an object with the properties "key", "value", and "pointer"
	// {
	//   key: 'title',
	//   value: 'Semantic Version',
	//   pointer: '/definitions/semVer/title'
	// }
	if (typeof node.value === 'string' && node.value.match(/tic/)) {
		// if it is a hit, return true
		return true;
	}
});
```

The __query__ method is a way to traverse all properties inside a JavaScript object, level by level, and apply the callback on each of these properties. Inside the callback all the __kvp__ methods can be accessible with the __this__ keyword, so a lot of things can be done.

It is also possible to make the __query__ method start somewhere inside the object instead of traverse all levels, by passing a JSON Pointer before the callback. Here is an example of an object with a list of values, and a property saying what should be the max value in the list. Our query will start in the list property, but can access the whole object inside the callback, and in this case change all values exceeding the max value.

The result of a query is normally the value of the node where the query run is stopped, but by returning something else than __true__, the returned value can be changed.

```js
var points = {
	max: 10,
	list: [2, 5, 13, 8, 15, 3, 7]
}

kvp(points).query('/list', function (node) {
    if (node.value > this.select('/max')) {
        this.replace(node.pointer, this.select('/max'));
    }
});

// points === [2, 5, 10, 8, 10, 3, 7]
```

## select

When a JSON Pointer is known, its value can immediately be selected by the __select__ method. Pass the pointer as a parameter.

```js
// the fifth item in the array "d"
var res = kvp(o).select('/d/4');

// push an item to the array "bar"
kvp(o).select('/foo/bar').push(999);
// same as
o['foo']['bar'].push(999);
```

## replace

To replace a value in the object or JSON passed to __kvp__, use the method __replace__. It takes two parameters, the JSON Pointer and the new value. It can be used together with the __query__ method, to find where to replace the value.

```js
kvp(obj).query(function (node) {
		if (node.key === 'language') {
			this.replace(node.pointer, 'JavaScript');
			return true;
		}
});
// obj is modified
```
## insert

The __insert__ method inserts a value in the place the pointer points to. If the structure is not there the __insert__ method creates it. An insert is not supposed to replace anything. 

## remove

To remove a node when the JSON Pointer is known, use the __remove__ method.

```js
kvp(obj).remove('/a/b/c');
```
## getObject and getJSON

Two methods for getting the whole structure out of _kvp_.

```js
var k = kvp({"ok": true});
var obj = k.getObject();
var json = k.getJSON();
```

## dirname and basename

A JSON Pointer is like a path, and it can be seen as a concatenation of a directory and a name. To conveniently get these out of the pointer string, the two methods __dirname__ and __basename__ can be used. 

```js
var pointer = '/usr/var/log';
var dir = kvp.dirname(pointer);
// dir === '/usr/var'
var name = kvp.basename(pointer);
// name === 'log'
```

## apply

The __apply__ method is to prepare transisions of an object with a function and apply the function as a callback when needed. The __apply__ method is chainable, it returns a kvp wrapped object so any other method can be used on it.

```js
function lic () {
  this.insert('/copyright', {
    year: (new Date()).getFullYear(),
    name: 'Foo Bar',
    license: 'MIT'
  });
}

var json = kvp({}).apply(lic).getJSON();

console.log(json);
```

## filter

The __filter__ method traverse the whole object, just like the __query__ method, but instead of return the value when the callback returns __true__, it continues and include only parts of the object where the callback returns __true__. The return of the __filter__ method is a kvp wrapped result object, so any method can be chained after the __filter__ method. To stop filtering before the whole object is traversed, do a `this.done = true;` in the callback, since unlike __query__ the __true__ return in the callback will not stop the traverse. The __filter__ method can have an optional first argument in form of a pointer, to limit the traverse on only a part of the object `.filter('/cats', function (node) { ... })`. In case of a pointer argument, the callback can be omitted and whatever the pointer points to will be the filtered result.

```js
var obj = kvp({
  dogs: {
      sverre: false,
      tommy: false,
      solo: true,
      meja: true
   },
   cats: {
      ziggy: true,
      kompis: true,
      svinto: true,
      polarn: true
   }
});

var out1 = obj
  .filter(function (node) {
    if (node.key === 'ziggy') this.done = true;
    if (typeof node.value === 'boolean' && node.value) return true;
  });
  
console.log(out1.getObject());
// { dogs: { solo: true, meja: true }, cats: { ziggy: true } }

var out2 = out1.filter('/cats').getObject();

console.log(out2);
// { cats: { ziggy: true } }
```

## Installation

In Node.js:

```sh
npm install key-value-pointer
```

In the browser, download [kvp.js](https://raw.githubusercontent.com/steenk/key-value-pointer/master/kvp.js) and use it with an AMD loader:

```js
require(['kvp'], function (kvp) {
	// ...
})
```

Or in the browser without a module loader:

```js
<script src="kvp.js"></script>
<script>
  var kvp = window.keyValuePointer;
  // ...
</script>
```

## CouchDB and Cloudant

This library is small enough to be used in design documents in CouchDB and Cloudant. An example of a design document is <a href="https://github.com/steenk/key-value-pointer/blob/master/design_default.json" target="_blank">design_document.json</a>. With _kvp_ the documents can be analyzed better and advanced indexes can be created. Notice the way _require_ is used when importing the library in the function, `var kvp = require("views/lib/kvp").kvp;`.

## Select Many

There is no method for a query with many results, because less is more in libraries like this. It doesn't mean that you can't do it, but you have to make your own function that fit your special need. Here is an example of how you can find all nodes in a JSON structure with a certain key name.

```js
function queryAll (json, name)	{
	var list = [];
	kvp(json).query(function (node) {
			if (node.key === name) {
				list.push(node.value);
			}
		}
	)
	return list;
}

var all_zip_codes = queryAll(json_doc, 'zip'));
```

In the callback you have the _key_, the _value_, and the position in the document in form of a JSON Pointer string for each node in the document. You can do all kinds of calculations on these. If the node is an object, you can actually change it directly, since _node.value_ is a reference to the original object (unless it is a JSON string). Inside the callback function, you can also use the built-in methods like _select_, _replace_, and _remove_ on the original object by calling them with "this". So you can copy and move parts of the document to other places in the document.

```js
var k = kvp({"what": "foo"});
var res = k.query(function (node) {
		if (node.key === 'what') {
			this.replace(node.pointer, 'bar');
			return true;
		}
	});
// res === 'bar' and
// k.getObject() === {'what': 'bar'}
```

## Make an Index

Another example. Here we want an index of all nodes directly under all objects with the key name "properties", and later use this index to add a property in the original object.

```js
// run in Node.js
var kvp = require('key-value-pointer'),
    request = require('sync-request'),
    doc = JSON.parse(request('GET', 'https://steenk.github.io/schemas/bacon.json').getBody());

function indexProperties (obj)  {
    var idx = {};
    kvp(obj).query(function (node) {
            if (node.pointer.match(/properties\/[^\/]+$/)) {
                idx[node.key] = node.value;
            }
        }
    )
    return idx;
}

// before change
console.log('Before:', doc.properties.git);

// make an index of propertiy names with reference to their place
var props = indexProperties(doc)
console.log('Found names:', Object.keys(props));

// insert something with the index
if (props['git']) props['git'].type = 'string';

// see how the original object has changed
console.log('After:', doc.properties.git);
```

A JSON document is fetched from the Internet, and converted to a JavaScript object with _JSON.parse_. The function returns a list of keys and references to their position in the doc object. After a check that the name "git" exists, a property "type" is added in the doc.

## Prevent Deep Search

You have an object that is many levels deep, and you want to limit how deep your search will be. This is how it is done, because the query traverses the object level by level.

```js
kvp(obj).query(function (node) {
	if (node.level < 3) {
		// do your stuff
	} else {
		return true;
	}
});
```

## Replace References

Some documents use references to another places in the document. This function replace references with their real values.

```js
var refs = {
	a: {'$ref': 'a'},
	d: {
		b: {'$ref': 'b'},
		c: {'$ref': 'c'}
	},
	definitions: {
		a: 1000,
		b: 2000,
		c: 3000
	}
}

// pass a json makes it a copy
var doc = kvp(JSON.stringify(refs)).query(function (node) {
	if (node.key === '$ref') {
		var parent = this.dirname(node.pointer);
		var name = this.basename(parent);
		this.replace(parent, this.select('/definitions/' + name))
	}
});

// get the object and delete "definitions"
delete doc.definitions;


// doc === { a: 1000, d: { b: 2000, c: 3000 } }
```


