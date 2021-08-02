import {Component, Host, h, Prop, State, Element, Event, EventEmitter, Listen, Method} from '@stencil/core';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {HostElement} from "../../decorators";
import {getProductPopOver} from "../../utils/popOverUtils";
import wizard from "../../services/WizardService";

const {Stock, IndividualProduct, Batch} = wizard.Model;

@Component({
  tag: 'managed-stock-product-input',
  styleUrl: 'managed-stock-product-input.css',
  shadow: false,
})
export class ManagedStockProductInput {

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

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  @Prop({attribute: 'name'}) name: string;
  @Prop({attribute: 'required'}) required: boolean = false;
  @Prop({attribute: 'disabled'}) disabled: boolean = false;

  @Prop({attribute: 'lines'}) lines: 'none' | 'inset' | 'full'  = 'inset';
  @Prop({attribute: 'label-position'}) labelPosition: "fixed" | "floating" | "stacked" = 'floating';

  // strings
  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';
  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';
  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';
  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';


  // Directory Variables
  private stockManager: WebManager = undefined;
  private batchManager: WebManager = undefined;
  @State() products?: (typeof IndividualProduct)[] = [];

  @State() stock?: string[] = undefined;

  @State() currentGtin?: string = undefined;

  @State() result: string = "[]";

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.stockManager = await WebManagerService.getWebManager('StockManager');
    this.batchManager = await WebManagerService.getWebManager('BatchManager');
  }

  @Listen('ssapp-action')
  async handleAction(evt){
    if (!evt.detail.action)
      return;
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {action, individualProduct} = evt.detail;
    if (action !== 'remove')
      return console.log(`invalid action received`);
    this.removeProduct(individualProduct);
  }

  private removeProduct(product){
    const {gtin, batchNumber, serialNumber} = product;
    this.products = [
      ...this.products
        .filter(p => p.gtin !== gtin && p.batchNumber !== batchNumber && p.serialNumber !== serialNumber)
    ];
  }

  private addProduct(gtin: string | {}){
    const self = this;

    const _addProduct = function(p){
      const product = new IndividualProduct({
        gtin: p.gtin,
        batchNumber: p.batchNumber,
        serialNumber: p.serialNumber,
        expiry: p.expiry,
        status: p.status
      });

      const previousProducts: (typeof IndividualProduct)[] = self.products || [];
      self.products = [...previousProducts, product];
    }

    if (typeof gtin !== 'string')
      return _addProduct(gtin);

    self.stockManager.getOne(gtin, true, (err, stock: typeof Stock) => {
      if (err)
        return self.sendError(`No stock found for the selected product ${gtin}`);
      if (stock.getQuantity() < 1)
        return self.sendError(`The current stock for ${gtin} is not enough for ${gtin} items`);
      const sortedBatches = stock.batches.filter(b => b.getQuantity() > 0).sort((a, b) => {
        return b.expiry.getTime() - a.expiry.getTime();
      });

      let batch = sortedBatches[0];
      let serial;

      const __addProduct = function(){
        return _addProduct({
          gtin: gtin,
          batchNumber: batch.batchNumber,
          serialNumber: serial,
          expiry: batch.expiry,
          status: batch.status
        });
      }

      // @ts-ignore
      if (self.stockManager.serialization){
        if (!batch.serialNumbers || !batch.serialNumbers.length)
          return self.sendError(`No serialization found...`);
        serial = batch.serialNumbers[0];
        return __addProduct();
      }

      // @ts-ignore
      self.batchManager.getOne(gtin,batch.batchNumber, true, (err, batch: typeof Batch) => {
        if (err)
          return self.sendError(`Could not retrieve batch information for ${gtin}'s ${batch.batchNumber}`, err);
        serial = batch.serialNumbers[0];
        __addProduct();
      });
    });
  }

  @Method()
  async updateDirectory(gtin = ''){
    const self = this;

    self.stockManager.getAll(false, {
      query: [
        '__timestamp > 0',
        `gtin like /^${gtin}.*$/g`
      ],
      sort: 'dsc'
    }, (err, stocks) => {
      if (err)
        return self.sendError(`Could not Retrieve stock`, err);
      self.stock = [...stocks];
    });
  }

  private async updateProductsInStock(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();

    const self = this;
    self.currentGtin = evt.detail.value;
    await self.updateDirectory(self.currentGtin);
  }

  private async showProductPopOver(evt){
    const popover = await getProductPopOver(evt, this.stock);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.addProduct(role);
  }

  private scan(){
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller')
      || document.querySelector('pdm-barcode-scanner-controller');

    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      if (!scanData)
        return console.log(`No scan data received`);
      console.log(scanData);
      self.addProduct(scanData ? scanData.gtin || scanData.productCode || scanData.result: undefined);
    });
  }

  private getProductInput(){
    return (
      <ion-item lines={this.lines}>
        <ion-label position={this.labelPosition}>
          {this.productsCodeString}
        </ion-label>
        <ion-input id="input-product" name="" type="number" onIonChange={this.updateProductsInStock.bind(this)}></ion-input>
        <ion-buttons slot="end">
          <ion-button onClick={this.scan.bind(this)} color="medium" size="large" fill="clear">

            <ion-icon slot="icon-only" name="scan-circle"></ion-icon>
          </ion-button>
          <ion-button onClick={this.showProductPopOver.bind(this)} disabled={!this.stock || !this.stock.length} color="secondary" size="large" fill="clear">
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    )
  }

  // private getQuantityInput(){
  //   return (
  //     <ion-item lines="none">
  //       <ion-label position="stacked">{this.quantityString}</ion-label>
  //       <ion-grid>
  //         <ion-row>
  //           <ion-col size="10">
  //             <ion-range id="input-quantity-range" name="" min={0} max={Math.max(this.currentQuantity || 0, 100)}
  //                        pin={true} value={this.currentQuantity || 0} color="secondary">
  //               <ion-button slot="start" fill="clear" color="secondary"
  //                           onClick={() => this.currentQuantity--}>
  //                 <ion-icon color="secondary" slot="icon-only" name="remove-circle"></ion-icon>
  //               </ion-button>
  //               <ion-button slot="end" fill="clear" color="secondary"
  //                           onClick={() => this.currentQuantity++}>
  //                 <ion-icon slot="icon-only" name="add-circle"></ion-icon>
  //               </ion-button>
  //             </ion-range>
  //           </ion-col>
  //           <ion-col size="2" class="ion-padding-left">
  //             <ion-input id="input-quantity" name="" type="number" value={this.currentQuantity || 1}></ion-input>
  //           </ion-col>
  //         </ion-row>
  //       </ion-grid>
  //       <ion-button slot="end" size="large" fill="clear" color="success"
  //                   disabled={!this.currentGtin || !this.currentQuantity} onClick={this.addProduct.bind(this)}>
  //         <ion-icon slot="icon-only" name="add-circle"></ion-icon>
  //       </ion-button>
  //     </ion-item>
  //   )
  // }

  private getProductsDisplay(){
    return (
      <ion-list>
        {this.products.map(ip => <managed-individual-product-list-item gtin-btach-serial={`${ip.gtin}-${ip.batchNumber}-${ip.serialNumber}`}></managed-individual-product-list-item>)}
      </ion-list>

    )
  }

  private getInputElement(){
    return (
      <input name={this.name} required={this.required} hidden={true} value={this.result}></input>
    )
  }

  render() {
    return (
      <Host>
        {this.getProductInput()}
        {this.getProductsDisplay()}
        {this.getInputElement()}
      </Host>
    );
  }

}
