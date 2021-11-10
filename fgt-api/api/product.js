
const {Api, OPERATIONS} = require('../Api');
const Product = require('../../fgt-dsu-wizard/model/Product');

const PRODUCT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});

class ProductApi extends Api {
    productManager;

    constructor(server, participantManager) {
        super(server, 'product', participantManager, [OPERATIONS.CREATE, PRODUCT_GET]);
        try {
            this.productManager = participantManager.getManager("ProductManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }

    }

    /**
     *
     * @param {string} [gtin]
     * @param {Product} product
     * @param {function(err?, Product?, KeySSI?)} callback
     * @override
     */
    create(gtin, product, callback){
        if (!callback){
            callback = product;
            product = gtin;
            gtin = product.gtin;
        }

        const self = this;

        if (!(product instanceof Product))
            product = new Product(product);

        const err = product.validate();
        if (err)
            return callback(err.join(', '));

        self.productManager.create(product, (err, keySSI) => {
            if (err)
                return callback(err);
            self.productManager.getOne(product.gtin, true, (err, savedProduct) => {
                if (err)
                    return callback(err);
                callback(undefined, savedProduct, keySSI.getIdentifier());
            });
        });
    }

    /**
     * Creates a new Model Object
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, models, callback){
        const self = this;
        try{
            self.productManager.beginBatch();
        } catch (e) {
            return self.productManager.batchSchedule(() => self.createAll.call(self, keys, models, callback));
        }

        super.createAll(keys, models, (err, ...results) => {
            if (err){
                console.log(err);
                return self.productManager.cancelBatch((_) => callback(err));
            }

            self.productManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.productManager.cancelBatch((_) => callback(err));
                }
                const [created, keySSIs] = results;
                callback(undefined, created, keySSIs);
            });
        });
    }
}

module.exports = ProductApi;