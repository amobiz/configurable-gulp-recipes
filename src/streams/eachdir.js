/*jshint node: true */
/*global process*/
/**
 * References:
 * 
 * Generating a file per folder
 * https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
 */

/**
 * @config 針對本 task 的 configuration。
 * @tasks 傳入的子 tasks 為 configurableTask，是尚未綁定 config 的 task 形式。
 *  
 */
function eachdir(gulp, config, stream, tasks) {
    // lazy loading required modules.
    var fs = require('fs');
    var path = require('path');
    var each = require('./each');
    
    var ConfigurationError = require('../errors/configuration_error.js');
    
    var cwd, folders, values, inject;
    
    if (typeof config.src !== 'string') {
        throw ConfigurationError('eachdir', 'required configuration "src" not found');
    }
    
    cwd = process.cwd();
    folders = getFolders(config.src);
    if (folders.length === 0) {
        throw new ConfigurationError('eachdir', 'no sub folders found in ' + config.src);
    }
    
    values = folders.map(function(folder) {
        return {
            dir: folder,
            path: path.join(cwd, config.src, folder)
        };
    });
    
    inject = {
        values: values
    };
    
    return each(gulp, inject, stream, tasks);

    function getFolders(dir) {
        try {
            return fs.readdirSync(dir).filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
        }
        catch(ex) {
            return [];
        }
    }
}

eachdir.description = 'Performs actions on each sub folder of the specified folder';
eachdir.consumes = ['src'];
eachdir.produces = ['dir', 'path'];

module.exports = eachdir;