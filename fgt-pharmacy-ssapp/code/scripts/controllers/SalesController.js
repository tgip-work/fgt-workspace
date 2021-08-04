import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class SalesController extends LocalizedController {
    initializeModel = () => ({}); // uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "sales");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.salesManager = wizard.Managers.getSaleManager(participantManager);
        this.salesManager.bindController(this);
        this.table = this.element.querySelector('pdm-ion-table');

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        this.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});
    }
 
}