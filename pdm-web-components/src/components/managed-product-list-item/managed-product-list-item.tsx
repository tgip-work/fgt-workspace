import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const Product = wizard.Model.Product;

@Component({
  tag: 'managed-product-list-item',
  styleUrl: 'managed-product-list-item.css',
  shadow: false,
})
export class ManagedProductListItem {

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

  @Prop() gtin: string;

  private productManager: WebManager = undefined;
  private batchManager: WebManager = undefined;

  @State() product: typeof Product = undefined;
  @State() batches: string[] = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadProduct();
  }

  async loadProduct(){
    let self = this;
    if (!self.productManager)
      return;
    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err){
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.product = product;
      self.batchManager.getAll(false, {query: `gtin == ${self.gtin}`}, (err, batches) => {
        if (err){
          self.sendError(`Could not load batches for product ${self.gtin}`);
          return;
        }
        self.batches = batches;
      });
    });
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.loadProduct();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.product || !self.product.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.product.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail class="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!self.product || !self.product.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.product.gtin
    }

    const getNameLabel = function(){
      if (!self.product || !self.product.name)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.product.name;
    }

    return(
      <ion-label color="secondary">
        {getGtinLabel()}
        <span class="ion-padding-start">{getNameLabel()}</span>
        {getNameLabel()}
      </ion-label>)
  }

  addBatch(gtinBatch){
    return(
      <batch-chip gtin-batch={gtinBatch} loader-type={SUPPORTED_LOADERS.bubblingSmall} mode="detail"></batch-chip>
    )
  }

  addBatches(){
    const batches = !!this.product && !!this.batches ? this.batches.filter((b,i) => !!b && i <= 2).map(b => this.addBatch(b)) : (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <div class="ion-padding-horizontal flex ion-justify-content-between ion-align-items-center">
        {batches}
      </div>
    )
  }

  addButtons(){
    let self = this;

    const getButton = function(slot, color, icon, handler){
      if (!self.product)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons slot="end">
        {getButton("secondary", "medium", "barcode", () => console.log(`This should show a bar code`))}
        {getButton("secondary", "medium", "eye", () => self.navigateToTab('tab-batches', {gtin: self.gtin}))}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item class="ion-margin-bottom" lines="none" color="light">
          {/*{this.addBarCode()}*/}
          {this.addLabel()}
          <div class="ion-padding flex">
            {this.addBatches()}
          </div>
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}
