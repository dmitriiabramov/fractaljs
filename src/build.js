var assetTree = require('./asset_tree.js'),
    AssetNode = require('./asset_node.js'),
    preprocessors = require('./preprocessors.js'),
    path = require('path'),
    config = require('./config.js'),
    Promise = require('es6-promise').Promise,
    Q = require('q');


/**
 * Gets flat list of {AssetNode}s
 * @param filePath {String}
 * @return {Promise} resolved with flattened asset tree
 */
function makeNodeList(filePath) {
    var assetNode = new AssetNode({
        path: filePath
    });
    return new Promise(function(resolve, reject) {
        assetTree.makeTree(assetNode).then(function(assetNode) {
            resolve(_flattenAssetTree(assetNode));
        }).fail(reject);
    });
}

/**
 * Fetch and compile single asset
 *
 * @param filePath {String}
 * @param wrap {Boolean} whether to wrap asset in module
 */
function makeSingleNode(filePath, wrap) {
    return new Promise(function(resolve, reject) {
        var assetNode = new AssetNode({
            path: filePath,
            wrap: wrap
        });
        assetNode.fetchContent().then(function(content) {
            assetNode.content = content;
            preprocessors.preprocess(assetNode);
            resolve(assetNode);
        }).
        catch (reject);
    });
}

/**
 * @param {String} filePath of file to build
 * @return {Promise} resolves with complete source of all files in
 * bundle, compiled and processed
 */
function makeBundle(filePath) {
    var assetNode = new AssetNode({
        path: filePath
    });
    return new Promise(function(resolve, reject) {
        console.log(assetTree.makeTree(assetNode).then);
        assetTree.makeTree(assetNode).then(function(assetNode) {
            var assetList = _flattenAssetTree(assetNode);
            assetList.forEach(preprocessors.preprocess);
            var bundleSrc = assetList.map(function(assetNode) {
                return assetNode.content;
            }).join("\n");
            var refs = getAllReferences(assetList).then(function() {
                resolve(JSON.stringify(refs) + "\n" + bundleSrc);
            }).catch(reject);
        }).fail(reject);
    });
}

function getAllReferences(assetList) {
    console.log('ttt');
    var promises = assetList.map(function(assetNode) {
        return assetNode.directives.getReferences();
    });
    return Promise.all(promises);
}

/**
 * Flatten the node structure.
 * TODO: done this way because in future there will be directives like `exclude ./file/path.js`
 * and first, we'll need complete tree with files, their directives and content, and then
 * we'll cut off excluded branches.
 *
 * @param assetNode {AssetNode}
 * @param [_list] {Array} recursivelly pass and modify
 */
function _flattenAssetTree(assetNode, _list) {
    _list = (_list || []);
    _list.push(assetNode);
    assetNode.children.forEach(function(child) {
        _flattenAssetTree(child, _list);
    });
    return _list;
}

module.exports.makeNodeList = makeNodeList;
module.exports.makeSingleNode = makeSingleNode;
module.exports.makeBundle = makeBundle;
