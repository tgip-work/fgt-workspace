import {EVENT_SSAPP_HAS_LOADED, EVENT_SEND_ERROR, EVENT_SEND_MESSAGE, EVENT_REFRESH, EVENT_NAVIGATE_TAB, CSS, BUTTON_ROLES} from "../constants/events";
import WebController from "./WebController";

let BaseController;
try {
  const {WebcController} = WebCardinal.controllers;
  BaseController = WebcController;
} catch (e) {
  BaseController = WebController;
}

import wizard from '../services/WizardService';


/**
 * Master Controller to provide access to the Localization features provided by WebCardinal.
 *
 * Also provides integration with pdm's web components error events
 *
 * All child classes must perform the following on their constructor:
 * <pre code=javascript>
 *      constructor(element, history){
 *          super(element, history);
 *          super.bindLocale(this, pageName);
 *          this.model = this.initializeModel();
 *      }
 * </pre>
 * @memberOf Controllers
 * @class LocalizedController
 * @extends WebcController
 * @abstract
 */
export default class LocalizedController extends BaseController {

  /**
   * Should return the initialized model for the controller when needed.
   * <strong>MUST</strong> be called on the constructor for locale binding via {@link WebcLocaleService}
   * @return {{}}
   */
  initializeModel = () => ({});

  /**
   * Shows an Ionic model
   * @param {string} modalName the modal's name registered via:
   * <pre>
   *     customElements.define('registration-modal', class extends HTMLElement{
   *          connectedCallback(){
   *              this.innerHTML = `
   *                  <ion-header class="ion-padding">
   *                      <ion-title>Title</ion-title>
   *                      <ion-content>
   *                          Content
   *                      </ion-content>
   *                  </ion-header>`
   *              }
   *          });
   * </pre>
   * @param {boolean} [swipeToClose]: enables slideToClose when available. defaults to false
   * @param {object} [params]: passes param to modal (ionic functionality)
   * @deprecated
   */
  showIonicModal(modalName, swipeToClose, params) {
    if (typeof swipeToClose === 'object') {
      params = swipeToClose;
      swipeToClose = false;
    }
    swipeToClose = !!swipeToClose;
    this.modal = this.createAndAddElement('ion-modal', {
      id: `Id${modalName}`,
      component: modalName,
      backdropDismiss: false,
      swipeToClose: swipeToClose,
      componentProps: params
    });
    this.modal.present();
  }

  /**
   * @deprecated
   */
  closeIonicModal() {
    if (this.modal)
      this.modal.dismiss();
  }

  /**
   * Shows a Toast via {@link showToast} with
   *  - header: 'Error'
   *  - cssClass: 'danger
   *  - button: 'Close'
   * @param {string} message
   * @param {err} [err]
   */
  showErrorToast(message, err) {
    if (this.useEvents)
      return this.send(EVENT_SEND_ERROR, message, {capture: true});
    return this.showToast(message + (err ? `\n$err` : ''), 'Error', 'danger', 'Close');
  }

  /**
   * Integrates with {@link PdmBarcodeScannerController}. that mean that element needs to be somewhere,
   * typically inside ion-tabs
   * @param {{}} [props] props to pass to scanner:
   *  - title: the modal title. falls back to its barcode-title prop
   * @param {function(err, result)} callback
   */
  showBarcodeScanner(props, callback){
    if (!callback && typeof props === 'function'){
      callback = props;
      props= undefined;
    }
    const getScannerByHost = function(host){
      return host.querySelector('pdm-barcode-scanner-controller');
    }

    let scannerEl = getScannerByHost(this.element) || getScannerByHost(document.body);
    if (!scannerEl)
      return callback(`Could not find the mandatory 'pdm-barcode-scanner-controller' element`);
    scannerEl.present(props, callback);
  }

