/**
 * module is a container for multiple {Directive}s
 */
var config = require('./config.js'),
    Directive = require('./directive.js'),
    Q = require('q'),
    Promise = require('es6-promise').Promise,
    directiveToFiles = require('./directive_to_files.js'),
    AVAILABLE_DIRECTIVE_TYPES = [
        'require_self',
        'require_lib',
        'require_tree',
        'require_directory',
        'require',
        'exclude',
        'reference'
    ],
    DIRECTIVE_PATTERN = new RegExp("\\/\\/\\s*=\\s*(" + AVAILABLE_DIRECTIVE_TYPES.join('|') + ")(.*)$", "gm");

/**
 * @param file {Object} {path: '', content: ''...}
 */
function Directives(file) {
    this.path = file.path;
    this.directives = this._extract(file.content);
}

Directives.prototype = {
    /**
     * @return {Q.promise} resolves with list of files to require
     */
    filesToRequire: function() {
        var _this = this,
            deferred = Q.defer(),
            filesPaths = [],
            promises = this.directives.map(function(directive) {
                return directive.filesToRequire();
            });
        Q.all(promises).then(function(fileLists) {
            var files = [];
            fileLists.forEach(function(list) {
                files = files.concat(list);
            });
            deferred.resolve(files);
        }).fail(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    },
    /**
     * get asset lists for all references (only for reference
     * directive) TODO: move it out and separate logic for diffrent
     * directives.
     */
    getReferences: function() {
        console.log('aaa');
        var refs = this._getDirectivesByType('reference');
        return new Promise(function(resolve, reject) {
            resolve(refs);
        });
    },
    /**
     * @param type {String}
     * return directives of given type
     */
    _getDirectivesByType: function(type) {
        return this.directives.filter(function(directive) {
            return directive.type === type;
        });
    },
    /**
     * @return {Array} array of {Directive}
     */
    _extract: function(content) {
        var match, fileNames = [], _this = this;
        while (match = DIRECTIVE_PATTERN.exec(content)) {
            var directive = match[1],
                args = match[2],
                result = [directive];
            args && (result = result.concat(args.trim().split(/\s+/)));
            result = new Directive(_this.path, result);
            fileNames.push(result);
        }
        return fileNames;
    }
};

module.exports = Directives;
