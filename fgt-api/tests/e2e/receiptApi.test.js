const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const db = require("../controls/db/db");
const {BASE_PATH} = require("../controls/utils");


describe('receiptApi', function () {
    require("./saleApi.test");
    const sale = db.sales[0];

    describe('GET /receipt/get', function () {

        it ('should get receipt by receiptId', (done) => {
            chai.request(BASE_PATH)
                .get(`/receipt/get/${undefined}`)
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('gtin').equal(sale.gtin);
                    res.body.should.have.property('batchNumber').equal(sale.batchNumber);
                    res.body.should.have.property('serialNumber').equal(sale.serialNumber);
                    res.body.should.have.property('manufName').equal(db.mahParticipant);
                    res.body.should.have.property('sellerId').equal(sale.sellerId);
                    res.body.should.have.property('status');
                    done();
                });
        });

        it ('should get all receipts', (done) => {
            chai.request(BASE_PATH)
                .get('/receipt/getAll')
                .end((err, res) => {
                    chai.assert.isNotEmpty(res.body);
                    res.should.have.status(200);
                    res.body.should.have.property('meta');
                    res.body.should.have.property('results');
                    res.body.results.should.be.a('array');
                    res.body.results.length.should.be.greaterThan(0);
                    done();
                });
        });
    });

});