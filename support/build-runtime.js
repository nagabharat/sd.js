#!/usr/bin/env node
'use strict';

let fs = require('fs');
let _ = require('lodash');
let util = require('util');

const DRAW_WRAP =
      '<defs><style>\n' +
      '/* <![CDATA[ */\n' +
      '%s\n' +
      '/* ]]> */\n' +
      '</style></defs>\n';

const WRAPPER =
      "// Copyright 2017 Bobby Powers. All rights reserved.\n" +
      "// Use of this source code is governed by the MIT\n" +
      "// license that can be found in the LICENSE file.\n" +
      "\n" +
      "'use strict';\n" +
      "\n" +
      "/* tslint:disable: max-line-length */\n";

let requiredInputs = {
	'preamble': 'build-rt/runtime.js',
	'epilogue': 'build-rt/epilogue.js',
	'drawCSS': 'runtime/draw.css',
};

function buildBundle() {

	let content = _.mapValues(requiredInputs, f => fs.readFileSync(f).toString('utf8').trim());
	// 4096 is to leave room for the static content above, plus extra
	// variable declarations added below
	let bufLen = _.reduce(content, (sum, f) => sum + f.length, 4096);

	let bundle = Buffer.alloc(bufLen);
	let off = bundle.write(WRAPPER);

	for (let variable in content) {
		off += bundle.write('\nexport const ', off);
		off += bundle.write(variable, off);
		off += bundle.write(' = ', off);
		let value = content[variable];
		if (variable === 'drawCSS')
			value = util.format(DRAW_WRAP, content[variable]);

		value = JSON.stringify(value);
		off += bundle.write(value, off);
		off += bundle.write(';\n', off);
	}

	return bundle.toString('utf8', 0, off);
};


if (typeof require !== 'undefined' && require.main === module) {
	let contents = buildBundle();
	if (process.argv.length === 3)
		fs.writeFileSync(process.argv[2], contents);
	else
		console.log(contents);

}