  /**
   * Shows Toast Alert
   *
   * @param {string} message
   * @param {string} [header] if given will be presenter in the header
   * @param {string|string[]} [cssClass]
   * @param {string} button the text on the close button
   * @param {function()} buttonHandler
   */
  showToast(message, header, cssClass, button, buttonHandler) {
    if (this.useEvents)
      return this.send(EVENT_SEND_MESSAGE, message, {capture: true});

    const toast = this.createAndAddElement('ion-toast');
    toast.header = header;
    toast.message = message;
    toast.position = 'bottom';
    toast.duration = 2000;
    if (cssClass)
      toast.cssClass = cssClass || CSS.TOAST;
    if (button)
      toast.buttons = [
        {
          text: button,
          role: BUTTON_ROLES.CANCEL,
          handler: buttonHandler ? buttonHandler : () => {
            console.log('Cancel clicked');
          }
        }
      ];

    return toast.present();
  }

  /**
   * Shows an alert with the specified message.
   *
   * Standard Usage:
   * <pre>
   *   const alert = await controller.showAlert('this is an <strong>alert</strong> message');
   *   const { role } = await alert.onDidDismiss();
   *   console.log('onDidDismiss resolved with role', role);
   *   if (role === 'confirm') ...
   *   if (role === 'cancel') ...
   * </pre>
   *
   * @param {string} message
   * @param {object} options object with additional configuration options:
   * <pre>
   *   {
   *     cssClass: '...' css class to be used. defaults to 'ssapp-alert'
   *     header: '...' Title text (optional)
   *     subHeader: '...' subTitle text (optional)
   *     buttons: [
   *       {
   *         text: '...' button text,
   *         role: '...' sets a role to be caught by the handler method
   *         cssClass: '...' additional styling
   *         handler: (e) => {      (optional and not recommended)
   *            console.log(e);
   *         }
   *       }
   *     ]
   *   }
   * </pre>
   *
   * defaults to:
   * <pre>
   *   {
   *    buttons: [
   *      {
   *        text: 'Ok',
   *        role: 'confirm'
   *      },
   *      {
   *        text: 'Cancel',
   *        role: 'cancel'
   *      }
   *    ]
   *   }
   * </pre>
   * @return {HTMLElement}
   */
  async showAlert(message, options){
    options = Object.assign( {
      buttons: [
        {
          text: 'Cancel',
          role: BUTTON_ROLES.CANCEL
        },
        {
          text: 'Ok',
          role: BUTTON_ROLES.CONFIRM
        }
      ]
    }, options || {});

    const alert = document.createElement('ion-alert');
    alert.cssClass = options.cssClass || CSS.ALERT;
    alert.header = options.header;
    alert.subHeader = options.subHeader;
    alert.message = message;
    alert.animated = options.animated !== false;
    alert.backDropDismiss = options.backDropDismiss !== false;
    alert.buttons = options.buttons;
    alert.inputs = options.inputs;

    document.body.appendChild(alert);
    await alert.present();
    return alert;
  }

  /**
   * Shows a confirmation Popup
   * @param {string} message the message
   * @param {string} confirmText the ok button text
   * @param {string} cancelText the cancel button text
   * @return {Promise<HTMLElement>}
   */
  async showConfirm(message, confirmText, cancelText = "Cancel"){
    return this.showAlert(message,
      {
        buttons: [
          {
            text: cancelText,
            role: 'cancel'
          },
          {
            text: confirmText,
            role: 'confirm'
          }
        ]
      });
  }

  /**
  *
  * @returns {Promise<HTMLElement>}
  * @param {{}} popupOptions: {
  *   message: string; generic message
  *   confirmText: string; cancel button label
  *   cancelText: string; cancel button label
  *   options: alert ionic options
  * }
  * @param {function(err)} [callback]
  */
async  showPopup(popupOptions, callback = undefined) {
  let { message, confirmButtonLabel, cancelButtonLabel, options } = popupOptions;
  const buttons = [{
    text: cancelButtonLabel || 'Cancel',
    role: 'cancel',
  },
  {
    text: confirmButtonLabel || 'Ok',
    role: 'confirm',
    handler: evt => {
      if (!!callback) callback(evt);
    }
  }];
  options = Object.assign({buttons}, options || {});
  return this.showAlert(message, options);
}


