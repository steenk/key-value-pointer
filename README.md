# Key-Value-Pointer

The KVP library is for query and handle JSON and JavaScript objects. The purpose is to use simple methods that feels very natural for a JavaScript programmer, instead of using some kind of query language that tries to imitate CSS and XML querying. Inspired by the __map__ method in arrays where a callback is applied to every item, the __query__ method here will evaluate every item with a callback. When the the callback returns a __true__ value, it all stops.

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
}
```

The __query__ method is a way to traverse all properties inside a JavaScript object, level by level, and apply the callback on each of these properties. Inside the callback all the __kvp__ methods can be accessible with the __this__ keyword, so a lot of thing can be done.

It is also possible to make the __query__ method start somewhere inside the object, instead of traverse all levels, by passing a JSON Pointer before the callback. Here is an example of an object with a list of values, and a property saying what should be the max value in the list. Our query will start in the list property, but can access the whole object inside the callback, and in this case change all values exceeding the max value.

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

The __insert__ method is technically the same as the __replace__ method, but is there for semantic reasons. It is not supposed to replace anything. 

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

## Installation

In Node.js:

```sh
npm install key-value-pointer
```

In the browser with an AMD loader:

```js
require(['kvp'], function (kvp) {
	// ...
})
```

In the browser without a module loader:

```js
<script src="kvp.js"></script>
<script>
  var kvp = window.keyValuePointer;
  // ...
</script>
```

## CouchDB and Cloudant

This library is small enough to be used in design documents in CouchDB and Cloudant. An example of a design document is <a href="https://raw.githubusercontent.com/steenk/td-patch/master/design_default.json" target="_blank">design_document.json</a>. With _kvp_ the documents can be analysed better and advanced indexes can be created. Notice the way _require_ is used when importing the library in the function, `var kvp = require("views/lib/kvp").kvp;`.

## Select Many

There is no method for a query with many results, because less is more in libraries like this. It doesn't mean that you can't do it, but you have to make your own function that fit your special need. Here is an example of how you can find all nodes in a JSON structure with a certain key name.

```js
function queryAll (json, name)	{
	var list = [];
	kvp(obj).query(function (node) {
			if (node.key === name) {
				list.push(node.value);
			}
		}
	)
	return list;
}

var all_zip_codes = queryAll(json_doc, 'zip'));
```

In the callback you have the _key_, the _value_, and the position in the document in form of a JSON Pointer string for each node in the document. You can do all kinds of calculations on these. If the node is an object, you can actually change it directly, since _node.value_ is a reference to the original object (unless it is a JSON string). Inside the callback function, you can also use the build in methods _select_, _replace_, and _remove_ on the original object calling them with "this". So you can copy and move parts of the document to other places in the document.

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

Another example. Here we want an index of all nodes directly under all objects with the key name "properties", and later use this index to add a propery in the original object.

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

If you have an object that is many levels deep, and you want to limit how deep you will search. This is how it is done, because the query traverse the object level by level.

```js
kvp(obj).query(function (node) {
	if (node.pointer.split('/').length < 3) {
		// do your stuff
	} else {
		return true;
	}
});
```

	

