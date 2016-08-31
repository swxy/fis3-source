/**
 * 简化版的 liftoff（地址:https://github.com/js-cli/js-liftoff）
 *
 * 配置:
 * {
    name: 'testLiftoff',
    configName: 'liftoff-conf',
    extensions: {
        '.js': null,
        '.json': null
    }
    }
 *  输出:
 *  {
            cwd: xxxx,
            configNameSearch: [xxx],
            configPath: xxx,
            configBase: xxx
     }
 */

const fs = require('fs');
const util = require('util');
const path = require('path');
const events = require('events');

class LiftOffTest extends events.EventEmitter {
    constructor (opts) {
        super();
        this.parseOptions(opts)
    }
    launch (opts, fn) {
        if (typeof fn !== 'function') {
            throw new Error('You must provide a callback function');
        }
        fn.call(this, this.buildEnvironment(opts));
    }
    buildEnvironment (opts = {}) {
        let searchPaths = this.opts.searchPaths.slice();
        let cwd = this.findCwd(opts);
        if (opts.cwd) {
            searchPaths = [cwd];
        }
        else {
            searchPaths.unshift(cwd);
        }

        let configNameSearch = this.buildConfigName({
            configName: this.opts.configName,
            extensions: Object.keys(this.opts.extensions)
        });

        let configPath = this.findConfig({
            configNameSearch: configNameSearch,
            searchPaths: searchPaths,
            configPath: opts.configPath
        });

        let configBase;
        if (configPath) {
            configBase = path.dirname(configPath);
            if (!opts.cwd) {
                cwd = configBase;
            }
            if (fs.lstatSync(configPath).isSymbolicLink()) {
                configPath = fs.realpathSync(configPath);
            }
        }

        return {
            cwd: cwd,
            configNameSearch: configNameSearch,
            configPath: configPath,
            configBase: configBase
        }
    }

    // util

    // parse
    parseOptions (opts={}) {
        let defaultOpts = {
            extensions: {
                '.js': null,
                '.json': null
            },
            searchPaths: []
        };
        if (opts.name) {
            opts.configName = opts.configName || opts.name + 'file';
        }
        if (!opts.configName) throw new Error('You must specify a configName');

        this.opts = Object.assign(defaultOpts, opts);
    }
    // find cwd
    findCwd (opts = {}) {
        let cwd = opts.cwd;
        let configPath = opts.configPath;
        if (typeof configPath === 'string' && !cwd) {
            return path.dirname(path.resolve(configPath));
        }
        if (typeof cwd === 'string') {
            return path.resolve(cwd);
        }
        return process.cwd();
    }
    // build config name
    buildConfigName (opts = {}) {
        let configName = opts.configName;
        let extensions = opts.extensions;
        if (!configName) {
            throw new Error('Please specify a configName');
        }
        if (configName instanceof RegExp) {
            return [configName];
        }
        if (!Array.isArray(extensions)) {
            throw new Error('Please provide an array of valid extensions');
        }
        return extensions.map((ext) => {
            return configName + ext;
        });
    }
    findConfig (opts = {}) {
        let configNameSearch = opts.configNameSearch;
        let configPath = opts.configPath;
        let searchPaths = opts.searchPaths;
        if (!configPath) {
            if (!Array.isArray(searchPaths)) {
                throw new Error('Please provide an array of paths to search for config in.');
            }
            if (!configNameSearch) {
                throw new Error('Please provide a configNameSearch');
            }
            configPath = this.findFile(configNameSearch, searchPaths);
        }
        if (configPath) {
            return path.resolve(configPath);
        }
        return null;
    }
    findFile (names, searchPaths) {
        for (let searchPath of searchPaths) {
            try {
                for (let name of names) {
                    let findPath = searchPath + path.sep + name;
                    fs.statSync(findPath);
                    return findPath;
                }
            }
            catch (e) {
                // not find;
            }
        }
        return null;
    }
}

module.exports = LiftOffTest;