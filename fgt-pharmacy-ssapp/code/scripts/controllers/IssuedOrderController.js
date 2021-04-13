import LocalizedController from "./LocalizedController.js";
export default class IssuedOrderController extends LocalizedController {

    getModel = () => ({}); // initial empty model

    constructor(element, history) {
        super(element, history);
        let self = this;
        super.bindLocale(self, `issuedOrder`, true);
        const wizard = require('wizard');
        self.participantManager = wizard.Managers.getParticipantManager();
        self.issuedOrderManager = wizard.Managers.getIssuedOrderManager(this.participantManager);

        self.setModel(self.getModel());

        console.log("IssuedOrderController initialized");
        self.onTagClick(`tryOk`, () => { self._handleTryOk(); });
        self.onTagClick(`tryCancel`, () => { self._handleTryCancel(); });
        //self.on('input-has-changed', self._handleErrorElement.bind(self));

        self._setupBlankOrder();
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
     _handleTryOk() {
        let self = this;
        if (self.hasErrors())
            return this.showErrorToast('There are errors in the form');
        console.log(self.getModel());
        let order = self.issuedOrderManager.fromModel(self.model);
        self.issuedOrderManager.create(order, (err, keySSI, dbPath) => {
            if (err) {
                return self.showErrorToast(err);
            }
            self.send('created-issued-order', order);    
        });
    }

    /**
     * Sends an event named cancel-new-issued-order to the IssuedOrders controller.
     */
     _handleTryCancel() {
        let self = this;
        self.send('cancel-new-issued-order');
    }

    _setupBlankOrder() {
        let self = this;
        self.issuedOrderManager.newBlank( (err, order) => {
            self.issuedOrderManager.toModel(order, self.model);
        });
    }

}