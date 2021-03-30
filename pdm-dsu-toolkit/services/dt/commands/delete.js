/**
 * @module Commands
 * @memberOf dt
 */


/**
 */
const Command = require('./Command');

/**
 * Deletes everything in the specified path of the DSU
 *
 * @class DeleteCommand
 */
class DeleteCommand extends Command {
    constructor() {
        super(undefined, false);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback){
        callback(undefined, command[0]);
    }

    /**
     * @param {string} arg
     * @param {Archive} bar
     * @param {object} [options]
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {ignoreMounts: false};
        console.log("Deleting " + arg);
        bar.delete(arg, options, err => err
            ? this._err(`Could not delete path '${arg}'`, err, callback)
            : callback(undefined, bar));
    }

    /**
     * @return the command name
     */
    getName(){
        return 'delete';
    }
}

module.exports = DeleteCommand;