/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');

/**
 * Creates a file with the provided content on the destination DSU
 * (similar to a touch command with added content)
 *
 * @class CreateFileCommand
 */
class CreateFileCommand extends Command{
    constructor() {
        super();
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback){
         callback(undefined,  {
             path: command.shift(),
             content: command.join(' ')
         });
    }

    /**
     * Writes a file
     * @param {object} arg the command argument
     * <pre>
     *     {
     *         path: (...),
     *         content: (..)
     *     }
     * </pre>
     * @param {Archive|fs} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        options = options || {encrypt: true, ignoreMounts: false};
        bar.writeFile(arg.path, arg.content, options, (err) => err
            ? this._err(`Could not create file at ${arg.path}`, err, callback)
            : callback(undefined, bar));
    }

    /**
     * @return the command name
     */
    getName(){
        return "createfile";
    }
}

module.exports = CreateFileCommand;