import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const LocaleService = require('wizard').Services.LocaleService;

export default class ProductController extends ModalController {
    constructor(element, history) {
        super(element, history);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "product")
        this.model = this.setModel({});

        let state = this.History.getState();
    }
}