//process.exit(0); // Uncommnent to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();


/*General Dependencies*/
const path = require('path');

const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
const {argParser} = require('../../../bin/environment/utils');

const {getCredentials, APPS} = require('../../../bin/environment/credentials/credentials3')

const {getMockParticipantManager} = require('../../getMockParticipant');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../privatesky/psknode/tests/util/tir");

let domain = 'traceability';
let testName = 'IndividualProductManagerTest' // no spaces please. its used as a folder name

const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

/*Specific Dependencies*/


compostKeyList = [];
individualProductList = [];
individualProductListCopy = [];
usedIndividualProductList = [];


const { IndividualProduct } = require('../../../fgt-dsu-wizard/model');
const { getIndividualProductManager } = require('../../../fgt-dsu-wizard/managers');


/*Fake Server Config*/

const DOMAIN_CONFIG = {
    anchoring: {
        type: "FS",
        option: {
            enableBricksLedger: false,
        },
        commands: {
            addAnchor: "anchor",
        },
    },
    enable: ["mq"],
};

const getBDNSConfig = function(folder){
    return {
        maxTries: 10,
        storageFolder: folder,
        domains: [
            {
                name: domain,
                config: DOMAIN_CONFIG,
            },
            {
                name: 'vault',
                config: DOMAIN_CONFIG,
            },
        ],
    }
}

