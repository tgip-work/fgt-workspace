import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the Issued Shipments
 */
export default class IssuedShipmentsController extends LocalizedController {
    initializeModel = () => ({}); // creates a new uninitialized blank model

    constructor(...args) {
        super(false, ...args)
        super.bindLocale(this, "issuedShipments");
        this.model = this.initializeModel();
        const wizard = require('wizard');
        this.participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(this.participantManager);

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh()
        }, {capture: true});
    }

}

