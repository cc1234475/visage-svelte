const path = require('path');
const { pathToFileURL } = require('url');
const pkg = require('./package.json');

const distURLBase = `https://raw.githubusercontent.com/cc1234475/visage/main/dist/`;
const packageName = pkg.name;

const production = !process.env.ROLLUP_WATCH;
const baseUrl = !production	? path.join(__dirname, 'dist') : distURLBase;

let meta = {
    "name": production ? packageName : packageName + ' -> dev',
    "version": pkg.version,
    "description": pkg.description,
	"homepage": pkg.homepage,
	"author": pkg.author,
    "namespace": "https://github.com/cc1234475",
    "resource": {
		css: pathToFileURL(path.join(baseUrl, 'bundle.css'))
	},
    "match": [
        "http://localhost:9999/*"
    ],
    "grant": [],
    "connect": [
        "hf.space",
        "localhost",
    ],
    "run-at": "document-idle"
}

if(!production){
	meta.require = [
        pathToFileURL(path.join(baseUrl, 'visage.js'))
    ];
}

// meta.require = [...meta.require]

if(production) {
	meta.downloadURL = pathToFileURL(path.join(baseUrl, 'visage.js'));
	meta.updateURL = pathToFileURL(path.join(baseUrl, 'visage.js'));
}

module.exports = meta;