  /**
   * Instantiates a new Spinner
   *
   * API:
   * <pre>
   *     const loader = controller._getLoader('message', options);
   *     await loader.present();
   *     ...
   *     await loader.dismiss();
   * </pre>
   *
   * for styling the class
   *
   * @param {string} message
   * @param {object} [options] accepts params:
   *  - duration duration in ms. (no duration or 0) makes the spinner stay until dismissed (defaults to 0);
   *  - cssClass css class to append. defaults to 'ion-loading'
   *  - translucent defaults to true
   *
   * @return {ion-loading} a spinner
   * @protected
   */
  _getLoader(message, options){
    options = options || {};
    let {duration, cssClass, translucent} = options;
    duration = duration || 0;
    cssClass = cssClass || CSS.SPINNER;
    translucent = translucent !== false;
    const loading = document.createElement('ion-loading');
    loading.cssClass = cssClass;
    loading.message = message;
    loading.translucent = translucent;
    loading.duration = duration;
    document.body.appendChild(loading);
    return loading;
  }

  /**
   * Adds the locale info to the model.
   * @param {LocalizedController} controller
   * @param {string} [pageName]
   * @param {boolean} [enableValidations] defaults to false. If provided enabled Ionic Inputs form validations
   */
  bindLocale(controller, pageName, enableValidations) {
    wizard.LocaleService.bindToLocale(controller, pageName);
    if (enableValidations)
      wizard.Model.Validations.bindIonicValidation(controller);
  }

  /**
   * Makes the controller listen for the {@link EVENT_SEND_ERROR} event and show the error toast to the user
   * @protected
   */
  _bindErrorHandler(){
    let self = this;
    self.on(EVENT_SEND_ERROR, (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      self.showErrorToast(evt.detail);
    }, {capture: true});
  }

  /**
   * Makes the controller listen for the {@link EVENT_SEND_MESSAGE} event and show the toast to the user
   * @protected
   */
  _bindMessageHandler(){
    let self = this;
    self.on(EVENT_SEND_MESSAGE, (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      self.showToast(evt.detail);
    }, {capture: true});
  }

  /**
   * Calls Refresh on the controller
   * @param {{}} [detail] option props to pass on the event
   */
  refresh(detail){
    this.send(EVENT_REFRESH, detail || {}, {capture: true});
  }

  /**
   *
   * @param tabName
   * @param props
   */
  navigateToTab(tabName, props){
    this.send(EVENT_NAVIGATE_TAB, {
      tab: tabName,
      props: props
    });
  }

  /**
   * Override just for the special case of {@link EVENT_SSAPP_HAS_LOADED} to set it on document body and not the element it self because its raised on the body level
   * @param eventName
   * @param handler
   * @param options
   * @override
   */
  on(eventName, handler, options){
    if (eventName === EVENT_SSAPP_HAS_LOADED && document && document.body)
      return document.body.addEventListener(eventName, handler, options);
    super.on(eventName, handler, options);
  }

  static tabs ={
    'tab-dashboard': 'Dashboard',
    'tab-order"': 'Order',
    'tab-received-orders': 'Received Orders',
    'tab-issued-orders': 'Issued Orders',
    'tab-issued-shipments': 'Issued Shipments',
    'tab-received-shipments': 'Incoming Shipments',
    'tab-stock': 'Stock',
    'tab-shipment': 'Shipment',
    'tab-products': 'Products',
    'tab-batches': 'Batches',
    'tab-shipment-lines': 'Shipment Lines',
    'tab-individual-product': 'Product',
}

  /**
   *
   * @param {boolean} [bindMessageHandlers] defaults to false. binds (or not) the error handler to the controller
   * @param args the args for {@link WebcController}
   */
  constructor(bindMessageHandlers, ...args) {
    super(...args);
    if (typeof bindMessageHandlers === 'undefined'){
      this.useEvents = false;
    } else if(typeof bindMessageHandlers === 'boolean'){
      if (bindMessageHandlers){
        this._bindErrorHandler();
        this._bindMessageHandler();
        this.useEvents = false;
      } else {
        this.useEvents = true;
      }
    }
  }
}
