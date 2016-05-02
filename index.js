'use strict';

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var git = require('gulp-git');

function compareGitHistory(stream, cb, sourceFile, fileToCompare) {
        fs.readFile('./last_git_sha', function (err, lastGitShaData) {
                if (err) {
                        if (err.code !== 'ENOENT') {
                                stream.emit('error', new gutil.PluginError('gulp-changed', err, {
                                        fileName: sourceFile.path
                                }));
                        }
                        cb();
                } else {
                        var gitCommand = 'diff-tree -r --name-only --no-commit-id ' + lastGitShaData.toString().trim() + ' HEAD';
                        git.exec({ args: gitCommand }, function (err, stdout) {
                                if (err) {
                                        stream.emit('error', new gutil.PluginError('gulp-changed', err, {
                                                fileName: sourceFile.path
                                        }));
                                } else {
                                        if (fileToCompare && fileToCompare.toLowerCase() === 'stream') {
                                                var relativePath = sourceFile.path.replace(__dirname, '').replace('\\', '').replace(/\\/g, '/').toLowerCase();
                                                if (stdout.toLowerCase().indexOf(relativePath) !== -1) {
                                                        stream.push(sourceFile);
                                                }
                                        } else {
                                                if(stdout.toLowerCase().indexOf(fileToCompare.toLowerCase()) !== -1) {
                                                        stream.push(sourceFile);
                                                }
                                        }
                                }
                                cb();

                        });
                }
                
        });
}

module.exports = function(dest, opts) {
    opts = opts || {};
    opts.cwd = opts.cwd || process.cwd();
    opts.hasChanged = opts.hasChanged || compareGitHistory;
    
    return through.obj(function(file, enc, cb) {
       opts.hasChanged(this, cb, file, dest); 
    });
};