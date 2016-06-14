'use strict';

var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var git = require('gulp-git');

function compareGitHistory(stream, cb, sourceFile, filesToCompare) {
        fs.readFile('./last_git_sha', function (err, lastGitShaData) {
                if (err) {
                        if (err.code !== 'ENOENT') {
                                stream.emit('error', new gutil.PluginError('gulp-changed', err, {
                                        fileName: sourceFile.path
                                }));
                        } else {
                                stream.push(sourceFile);
                        } 
                        cb();
                } else {
                        var gitCommand = 'diff-tree -r --name-only --no-commit-id ' + lastGitShaData.toString().trim() + ' HEAD';
                        git.exec({ args: gitCommand, quiet: true }, function (err, stdout) {
                                if (err) {
                                        stream.emit('error', new gutil.PluginError('gulp-changed', err, {
                                                fileName: sourceFile.path
                                        }));
                                } else {
                                        if (!filesToCompare) {
                                                var relativePath = sourceFile.path.replace(__dirname, '').replace('\\', '').replace(/\\/g, '/').toLowerCase();
                                                if (stdout.toLowerCase().indexOf(relativePath) !== -1) {
                                                        stream.push(sourceFile);
                                                }
                                        } else {
                                                if (typeof filesToCompare === 'string' || filesToCompare instanceof String) {
                                                        filesToCompare = [filesToCompare];
                                                }
                                                for (var i = 0; i < filesToCompare.length; i++) {
                                                        var currentFile = filesToCompare[i];
                                                        if (stdout.toLowerCase().indexOf(currentFile.toLowerCase()) !== -1) {
                                                                stream.push(sourceFile);
                                                        }
                                                }
                                        }
                                }
                                cb();

                        });
                }

        });
}

module.exports = function (dest, opts) {
        opts = opts || {};
        opts.cwd = opts.cwd || process.cwd();
        opts.hasChanged = opts.hasChanged || compareGitHistory;

        return through.obj(function (file, enc, cb) {
                opts.hasChanged(this, cb, file, dest);
        });
};