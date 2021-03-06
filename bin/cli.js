#!/usr/bin/env node

// fractaljs ./myBundle.js --output-dir ./public/js
var argv = require('minimist')(process.argv.slice(2)),
    inputPath = argv._[0],
    outputDir = argv['output-dir'],
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    config = require('../src/config.js'),
    build = require('../src/build.js');

config.assetPath = path.dirname(inputPath);

if (!path) throw new Error('File path should be specified');
if (!outputDir) throw new Error('Output dir path should be specified');

build.makeBundle(path.basename(inputPath)).then(function(output) {
    var outputPath = path.join(outputDir, path.basename(inputPath));

    mkdirp(path.dirname(outputPath), function(err) {
        if (err) {
            throw err;
        } else {
            fs.writeFile(outputPath, output, function(err) {
                if (err) {
                    throw err;
                }
                console.log('> ' + outputPath + ' compiled');
            });
        }
    });
}).catch(function(error) {
    console.error(error);
    throw(error);
});
