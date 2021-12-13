
const {Api, OPERATIONS} = require('../Api');
const Batch = require("../../fgt-dsu-wizard/model/Batch");

const BATCH_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', 'batchNumber']});
const BATCH_CREATE = Object.assign({}, OPERATIONS.CREATE, {pathParams: ['gtin']});
const BATCH_UPDATE = Object.assign({}, OPERATIONS.UPDATE, {pathParams: ['gtin', 'batchNumber']});

module.exports = class BatchApi extends Api {
    batchManager;
    productManager;

    constructor(server, participantManager) {
        super(server, 'batch', participantManager, [BATCH_CREATE, BATCH_GET, BATCH_UPDATE], Batch);
        try {
            this.batchManager = participantManager.getManager("BatchManager");
            this.productManager = participantManager.getManager("ProductManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {string} gtin
     * @param {Batch} batch
     * @param {function(err?, Batch?, KeySSI?)} callback
     */
    create(gtin, batch, callback){
        const self = this;

        self.productManager.getOne(gtin, (err, product) => {
            if (err)
                return callback(err);

            const [validateErr, _batch] = self._validate(batch, batch.batchStatus);
            if (validateErr)
                return callback(validateErr);

            self.batchManager.create(product, _batch, (err, keySSI) => {
                if (err)
                    return callback(err);
                self.batchManager.getOne(product.gtin, _batch.batchNumber, true, (err, _batch) => {
                    if (err)
                        return callback(err);
                    callback(undefined, {..._batch, keySSI: keySSI.getIdentifier()});
                });
            });
        })
    }

    /**
     * @param {string[]} [gtins] a list of GTIN's
     * @param {[Batch]} batches a list of model objects
     * @param {function(err?, [{Batch}]?, KeySSI[]?)} callback
     */
    createAll(gtins, batches, callback){
        const self = this;
        try{
            self.batchManager.beginBatch();
        } catch (e) {
            return self.batchManager.batchSchedule(() => self.createAll.call(self, gtins, batches, callback));
        }

        super.createAll(gtins, batches, (err, ...results) => {
            if (err){
                console.log(err);
                return self.batchManager.cancelBatch((_) => callback(err));
            }

            self.batchManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.batchManager.cancelBatch((_) => callback(err));
                }
                const [created, keySSIs] = results;
                callback(undefined, created, keySSIs);
            });
        });
    }

    /**
     * @param gtin
     * @param batchNumber
     * @param {function(err?, Batch?)} callback
     */
    getOne(gtin, batchNumber, callback) {
        this.batchManager.getOne(gtin, batchNumber, true, (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, batch);
        })
    }

    /**
     * @param {{}} query
     * @param {function(err?, [Batch]?)} callback
     */
    getAll(query, callback) {
        this.batchManager.getAll(true, (err, batches) => {
            if (err)
                return callback(err);
            callback(undefined, batches);
        })
    }

    /**
     * @param {string} gtin
     * @param {string} batchNumber
     * @param {{status: string, extraInfo: string}} statusUpdate
     * @param {function(err?, Batch?)} callback
     */
    update(gtin, batchNumber, statusUpdate, callback){
        const self = this;

        self.batchManager.getOne(gtin, batchNumber, (err, batch) => {
            if (err)
                callback(err)

            const oldStatus = batch.batchStatus.status;
            batch.batchStatus.status = statusUpdate.status;
            batch.batchStatus.extraInfo = statusUpdate.extraInfo;
            const [_err, _batch] = self._validate(batch, oldStatus);
            if (_err)
                return callback(_err);

            self.batchManager.update(gtin, _batch, (err, updatedBatch) => {
                if (err)
                    return callback(err);
                callback(undefined, updatedBatch);
            });
        })
    }

    /**
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?)} callback
     */
    updateAll(keys, models, callback){
        const self = this;
        try{
            self.batchManager.beginBatch();
        } catch (e) {
            return self.batchManager.batchSchedule(() => self.updateAll.call(self, keys, models, callback));
        }

        super.updateAll(keys, models, (err, created) => {
            if (err){
                console.log(err);
                return self.batchManager.cancelBatch((_) => callback(err));
            }

            self.batchManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.batchManager.cancelBatch((_) => callback(err));
                }
                callback(undefined, created);
            });
        });
    }

}