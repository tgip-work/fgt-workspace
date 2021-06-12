import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import CreateManageView from "../create-manage-view-layout/CreateManageView";
import {
  getProductPopOver,
  getDirectoryProducts,
  getDirectoryRequesters,
} from "../../utils/popOverUtils";

const SHIPMENT_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

const {ROLE, OrderLine, Shipment} = wizard.Model;

@Component({
  tag: 'managed-shipment',
  styleUrl: 'managed-shipment.css',
  shadow: false,
})
export class ManagedShipment implements CreateManageView{

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: 'ssapp-navigate-tab',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  /**
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendCreateAction: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  // Functional Props
  @Prop({attribute: "shipment-ref", mutable: true}) shipmentRef?: string;
  @Prop({attribute: "order", mutable: true}) order = undefined;
  @Prop({attribute: 'identity', mutable: true}) identity;
  @Prop({attribute: 'shipment-type', mutable: true}) shipmentType: string = SHIPMENT_TYPE.ISSUED;

  // strings

  // General
  @Prop({attribute: "create-title-string"}) titleString: string = "Title String"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back"
  @Prop({attribute: "scanner-title-string"}) scanString: string = "Please Scan your Product"

  // Form Buttons
  @Prop({attribute: "create-string"}) createString:string = "Issue Shipment";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  // Input Strings
  @Prop({attribute: 'order-id-string', mutable: true}) orderIdString: string = 'Order Id:';
  @Prop({attribute: 'from-string', mutable: true}) fromString: string = 'Shipment from:';
  @Prop({attribute: 'to-string', mutable: true}) to_String: string = 'Shipment to:';
  @Prop({attribute: 'to-placeholder-string', mutable: true}) toPlaceholderString: string = 'Select a requester...';
  @Prop({attribute: 'from-at-string', mutable: true}) fromAtString: string = 'At:';
  @Prop({attribute: 'to-at-string', mutable: true}) toAtString: string = 'from:';
  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';
  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';
  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';

  // Displays
  @Prop({attribute: 'status-string', mutable: true}) statusString: string = 'Shipment Status:';

  // Stock Management
  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';
  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';
  @Prop({attribute: 'reset-all-string'}) resetAllString: string = 'Reset All';
  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';
  @Prop({attribute: 'confirm-all-string'}) confirmAllString: string = 'Confirm All';
  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';
  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';
  @Prop({attribute: 'select-string'}) selectString: string = 'Please Select an item...';
  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';
  @Prop({attribute: 'order-missing-string'}) orderMissingString: string = 'Order Missing';


  // @Prop({attribute: 'reject-string'}) rejectString: string = 'Reject';
  //
  //
  // @Prop({attribute: 'proceed-string'}) proceedString: string = 'Continue:';
  // @Prop({attribute: 'delay-string'}) delayString: string = 'Delay:';
  //



  // Directory Variables
  private directoryManager: WebManager = undefined;
  @State() products?: string[] = undefined;
  @State() requesters?: string[] = undefined;

  private issuedShipmentManager: WebManager = undefined;
  private receivedShipmentManager: WebManager = undefined;

  private layoutComponent = undefined;

  // for new Shipments
  @State() participantId?: string = undefined;
  @State() shipment: typeof Shipment = undefined;

  @State() orderLines;
  @State() currentGtin?: string = undefined;
  @State() currentQuantity: number = 0;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    this.issuedShipmentManager = await WebManagerService.getWebManager(`IssuedShipmentManager`);
    this.receivedShipmentManager = await WebManagerService.getWebManager(`ReceivedShipmentManager`);
    return await this.load();
  }

  private getManager(){
    return this.isCreate() || this.getType() === SHIPMENT_TYPE.ISSUED ? this.issuedShipmentManager : this.receivedShipmentManager;
  }

  private getType(){
    return this.shipmentType && !this.shipmentType.startsWith('@') ? this.shipmentType : SHIPMENT_TYPE.ISSUED;
  }

  async load(){
    let self = this;

    if (this.isCreate())
      return this.reset();

    await self.getManager().getOne(this.shipmentRef, true, async (err, shipment) => {
      if (err)
        return this.sendError(`Could not retrieve shipment ${self.shipmentRef}`);
      self.shipment = shipment;
    });
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  @Method()
  async updateDirectory(){
    this.getDirectoryProductsAsync();
    this.getDirectoryRequestersAsync();
  }

  private getDirectoryProductsAsync(){
    const self = this;
    getDirectoryProducts(self.directoryManager, (err, gtins) => {
      if (err)
        return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
      self.products = gtins;
    });
  }

  private getDirectoryRequestersAsync(callback?){
    const self = this;
    getDirectoryRequesters(self.directoryManager, (err, records) => {
      if (err){
        self.sendError(`Could not list requesters from directory`, err);
        return callback && callback(err);
      }

      self.requesters = records;
      if (callback)
        callback(undefined, records);
    });
  }

  private async showProductPopOver(evt){
    const popover = await getProductPopOver(evt, this.products);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }

  @Watch('shipmentRef')
  @Method()
  async refresh(){
    await this.load();
  }

  @Method()
  async reset(){
    this.orderLines = [];
    const stockEl = this.getStockManagerEl();
    if (stockEl)
      stockEl.reset();
  }

  private getStockManagerEl(){
    return this.element.querySelector('line-stock-manager');
  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-${this.getType()}-shipments`, {});
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Shipment(undefined, this.identity.id, evt.detail.senderId, this.identity.address, undefined, this.orderLines.slice()));
  }

  isCreate(){
    return !this.shipmentRef || this.shipmentRef.startsWith('@');
  }

  private scan(){
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller');
    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      console.log(scanData);
      self.currentGtin = scanData ? scanData.gtin || scanData.productCode || scanData.result: undefined;
    });
  }

  private addOrderLine(gtin, quantity){
    this.orderLines = [...this.orderLines, new OrderLine(gtin, quantity, this.participantId , this.identity.id)]
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }

  private selectOrderLine(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.currentGtin = evt.detail;
  }

  private getInputs(){
    const self = this;
    const isCreate = self.isCreate();

    const options = {
      cssClass: 'select-popover-select'
    };

    const getOrderReference = function(){
      const getInput = function () {
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.order && isCreate) {
          return (
            <ion-input name="input-orderId" disabled={true}
                       value={self.getType() === SHIPMENT_TYPE.ISSUED ? self.order.orderId : 'TODO'}></ion-input>
          )
        } else {
          <ion-skeleton-text animated></ion-skeleton-text>;
        }
      };
      return (
        <ion-item lines="none" disabled={false}>
          <ion-label position="stacked">{self.orderIdString}</ion-label>
          {getInput()}
        </ion-item>
      )
    }

    const getSender = function() {
      const getFrom = function () {
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters && isCreate) {

          return (
              <ion-select name="input-senderId" interface="popover" interfaceOptions={options}
                          class="sender-select"
                          disabled={!isCreate} value={!isCreate ? self.participantId : ''}>
                {...self.requesters.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
              </ion-select>
          )
        } else if (isCreate || self.getType() === SHIPMENT_TYPE.RECEIVED) {
          return (
            <ion-input name="input-senderId" disabled={true} value={self.getType() === SHIPMENT_TYPE.RECEIVED ? self.participantId : self.identity.id}></ion-input>
          )
        } else {
          <ion-skeleton-text animated></ion-skeleton-text>;
        }
      };

      return (
        <ion-item lines="none" disabled={false}>
          <ion-label position="stacked">{self.fromString}</ion-label>
          {getFrom()}
        </ion-item>
      )
    }

    const getRequester = function(){
      const getTo = function(){
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters && isCreate) {
          const options = {
            cssClass: 'product-select'
          };
          return (
            <ion-select name="input-requesterId" interface="popover" interfaceOptions={options}
                        class="requester-select"
                        value={!isCreate ? self.participantId : ''}>
              {...self.requesters.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
            </ion-select>
          )
        } else if (self.getType() === SHIPMENT_TYPE.RECEIVED) {
          return (
            <ion-input name="input-requesterId" disabled={true} value={self.shipment.requesterId}></ion-input>
          )
        } else {
          return <ion-skeleton-text animated></ion-skeleton-text>;
        }
      };

      return (
          <ion-item lines="none" disabled={false}>
            <ion-label position="stacked">{self.to_String}</ion-label>
            {getTo()}
          </ion-item>
        )
    }

    const getRequesterLocale = function(){
      const getAddress = function(){
        if (!self.shipment && !self.order)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-input name="input-requester-address" disabled={true} value={self.order ? self.order.shipToAddress : self.shipment.shipFromAddress}></ion-input>);
      }
      return (
        <ion-item lines="none" >
          <ion-label position="stacked">{self.fromAtString}</ion-label>
          {getAddress()}
        </ion-item>
      )
    }

    const getSenderLocale = function(){
      const getAddress = function(){
        if (!self.shipment && !self.order)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-input name="input-sender-address" disabled={true} value={self.order ? self.order.shipFromAddress : self.shipment.shipToAddress}></ion-input>);
      }
      return (
        <ion-item lines="none" >
          <ion-label position="stacked">{self.toAtString}</ion-label>
          {getAddress()}
        </ion-item>
      )
    }

    const getStatus = function(){
      if (isCreate)
        return;
      const getBadge = function(){
        if (!self.shipment)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-badge class="ion-padding-horizontal">{self.shipment.status}</ion-badge>)
      }
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.statusString}</ion-label>
          {getBadge()}
        </ion-item>
      )
    }

    const getProductInput = function(){
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.productsCodeString}</ion-label>
          <ion-input name="input-gtin" type="number" value={self.currentGtin}></ion-input>
          <ion-buttons slot="end">
            <ion-button onClick={() => self.scan()} color="medium" size="large" fill="clear">
              <ion-icon slot="icon-only" name="scan-circle"></ion-icon>
            </ion-button>
            <ion-button onClick={(evt) => self.showProductPopOver(evt)} color="secondary" size="large" fill="clear">
              <ion-icon slot="icon-only" name="add-circle"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      )
    }

    const getQuantityInput = function(){
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.quantityString}</ion-label>
          <ion-grid>
            <ion-row>
              <ion-col size="10">
                <ion-range name="input-quantity" min={0} max={Math.max(self.currentQuantity || 0, 100)}
                           pin={true} value={self.currentQuantity || 0} color="secondary">
                  <ion-button slot="start" fill="clear" color="secondary"
                              onClick={() => self.currentQuantity--}>
                    <ion-icon color="secondary" slot="icon-only" name="remove-circle"></ion-icon>
                  </ion-button>
                  <ion-button slot="end" fill="clear" color="secondary"
                              onClick={() => self.currentQuantity++}>
                    <ion-icon slot="icon-only" name="add-circle"></ion-icon>
                  </ion-button>
                </ion-range>
              </ion-col>
              <ion-col size="2" class="ion-padding-left">
                <ion-input name="input-quantity" type="number" value={self.currentQuantity || 0}></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-button slot="end" size="large" fill="clear" color="success"
                      disabled={!self.currentGtin || !self.currentQuantity} onClick={() => self.addOrderLine(self.currentGtin, self.currentQuantity)}>
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
          </ion-button>
        </ion-item>
      )
    }

    switch (self.getType()){
      case SHIPMENT_TYPE.ISSUED:
        return [
          getOrderReference(),
          getRequester(),
          getRequesterLocale(),
          getProductInput(),
          getQuantityInput(),
          getStatus()
        ]
      case SHIPMENT_TYPE.RECEIVED:
        return [
          getOrderReference(),
          getSender(),
          getSenderLocale(),
          getRequesterLocale(),
          getStatus()
        ]
    }
  }

  getCreate(){
    if (!this.isCreate())
      return;
    return [
      ...this.getInputs(),
      <line-stock-manager lines={typeof this.orderLines !== 'string' ? this.orderLines : []}
                          show-stock={this.getType() === SHIPMENT_TYPE.RECEIVED}
                          enable-actions={true}

                          onSelectEvent={(evt) => this.selectOrderLine(evt)}

                          stock-string={this.stockString}
                          no-stock-string={this.noStockString}
                          select-string={this.selectString}
                          remaining-string={this.remainingString}
                          order-missing-string={this.orderMissingString}
                          available-string={this.availableString}
                          unavailable-string={this.unavailableString}
                          confirmed-string={this.confirmedString}
                          confirm-all-string={this.confirmAllString}
                          reset-all-string={this.resetAllString}>
      </line-stock-manager>
    ];
  }

  getPostCreate(){
    if (this.isCreate())
      return;
    return this.getInputs();
  }

  getManage() {
    if (this.isCreate())
      return;
    return (
      <line-stock-manager lines={typeof this.orderLines !== 'string' ? this.orderLines : []}
                          show-stock={this.getType() === SHIPMENT_TYPE.RECEIVED}
                          stock-string={this.stockString}
                          no-stock-string={this.noStockString}
                          select-string={this.selectString}
                          remaining-string={this.remainingString}
                          order-missing-string={this.orderMissingString}
                          available-string={this.availableString}
                          unavailable-string={this.unavailableString}
                          confirmed-string={this.confirmedString}
                          confirm-all-string={this.confirmAllString}
                          reset-all-string={this.resetAllString}>
      </line-stock-manager>
    )
  }

  getView() {
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <create-manage-view-layout create-title-string={this.titleString}
                                   manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   create-string={this.createString}
                                   clear-string={this.clearString}
                                   icon-name="layers"
                                   is-create={this.isCreate()}
                                   onGoBackEvent={(evt) => this.navigateBack(evt)}
                                   onCreateEvent={(evt) => this.create(evt)}>
          <div slot="create">
            {...this.getCreate()}
          </div>
          <div slot="postcreate">
            {...this.getPostCreate()}
          </div>
          <div slot="manage">
            {this.getManage()}
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
        <pdm-barcode-scanner-controller barcode-title={this.scanString}></pdm-barcode-scanner-controller>
      </Host>
    );
  }
}