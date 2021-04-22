import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {EVENT_SEND_ERROR} from "../../constants/events";

const Product = wizard.Model.Product;
const Batch = wizard.Model.Batch;

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
    eventName: EVENT_SEND_ERROR,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err){
      console.log(`Product Component: ${message}`, err);
    }
  }

  @Prop() gtin: string;

  private productManager: WebManager = undefined;
  private batchManager: WebManager = undefined;

  @State() product: typeof Product = undefined;
  @State() batches: typeof Batch[] = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }

  async loadBatch(){
    let self = this;
    if (!self.productManager)
      return;
    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err){
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.product = product;
      self.batchManager.getAll(true, {query: `gtin == ${self.gtin}`}, (err, batches) => {
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
    await this.loadBatch();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.product || !self.product.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.product.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!self.product || !self.product.gtin)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{self.product.gtin}</h3>)
    }

    const getNameLabel = function(){
      if (!self.product || !self.product.name)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.product.name}</h5>)
    }

    const getDescriptionLabel = function(){
      if (!self.product || !self.product.description)
        return (<p><ion-skeleton-text animated></ion-skeleton-text> </p>)
      return (<p>{self.product.description}</p>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getGtinLabel()}
        {getNameLabel()}
        {getDescriptionLabel()}
      </ion-label>)
  }

  addBatch(batch){
    return(
      <ion-chip outline color="primary">
        <ion-label className="ion-padding-horizontal">{batch.batchNumber}</ion-label>
      </ion-chip>
    )
  }

  addBatches(){
    const batches = !!this.product && !!this.batches ? this.batches.map(b => this.addBatch(b)) : (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <ion-grid className="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12">
            {batches}
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.product)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary">
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons className="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item className="ion-align-self-center">
          {this.addBarCode()}
          {this.addLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}