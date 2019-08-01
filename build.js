var fs = require('fs'),
	pack = require('./package.json'),
	lic = '/* key-value-pointer v' + pack.version + ', (c) 2015, 2017, 2018 Steen Klingberg. License: MIT */',
	uglify = require('uglify-js');

function build (infile, outfile) {
  	code = fs.readFileSync(infile).toString();
	ukvp = uglify.minify(code, {mangle:true, compress:true}).code;
	fs.writeFileSync(outfile, lic + '\n' + ukvp);
	return ukvp;
} 
// example of a design document for couchdb

var ukvp = build('./lib/kvp.js', 'kvp.js');
str = ukvp.substr(ukvp.indexOf('this,') + 5).slice(0, -2),
	kvp_str = lic + 'exports.kvp=(' + str + '())';
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
build('./lib/kvp.mjs', 'kvp.mjs');
var json = JSON.stringify(design, null, '  ');
fs.writeFileSync('design_default.json', json);

