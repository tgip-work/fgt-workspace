const operations = {
    DELETE: "delete",
    ADD_FOLDER: "addfolder",
    ADD_FILE: "addfile",
    MOUNT: "mount"
}

/**
 * Automates the Dossier Building process
 * Call via
 * <pre>
 *     builder.buildDossier(config, commands, callback)
 * </pre>
 * where the config is as follows (this config is generated by the buildDossier script in octopus given the proper commands):
 * <pre>
 *     {
 *          "seed": "./seed",
 *          "domain": "default",
 *     }
 * </pre>
 * For a Simple SSApp (with only mounting of cardinal/themes and creation of code folder) the commands would be like:
 * <pre>
 *     delete /
 *     addfolder code
 *     mount ../cardinal/seed /cardinal
 *     mount ../themes/'*'/seed /themes/'*'
 * </pre>
 * @param {Archive} [sourceDSU]: If provided, considers to the source DSU as the origin. Otherwise it's the fs
 */
const DossierBuilder = function(sourceDSU){
    let fs = undefined;
    if (sourceDSU === undefined)
        fs = require("fs");

    const openDSU = require("opendsu");
    const keyssi = openDSU.loadApi("keyssi");
    const resolver = openDSU.loadApi("resolver");

    /**
     * recursively executes the provided func with the dossier and each of the provided arguments
     * @param {Archive} dossier: The DSU instance
     * @param {function} func: function that accepts the dossier and one param as arguments
     * @param {any} arguments: a list of arguments to be consumed by the func param
     * @param {function} callback: callback function. The first argument must be err
     */
    let execute = function (dossier, func, arguments, callback) {
        let arg = arguments.pop();
        if (! arg)
            return callback();
        let options = typeof arg === 'object' && arg.options ? arg.options : undefined;
        func(dossier, arg, options, (err, result) => {
            if (err)
                return callback(err);

            if (arguments.length !== 0) {
                execute(dossier, func, arguments, callback);
            } else {
                callback(undefined, result);
            }
        });
    };

    let del = function (bar, path, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {ignoreMounts: false};
        console.log("Deleting " + path);
        bar.delete(path, options, err => callback(err, bar));
    };

    let addFolder = function (folder_root = "/") {
        return function (bar, arg, options, callback){
            if (typeof options === 'function'){
                callback = options;
                options = {}
            }
            options = options || {batch: false, encrypt: false};
            console.log("Adding Folder " + folder_root + arg)
            bar.addFolder(arg, folder_root, options, err => callback(err, bar));
        };
    };

    /**
     * Adds a file from disk to a dsu
     * @param {Archive} bar
     * @param {object} arg
     * @param {object} options
     * @param {function(err, Archive)} callback
     */
    let addFile = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false}
        console.log("Copying file " + arg.from + " to " + arg.to)

        bar.addFile(arg.from, arg.to, options, err => callback(err, bar));
    };

    /**
     * Mounts a keySSI at the provided path of the provided DSU
     * @param {Archive} bar
     * @param {object} arg accepts:
     * <pre>
     *  {
     *      mount_point: string,
     *      seed_path: string | keySSI
     *  }
     *  </pre>
     * where if seed_path is a string, it is try to read the file from the disk
     * @param {object} options
     * @param {function(err, Archive)} callback
     */
    let mount = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = undefined
        }

        if (typeof arg.seed_path === 'function')
            return bar.mount(arg.mount_point, arg.getIdentifier(), err => callback(err, bar));

        readFile(arg.seed_path, (err, data) => {
            if (err)
                return callback(err);
            let seed = data.toString();
            console.log("Mounting " + arg.seed_path + " with seed " + seed + " to " + arg.mount_point);
            bar.mount(arg.mount_point, seed, err => callback(err, bar));
        });
    };

    let mount_folders = function (bar, arg, callback) {
        let base_path = arg.seed_path.split("*");
        let names = fs.readdirSync(base_path[0]);
        let arguments = names.map(n => {
            return {
                "seed_path": arg.seed_path.replace("*", n),
                "mount_point": arg.mount_point.replace("*", n)
            };
        });
        execute(bar, mount, arguments, callback);
    };

    let evaluate_mount = function(bar, cmd, callback){
        let arguments = {
            "seed_path": cmd[0],
            "mount_point": cmd[1]
        };

        if (!arguments.seed_path.match(/[\\/]\*[\\/]/))
            mount(bar, arguments, callback);             // single mount
        else
            mount_folders(bar, arguments, callback);     // folder mount
    };

    /**
     * Creates a new DSU
     * @param {object} conf
     * @param {string[]} commands the build commands for this DSU
     * @param {KeySSI} [keySSI] if undefined created a new SeedSSI on the conf's domain
     * @param {function(err, Archive)} callback
     */
    let createDossier = function (conf, commands, keySSI, callback) {
        if (!callback){
            callback = keySSI;
            keySSI = undefined;
        }
        console.log("creating a new dossier...")
        resolver.createDSU(keySSI ? keySSI : keyssi.createTemplateSeedSSI(conf.domain), (err, bar) => {
            if (err)
                return callback(err);
            updateDossier(bar, conf, commands, callback);
        });
    };

    /**
     * Gets the proper function depending if its a const SSI or not
     * @param {boolean} [forConstSSI]: defaults to false
     * @return {createDossier|createDossierForExistingSSI}
     */
    let getDSUFactory = function(forConstSSI){
        if (forConstSSI)
            return createDossierForExistingSSI;
        return createDossier;
    }

    /**
     * Creates a new DSU
     * @param {object} conf
     * @param {string[]} commands the build commands for this DSU
     * @param {KeySSI} keySSI if undefined created a new SeedSSI on the conf's domain
     * @param {function(err, Archive)} callback
     */
    let createDossierForExistingSSI = function (conf, commands, keySSI, callback) {
        console.log("creating a new dossier...")
        resolver.createDSUForExistingSSI(keySSI, (err, bar) => {
            if (err)
                return callback(err);
            updateDossier(bar, conf, commands, callback);
        });
    };

    /**
     * Reads from file (if an archive is provided the the path in the archive, otherwise from disk)
     * @param {string} filePath the path of disk, or on the DSU if one is provided
     * @param {Archive} [bar]
     * @param {function(err, string|Buffer)} callback string if reading from disk, byte array if reading from dsu
     */
    let readFile = function (filePath, bar, callback) {
        let readFunc, asString;
        if (!callback) {
            callback = bar;
            asString = true;
            readFunc = fs.readFile;
        } else {
            readFunc = bar.readFile;
        }

        readFunc(filePath, (err, data) => {
            if (err)
                return callback(err)
            callback(undefined, asString ? data.toString() : data);
        });
    };

    /**
     * Writes to file (if an archive is provided the the path in the archive, otherwise from disk)
     * @param {string} filePath the path of disk, or on the DSU if one is provided
     * @param {string|Buffer} data
     * @param {Archive} [dsu]
     * @param {function(err)} callback
     */
    let writeFile = function (filePath, data, dsu, callback) {
        let writeFunc;
        if (!callback) {
            callback = dsu;
            writeFunc = fs.writeFile;
        } else {
            writeFunc = dsu.writeFile;
        }

        writeFunc(filePath, data, (err) => {
            if (err)
                return callback(`Could not write to ${filePath}: ${err}`);
            callback(undefined, data);
        });
    };

    /**
     *
     * @param seed_path
     * @param keySSI
     * @param callback
     */
    let storeKeySSI = function (seed_path, keySSI, callback) {
        if (sourceDSU)
            return callback(new Error("Not implemented when running from browser"));
        writeFile(seed_path, keySSI, callback);
    };

    /**
     * Executed a Command on the given DSU
     * @param {Archive} bar
     * @param {string|object} command. If a string, will be parsed into a command, otherwise should be:
     * <pre>
     *     {
     *         operation: "operationName"
     *         arguments: []
     *     }
     * </pre>
     * @param {function(err)} callback
     * @see {@link operations}
     */
    let runCommand = function(bar, command, callback){
        let cmd, operation;
        if (typeof command === 'string'){
            cmd = command.split(/\s+/);
            operation = cmd.shift().toLowerCase();
        } else {
            operation = command.operation;
        }

        switch (operation){
            case operations.DELETE:
                execute(bar, del, cmd, callback);
                break;
            case operations.ADD_FOLDER:
                execute(bar, addFolder(), cmd, callback);
                break;
            case operations.ADD_FILE:
                let arg = {
                    "from": cmd[0],
                    "to": cmd[1]
                }
                addFile(bar, arg, callback);
                break;
            case operations.MOUNT:
                evaluate_mount(bar, cmd, callback)
                break;
            default:
                return callback(new Error("Invalid operation requested: " + command));
        }
    };

    let saveDSU = function(bar, cfg, callback){
        bar.getKeySSIAsString((err, barKeySSI) => {
            if (err)
                return callback(err);
            if (!sourceDSU)
                storeKeySSI(cfg.seed, barKeySSI, callback);
            else
                callback(undefined, barKeySSI);
        });
    };

    /**
     * Runs a sequential series of operations on the provided DSU
     * @see operations
     *
     * @param {Archive} bar
     * @param {object} cfg
     * @param {string[]|object[]} commands
     * @param {function(err, KeySSI)} callback
     */
    let updateDossier = function(bar, cfg, commands, callback) {
        if (commands.length === 0)
            return saveDSU(bar, cfg, callback);
        let cmd = commands.shift();
        runCommand(bar, cmd, (err, updated_bar) => {
            if (err)
                return callback(err);
            updateDossier(updated_bar, cfg, commands, callback);
        });
    };

    /**
     * Builds s DSU according to it's building instructions
     * @param {object} cfg
     * @param {string[]|object[]} commands
     * @param {function(err, KeySSI)} callback
     */
    this.buildDossier = function(cfg, commands, callback){
        if (typeof commands === 'function'){
            callback = commands;
            commands = [];
        }

        let builder = function(keySSI){
            try {
                keySSI = keyssi.parse(keySSI);
            } catch (err) {
                console.log("Invalid keySSI");
                return createDossier(cfg, commands, callback);
            }

            if (keySSI.getDLDomain() !== cfg.domain) {
                console.log("Domain change detected.");
                return createDossier(cfg, commands, callback);
            }

            resolver.loadDSU(keySSI, (err, bar) => {
                if (err){
                    console.log("DSU not available. Creating a new DSU for", keySSI);
                    return resolver.createDSU(keySII, {useSSIAsIdentifier: true}, (err, bar)=>{
                        if(err)
                            return callback(err);
                        updateDossier(bar, cfg, commands, callback);
                    });
                }
                console.log("Dossier updating...");
                updateDossier(bar, cfg, commands, callback);
            });
        }

        if (sourceDSU)
            return builder(cfg.seed);

        readFile(cfg.seed, (err, content) => {
            if (err || content.length === 0)
                return createDossier(cfg, commands, callback);
            builder(content.toString());
        });
    };
};

module.exports = {
    DossierBuilder,
    operations
};
