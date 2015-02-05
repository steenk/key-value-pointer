var fs = require('fs'),
	pack = require('./package.json'),
	lic = '/* key-value-pointer v' + pack.version + ', (c) 2015 Steen Klingberg. License: MIT */',
	uglify = require('uglify-js')
	ukvp = uglify.minify('./lib/kvp.js', {mangle:true, compress:true}).code,
	str = ukvp.substr(ukvp.indexOf('this,') + 5).slice(0, -2),
	kvp_str = lic + 'exports.kvp=(' + str + '())';
 

// example of a design document for couchdb
var design = {
	_id: "_design/default",
  	language: "javascript",
    views: {
		    "test": {
				      "map": //->
function(doc){
	var kvp = require("views/lib/kvp").kvp;
	emit(doc._id, kvp(doc).select("/name"));
}.toString()
			},
			"lib": {
				"map": //->
function(doc){
	emit(doc._id, null);
}.toString(),
				"kvp": kvp_str
			}
	}
}

// ouput
fs.writeFile('kvp.js', lic + '\n' + ukvp);
var json = JSON.stringify(design, null, '  ');
fs.writeFile('design_default.json', json);