const defaultOps = {
    timeout: 500000000,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

/*Tests*/

const testCreateProductDSU = function(individualProductManager, individualProduct, callback){
    
    console.log('Trying to create Individual Product DSU', individualProduct);

    individualProductManager.create(individualProduct, (err, keySSI) =>{

        if(err) {return callback(err);}; 

        assert.true(!!keySSI && typeof keySSI === 'object');

        console.log(`Individual Product created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);

    });

}

/**
 * use generic names. this is meant as a skeleton for all managers, eg: testGetOne
 * also look at the proposed aproach below. remember, you are building a skeleton test file. the overall structure should applyt to each manager, but each might require different unit tests
 *
 * @param individualProductManager
 * @param individualProduct
 * @param callback
 */
const testGetOneProductDSU = function(individualProductManager, individualProduct, callback){
    // const key = individualProductManager._genCompostKey(individualProduct.gtin, individualProduct.batchNumber, individualProduct.serialNumber);
    //
    // const run = function(callback){
    //     individualProductManager.getOne(key, true, (err, product) => {
    //         if (err)
    //             return callback(err);
    //         individualProductManager.getOne(key, false, (err, record) => {
    //             if (err)
    //                 return callback(err);
    //             callback(undefined, product, record);
    //         });
    //     });
    // }
    //
    // const testAll = function(product, record, callback){
    //
    //     const testProductEquality = function(){
    //         assert.true(utils.isEqual(individualProduct, product), "Products are not equal"); // i think this method already compares types
    //     }
    //
    //     const testNotReadDSU = function(){
    //         // in this case the !readDSU returns the KeySSI (this may not be the correct behaviour)
    //         assert.true(!!record)
    //     }
    // }
    //
    // run((err, ...args) => {
    //     if (err)
    //         return callback(err);
    //     testAll(...args, callback);
    // });

    console.log('Trying to get one Individual Product DSU', individualProduct);
    const readDSU = true;
    const key = individualProductManager._genCompostKey(individualProduct.gtin, individualProduct.batchNumber, individualProduct.serialNumber);

    individualProductManager.getOne(key ,readDSU, (err, product) =>{

        if(err) {return callback(err);}; 

        console.log(`Individual Product obtained with compost key: ${key}`);
        console.log('Comparing product received with product delivered!');
        assert.true(utils.isEqual(individualProduct,product));
        assert.true(!!product && typeof product === 'object');
        console.log('Products are equal!');
        callback(undefined, product);

    });

} 

const testGetAll = function(individualProductManager,readDSU, callback){

    console.log(`Trying to read all products from DSU`);

    individualProductManager.getAll(readDSU,(err , result) =>{

        if(err)
            return callback(err);

        console.log(result);
           

        
        
        callback(undefined,result);

    });
}

const testCompare = function(individualProductManager, productOne, productTwo, callback){

    const isEqual = utils.isEqual(productOne,productTwo);
    console.log(productOne, ' / ', productTwo);
    
    if(!isEqual){
        console.log('Products are not equal!')
        
        return callback(err);
    }

    console.log('Products are equal!');
    callback(undefined, isEqual);

}

const testUpdate = function(individualProductManager,individualProduct,callback){

    //no functionality yet

}
const testRemove = function(individualProductManager,individualProduct,callback){
    
    console.log('Trying to remove one Individual Product DSU', individualProduct);
    const key = individualProductManager._genCompostKey(individualProduct.gtin, individualProduct.batchNumber, individualProduct.serialNumber);

    individualProductManager.remove(key,(err, something) => {
        if(err)
            return callback(err);
        
        if(something === undefined){
            
            console.log(something, 'Item removed!')

        }

        assert.pass(individualProductManager.getOne(key, (err, product) =>{

            if(err) {
                
                return callback(err);}; 
    
            
            callback(undefined, product);
    
        }))
    })
}


/*Utilities*/ 

const catchError = function(err,message){
    console.log(message);
    console.log(err);
    process.exit(1);
}

const getIndividualProduct = function(){
    
    return new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

}

const populateProductList = function(numOfProducts){
    for(let i = 0; i < numOfProducts; i++){

        individualProductList.push(getIndividualProduct());
    
    }
}


/***
 * why not try:
 * <pre>
 *     function(manager, test, accumulator, ...args){
 *         const callback = args.pop();
 *         ...
 *     }
 * </pre>
 *
 * this would allow you to use one iterator function only. testCompare would be useless
 * @param manager
 * @param productList
 * @param test
 * @param accumulator
 * @param callback
 * @returns {*}
 */
const testIterator = function(manager , productList, test ,accumulator , callback){
    
    const product = productList.shift();

    if(!callback){
        callback = accumulator;
        accumulator = [];
    }
    
    if(!product){
        return callback(undefined,accumulator); 
    }

    accumulator.push(product);
    let key = manager._genCompostKey(product.gtin, product.batchNumber,product.serialNumber);

    test(manager , product ,(err, result) => {

        testIterator(manager,productList, test, accumulator, callback);

    })


}

const testIteratorCompare = function(manager , productList, compareList, test ,accumulator , callback){
    
    const product = productList.pop();
    const compareProduct = compareList.shift();

    if(!callback){
        callback = accumulator;
        accumulator = [];
    }

    if(productList.length !== compareList.length){

        console.log(productList.length , ' / ', compareList.length);
        return callback(true);
    
    }
    
    if(!product && !compareProduct){
        return callback(undefined, accumulator); 
    }

    accumulator.push(product);
    let key = manager._genCompostKey(product.gtin, product.batchNumber,product.serialNumber);

    test(manager , product , compareProduct , (err, result) => {

        testIteratorCompare(manager,productList,compareList, test, accumulator, callback);

    })


}

/*Run Tests*/

const runTest = function(callback){
    const mahCredentials = getCredentials(APPS.MAH);
    const credentials = Object.keys(mahCredentials).reduce((accum, key) => {
        if (mahCredentials[key].public)
            accum[key] = mahCredentials[key].secret;
        return accum;
    }, {})
    getMockParticipantManager(domain, credentials, (err, participantManager) => {
        if (err)
            return callback(err);

        console.log(participantManager);

        //Populate product List
        populateProductList(10); //more than 25 products breaks test

        individualProductListCopy = individualProductList;

        //Getting Individual Product Manager
        const individualProductManager = getIndividualProductManager(participantManager); 
        console.log(individualProductManager);




        //Test create
        testIterator(individualProductManager, individualProductList, testCreateProductDSU, (err, products) => {
            
            if(err){
                return callback(err);
            }

            console.log(products);

            //Test get one
            testIterator(individualProductManager, products, testGetOneProductDSU,(err, products)=> {

                if(err){
                    return callback(err);
                }

                //Test get all
                testGetAll(individualProductManager,true,(err,results) => {

                    if(err) 
                        return callback(err);

                    //Compare results with original list using iterator
                    testIteratorCompare(individualProductManager,products,results,testCompare,(err, products) => {

                        if(err)
                            return callback(err);

                        testIterator(individualProductManager,products.slice(0,products.length/2), testRemove,(err , products)=> {
                            if(err)
                                return callback(err);

                            console.log("Tests Completed Sucessfully");
                            callback();

                        })
                    })
                })
            })
        })      
    }) 
}

const testFinishCallback = function(callback){
    console.log(`Test ${testName} finished successfully`);
    if (callback)
        return callback();
    setTimeout(() => {
        process.exit(0);
    }, 1000)
}

const launchTest = function(callback){
    const testRunner = function(callback){
        runTest((err) => {
            if (err)
                return callback(err);
            testFinishCallback(callback);
        });
    }

    const runWithFakeServer = function(callback){
        dc.createTestFolder(testName, async (err, folder) => {
            await tir.launchConfigurableApiHubTestNodeAsync(getBDNSConfig(folder));

            if (!callback)
                assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
            testRunner(callback);
        });
    }

    if (TEST_CONF.fakeServer)
        return runWithFakeServer(callback);

    if (!callback)
        assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
    testRunner(callback);
}

if (!TEST_CONF.useCallback)
    return launchTest();
assert.callback(testName, (testFinished) => {
    launchTest(testFinished);
}, TEST_CONF.timeout)



