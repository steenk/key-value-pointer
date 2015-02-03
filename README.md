# JSON Key-Value-Pointer

The KVP library is for query and handling JSON and JavaScript objects. The purpose is to use simple methods that feels very natural for a JavaScript programmer, instead of using some kind of query language that tries to imitate CSS and XML querying. Inspired by the __map__ method in arrays where a callback is applied to every item, the __query__ method here will evaluate every item with a callback. When the the callback returns a __true__ value, it all stops.

Start by wrapping your JavaScript object, or JSON string with the __kvp__ function. The resulting object has a few methods you can use for easy handling of your object.

## query

The __query__ method takes a callback and stop searching when the callback returns __true__. The parameter passed to the callback is a JavaScript object with the properties _key_, _value_, and _pointer_, where _key_ is a string with the name of the node, _value_ is its value of any kind, and pointer is the JSON Pointer string for the node. By evaluting these properties, the callback can decide to stop the search by returning a true value. The return value of the _query_ method is the value of the hit.

```js
// "obj" is a JavaScript object or a JSON structure
var res = kvq(obj).query(function (node) {
	// the node parameter is an object with the properties "key", "value", and "pointer"
	if (typeof node.value === 'string' && node.value.match(/ur/)) {
		// if it is a hit, return true
		return true;
	}
}
```

## select

When a JSON Pointer is known, its value can immedietly be selected by the __select__ method. Pass the pointer as a parameter.

```js
// the fifth item in the array "d"
var res = kvp(o).select('/d/4');

// push an item to the array "bar"
kvp(o).select('/foo/bar').push(999);
// same as
o['foo']['bar'].push(999);
```

## replace

To replace a value in the object or JSON passed to __kvm__, use the method __replace__. It takes two parameters, the JSON Pointer and the new value. It can be used together with the __query__ method, to find where to replace the value.

```js
kvp(obj).query(function (node) {
		if (node.key === 'language') {
			this.replace(node.pointer, 'JavaScript');
			return true;
		}
});
// obj is modified
```
## remove

To remove a node when the JSON Pointer is known, use the __remove__ method.

```js
kvp(obj).remove('/a/b/c');
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

