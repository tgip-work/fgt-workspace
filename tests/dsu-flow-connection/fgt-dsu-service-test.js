process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;
const resolver = require('opendsu').loadApi('resolver');

let domain = 'traceability';
let testName = 'DSUService test';

const model = require('../../fgt-dsu-wizard/model');
const strategies = require('../../fgt-dsu-wizard/services/strategy');
const OrderLine = model.OrderLine;
const Order =  model.Order;

let orderLines = [];

for (let i = 0; i< 3; i++){
    orderLines.push(new OrderLine(97 * i + 1, 100 + 10 * i, 1, 100));
}

function getOrder(){
    let order = new Order(1, 1, 100, "address", "created", orderLines);
    return JSON.parse(JSON.stringify(order));
}

function createOrderDSU(strategy, order, callback){
    const orderService = new (require('../../fgt-dsu-wizard/services/OrderService'))(strategy);
    orderService.create(order, callback);
}

/**
 *
 * @param {function} keySSI
 * @param {function} callback
 */
function validateOrder(keySSI, callback){
    console.log("Validating dsu...");
    let newlyGenKeySSI = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI(getOrder(), "traceability");
    assert.equal(keySSI.getIdentifier(true), newlyGenKeySSI.getIdentifier(true), "Keys do not match")
    console.log("OK - Keys match")

    let order = getOrder();

    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        assert.notNull(dsu, "DSU cannot be null");
        dsu.readFile("/data", (err, data) => {
            if (err)
                return callback(err);
            if (!data)
                return callback("no data found");

            try {
                assert.equal(JSON.stringify(order), data.toString(), "data does not match");
                console.log("OK - data matches");
            } catch (e){
                return callback(e);
            }

            dsu.readFile("/orderlines", (err, orderLines) => {
                if (err)
                    return callback(err);
                assert.notNull(orderLines);
                orderLines = JSON.parse(orderLines);
                validateOrderLines(order.orderLines, orderLines, callback);
            });
        });
    });
}

function validateOrderLines(orderLines, keySSIs, callback){
    let orderLine = orderLines.shift();
    let keySSI = keySSIs.shift();

    if (!orderLine || !keySSI)
        return callback();

    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        console.log(`OK - orderline ${keySSI} loaded`);
        dsu.readFile("/data", (err, data) => {
            if (err)
                return callback(err);
            try {
                let dataObj = JSON.parse(data);
                console.log(`OK - Orderline data matches ${data}`);
                validateOrderLines(orderLines, keySSIs, callback);
            } catch (e){
                return callback(e);
            }
        })
    });
}

assert.callback('Launch API Hub', (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                if (err)
                    throw err;

                console.log('Updated bdns', bdns);

                createOrderDSU(strategies.SIMPLE, getOrder(), (err, keySSI) => {
                    if (err)
                        throw err;
                    validateOrder(keySSI, (err) => {
                        if (err)
                            throw err;

                    });
                    testFinished();
                });
            });
        });
    });
}, 300000);    // you have 300 seconds for it to happen


