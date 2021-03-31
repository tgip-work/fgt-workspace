/**
 * @module dt
 */

/**
 * Enum of Accepted Key Types
 */
const KEY_TYPE = {
    CONST: "const",
    SEED: "seed"
}

const {_getByName} = require('./commands');
const {_getResolver, _getKeySSISpace} = require('./commands/utils');

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
 *
 * For a Simple SSApp (with only mounting of cardinal/themes and creation of code folder) the commands would be like:
 * <pre>
 *     delete /
 *     addfolder code
 *     mount ../cardinal/seed /cardinal
 *     mount ../themes/'*'/seed /themes/'*'
 * </pre>
 * @param {Archive} [sourceDSU] if provided will perform all OPERATIONS from the sourceDSU as source and not the fs
 */
const DossierBuilder = function(sourceDSU){
    /**
     * Creates a dsu (const or not) and mounts it to the specified path
     * @param bar
     * @param {KEY_TYPE} type
     * @param {string} domain
     * @param {string} path
     * @param {object} args:
     * <pre>
     *     {
     *         forKey: (key gen args)
     *         commands: [
     *             (commands to run on created dsu)
     *         ]
     *     }
     * </pre>
     * @param {function(err, keySSI)} callback
     */
    let createAndMount = function(bar, type, domain, path, args, callback){
        let keyGenFunc, dsuFactory;
        switch(type){
            case KEY_TYPE.CONST:
                keyGenFunc = keyssi.createArraySSI;
                dsuFactory = resolver.createDSUForExistingSSI;
                break;
            case KEY_TYPE.SEED:
                keyGenFunc = keyssi.buildTemplateSeedSSI;
                dsuFactory = resolver.createDSU;
                break;
            default:
                throw new Error("Invalid type");
        }

        let keySSI = keyGenFunc(domain, args.forKey);
        dsuFactory(keySSI, (err, dsu) => {
           if (err)
               return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not create dsu with keyssi ${keySSI}`, err));

           const mountFunc = function(bar, key, callback){
               console.log(`DSU created with key ${key}`);
               bar.mount(path, key, (err) => {
                   if (err)
                       return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not mount DSU`, err));
                   callback(undefined, bar);
               });
           }

           if (args.commands && args.commands.length > 0){
               const dossierBuilder = new DossierBuilder();
               dossierBuilder.buildDossier(dsu, args.commands, (err, key) => {
                   if (err)
                       return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not build Dossier`, err));
                   mountFunc(bar, key, callback);
               })
           } else {
               dsu.getKeySSIAsString((err, key) => {
                   if (err)
                       return callback(err);
                   mountFunc(bar, key, callback);
               });
           }
        });
    }

    let createDossier = function (conf, commands, callback) {
        console.log("creating a new dossier...")
        _getResolver().createDSU(_getKeySSISpace().createTemplateSeedSSI(conf.domain), (err, bar) => {
            if (err)
                return callback(err);
            updateDossier(bar, conf, commands, callback);
        });
    };

    /**
     * Writes to a file on the filesystem
     * @param filePath
     * @param data
     * @param callback
     */
    const writeFile = function(filePath, data, callback){
        new (_getByName('createfile'))().execute(`${filePath} ${data}`, callback);
    }

    /**
     * Reads a file from the filesystem
     * @param filePath
     * @param callback
     */
    const readFile = function(filePath, callback){
        new (_getByName('readfile'))().execute(filePath, callback);
    }

    //     function (filePath, data, callback) {
    //     if (sourceDSU)
    //         throw new Error("This method is not meant to be used here");
    //
    //     getFS().writeFile(filePath, data, (err) => {
    //         if (err)
    //             return callback(err);
    //         callback(undefined, data.toString());
    //     });
    // };

    /**
     * Stores the keySSI to the SEED file when no sourceDSU is provided
     * @param {string} seed_path the path to store in
     * @param {string} keySSI
     * @param {function(err, KeySSI)} callback
     */
    let storeKeySSI = function (seed_path, keySSI, callback) {
        writeFile(seed_path, keySSI, callback);
    };

    /**
     * Runs an operation
     * @param {Archive} bar
     * @param {string|string[]} command
     * @param {string[]} next the remaining commands to be executed
     * @param {function(err, Archive)} callback
     */
    let runCommand = function(bar, command, next, callback){
        let args = command.split(/\s+/);
        const cmdName = args.shift();
        const cmd = _getByName(cmdName);
        return cmd
            ? new (cmd)(this.source).execute(args, bar, next, callback)
            : callback(`Command not recognized: ${cmdName}`);
        //
        // switch (cmd.shift().toLowerCase()){
        //     case OPERATIONS.CREATE_AND_MOUNT:
        //         let type = cmd.shift();
        //         let domain = cmd.shift();
        //         let path = cmd.shift();
        //         let args = JSON.parse(cmd.join(' '));
        //         return createAndMount(bar, type, domain, path, args, callback);
        //     default:
        //         return callback("Invalid operation requested: " + command);
        // }
    };

    /**
     * Retrieves the KeysSSi after save (when applicable)
     * @param {Archive} bar
     * @param {object} cfg is no sourceDSU is provided must contain a seed field
     * @param {function(err, KeySSI)} callback
     */
    let saveDSU = function(bar, cfg, callback){
        bar.getKeySSIAsString((err, barKeySSI) => {
            if (err)
                return callback(err);
            if(sourceDSU || cfg.skipFsWrite)
                return callback(undefined, barKeySSI);
            storeKeySSI(cfg.seed, barKeySSI, callback);
        });
    };

    /**
     * Run a sequence of {@link OPERATIONS} on the DSU
     * @param {Archive} bar
     * @param {object} cfg
     * @param {string[]} commands
     * @param {function(err, KeySSI)} callback
     */
    let updateDossier = function(bar, cfg, commands, callback) {
        if (commands.length === 0)
            return saveDSU(bar, cfg, callback);
        let cmd = commands.shift();
        runCommand(bar, cmd, commands,(err, updated_bar) => {
            if (err)
                return callback(err);
            updateDossier(updated_bar, cfg, commands, callback);
        });
    };

    /**
     * Builds s DSU according to it's building instructions
     * @param {object|Archive} configOrDSU: can be a config file form octopus or the destination DSU when cloning.
     *
     *
     * Example of config file:
     * <pre>
     *     {
     *         seed: path to SEED file in fs
     *     }
     * </pre>
     * @param {string[]|object[]} [commands]
     * @param {function(err, KeySSI)} callback
     */
    this.buildDossier = function(configOrDSU, commands, callback){
        if (typeof commands === 'function'){
            callback = commands;
            commands = [];
        }

        let builder = function(keySSI){
            try {
                keySSI = _getKeySSISpace().parse(keySSI);
            } catch (err) {
                console.log("Invalid keySSI");
                return createDossier(configOrDSU, commands, callback);
            }

            if (keySSI.getDLDomain() !== configOrDSU.domain) {
                console.log("Domain change detected.");
                return createDossier(configOrDSU, commands, callback);
            }

            _getResolver().loadDSU(keySSI, (err, bar) => {
                if (err){
                    console.log("DSU not available. Creating a new DSU for", keySSI);
                    return _getResolver().createDSU(keySII, {useSSIAsIdentifier: true}, (err, bar)=>{
                        if(err)
                            return callback(err);
                        updateDossier(bar, configOrDSU, commands, callback);
                    });
                }
                console.log("Dossier updating...");
                updateDossier(bar, configOrDSU, commands, callback);
            });
        }

        if (configOrDSU.constructor && configOrDSU.constructor.name === 'Archive')
            return updateDossier(configOrDSU, {skipFsWrite: true}, commands, callback);

        readFile(configOrDSU.seed, (err, content) => {
            if (err || content.length === 0)
                return createDossier(configOrDSU, commands, callback);
            builder(content.toString());
        });
    };
};

module.exports = DossierBuilder;
