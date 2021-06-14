const { DB, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;
/**
 * Order Manager Class
 *
 * Abstract class.
 * Use only concrete subclasses {@link IssuedOrderManager} or {@link ReceivedOrderManager}.
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @module managers
 * @class OrderManager
 * @abstract
 */
class OrderManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['orderId', 'products', ...indexes], callback);
        this.orderService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the Order
     * @param {string|number} otherActorId
     * @param {string|number} orderId
     * @return {string}
     * @protected
     */
    _genCompostKey(otherActorId, orderId){
        return `${otherActorId}-${orderId}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Order} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            orderId: item.orderId,
            products: item.orderLines.map(ol => ol.gtin).join(','),
            value: record
        }
    }

    // messages to all MAHs.
    // the order is the same for the orderlines and their ssis because of the way the code is written
    sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback) {
        const self = this;
        const orderLine = orderLines.shift();
        let ssi = orderLinesSSIs.shift();
        //console.log("Handling rest of orderLines ", orderLines);
        if (!orderLine){
            console.log(`All orderlines transmited to MAH`)
            return callback();
        }
        self.orderService.resolveMAH(orderLine, (err, mahId) => {
            if (err)
                return self._err(`Could not resolve MAH for ${orderLine}`, err, callback);
            if (typeof ssi !== 'string')
                ssi = ssi.getIdentifier();
            self.sendMessage(mahId, DB.orderLines, ssi, (err) => {
                if (err)
                    return self._err(`Could not send message to MAH ${mahId} for orderLine ${JSON.stringify(orderLine)} with ssi ${ssi}`, err, callback);
                console.log(`Orderline ${JSON.stringify(orderLine)} transmitted to MAH ${mahId}`);
            })
        });

        self.sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback);
    }

    /**
     * Convert the OrderController view model into an Order.
     * @param model
     * @returns {Order}
     */
    fromModel(model) {
        // convert orderLines into an array of OrderLines
        let orderLines = [];
        let orderLinesStr = model.orderLines.value;
        if (orderLinesStr) {
            orderLinesStr.split(";").forEach((gtinCommaQuant) => {
                let gtinAndQuant = gtinCommaQuant.split(",");
                if (gtinAndQuant.length === 2) {
                    let gtin = gtinAndQuant[0];
                    let quantity = parseInt(gtinAndQuant[1]);
                    if (gtin && quantity) {
                        orderLines.push(new OrderLine(gtin, quantity, model.requesterId.value, model.senderId.value));
                    }
                }
            });
        }
        const order = new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
        console.log("model ", model, "order ", order);
        return order;
    }

    /**
     * Convert an Order into a OrderControler view model. 
     * The order.orderLines are converted to a special format. See locale.js
     * @param {Order} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model) {
        model = model || {};
        for (let prop in object) {
            //console.log("prop", prop, "=='orderLines'", prop=="orderLines");
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                if (prop == "orderLines") {
                    model[prop].value = "";
                    let sep = "";
                    object[prop].forEach((orderLine) => {
                        model[prop].value += sep + orderLine.gtin + "," + orderLine.quantity;
                        sep = ";";
                    });
                } else {
                    model[prop].value = object[prop];
                }
            }
        }
        return model;
    }
}

module.exports = OrderManager;