/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { OverlayEventDetail } from "@ionic/core";
export namespace Components {
    interface BarcodeGenerator {
        "data": any;
        "includeText"?: boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "title": string;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type": string;
    }
    interface BatchChip {
        "expiryThreshold"?: number;
        "gtinBatch": string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
    }
    interface ManagedBatchListItem {
        "gtinBatch": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedIssuedShipment {
        "availableString": string;
        "confirmedString": string;
        "delayString": string;
        "detailsString": string;
        "noStockString": string;
        "proceedString": string;
        "productsString": string;
        "refresh": () => Promise<void>;
        "rejectString": string;
        "remainingString": string;
        "selectOrderLine": (gtin: any) => Promise<void>;
        "selectProductString": string;
        "shipmentId": string;
        "stockString": string;
        "titleString": string;
        "unavailableString": string;
    }
    interface ManagedOrderlineListItem {
        "orderLine": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedOrderlineStockChip {
        "available"?: number;
        "button"?: string;
        "gtin": string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
        "threshold"?: number;
    }
    interface ManagedProductListItem {
        "gtin": string;
        "refresh": () => Promise<void>;
    }
    interface ManagedReceivedOrder {
        "availableString": string;
        "confirmedString": string;
        "delayString": string;
        "detailsString": string;
        "noStockString": string;
        "orderId": string;
        "proceedString": string;
        "productsString": string;
        "refresh": () => Promise<void>;
        "rejectString": string;
        "remainingString": string;
        "selectOrderLine": (gtin: any) => Promise<void>;
        "selectProductString": string;
        "stockString": string;
        "titleString": string;
        "unavailableString": string;
    }
    interface ManagedReceivedOrderListItem {
        "orderId": string;
        "orderlineCount"?: number;
        "refresh": () => Promise<void>;
    }
    interface ManagedShipmentListItem {
        "refresh": () => Promise<void>;
        "shipmentId": string;
        "shipmentLineCount"?: number;
        "type"?: string;
    }
    interface ManagedStockListItem {
        "gtin": string;
        "refresh": () => Promise<void>;
    }
    interface MenuTabButton {
        "badge"?: number;
        "iconName"?: string;
        "label"?: string;
        "mode"?: string;
        "tab": string;
    }
    interface MoreChip {
        "color"?: string;
        "float"?: string;
        "iconName"?: string;
        "outline"?: boolean;
        "text"?: string;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmIonTable {
        "buttons"?: string[];
        /**
          * Shows the search bar or not. (not working)
         */
        "canQuery"?: boolean;
        "currentPage"?: number;
        "iconName"?: string;
        /**
          * Option props to be passed to child elements in 'key1:attr1;key2:attr2' format
         */
        "itemProps"?: string;
        /**
          * if the {@link PdmIonTable} is set to mode:  - {@link ION_TABLE_MODES.BY_REF}: must be the querying attribute name so the items can query their own value  - {@link ION_TABLE_MODES.BY_MODEL}: must be the model chain for content list
         */
        "itemReference": string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType": string;
        "itemsPerPage"?: number;
        "loadingMessage": string;
        /**
          * sets the name of the manager to use Only required if mode if {@link PdmIonTable#mode} is set to {@link ION_TABLE_MODES.BY_REF}
         */
        "manager"?: string;
        /**
          * can be any of {@link ION_TABLE_MODES} Decides if the tables works by:  - {@link ION_TABLE_MODES.BY_MODEL}: uses the WebCardinal model api
         */
        "mode": string;
        "noContentMessage": string;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "refresh": () => Promise<void>;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "title": string;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "markAsLoaded": (evt: any) => Promise<void>;
        "timeout"?: number;
        "updateStatus": (evt: any) => Promise<void>;
    }
}
declare global {
    interface HTMLBarcodeGeneratorElement extends Components.BarcodeGenerator, HTMLStencilElement {
    }
    var HTMLBarcodeGeneratorElement: {
        prototype: HTMLBarcodeGeneratorElement;
        new (): HTMLBarcodeGeneratorElement;
    };
    interface HTMLBatchChipElement extends Components.BatchChip, HTMLStencilElement {
    }
    var HTMLBatchChipElement: {
        prototype: HTMLBatchChipElement;
        new (): HTMLBatchChipElement;
    };
    interface HTMLManagedBatchListItemElement extends Components.ManagedBatchListItem, HTMLStencilElement {
    }
    var HTMLManagedBatchListItemElement: {
        prototype: HTMLManagedBatchListItemElement;
        new (): HTMLManagedBatchListItemElement;
    };
    interface HTMLManagedIssuedShipmentElement extends Components.ManagedIssuedShipment, HTMLStencilElement {
    }
    var HTMLManagedIssuedShipmentElement: {
        prototype: HTMLManagedIssuedShipmentElement;
        new (): HTMLManagedIssuedShipmentElement;
    };
    interface HTMLManagedOrderlineListItemElement extends Components.ManagedOrderlineListItem, HTMLStencilElement {
    }
    var HTMLManagedOrderlineListItemElement: {
        prototype: HTMLManagedOrderlineListItemElement;
        new (): HTMLManagedOrderlineListItemElement;
    };
    interface HTMLManagedOrderlineStockChipElement extends Components.ManagedOrderlineStockChip, HTMLStencilElement {
    }
    var HTMLManagedOrderlineStockChipElement: {
        prototype: HTMLManagedOrderlineStockChipElement;
        new (): HTMLManagedOrderlineStockChipElement;
    };
    interface HTMLManagedProductListItemElement extends Components.ManagedProductListItem, HTMLStencilElement {
    }
    var HTMLManagedProductListItemElement: {
        prototype: HTMLManagedProductListItemElement;
        new (): HTMLManagedProductListItemElement;
    };
    interface HTMLManagedReceivedOrderElement extends Components.ManagedReceivedOrder, HTMLStencilElement {
    }
    var HTMLManagedReceivedOrderElement: {
        prototype: HTMLManagedReceivedOrderElement;
        new (): HTMLManagedReceivedOrderElement;
    };
    interface HTMLManagedReceivedOrderListItemElement extends Components.ManagedReceivedOrderListItem, HTMLStencilElement {
    }
    var HTMLManagedReceivedOrderListItemElement: {
        prototype: HTMLManagedReceivedOrderListItemElement;
        new (): HTMLManagedReceivedOrderListItemElement;
    };
    interface HTMLManagedShipmentListItemElement extends Components.ManagedShipmentListItem, HTMLStencilElement {
    }
    var HTMLManagedShipmentListItemElement: {
        prototype: HTMLManagedShipmentListItemElement;
        new (): HTMLManagedShipmentListItemElement;
    };
    interface HTMLManagedStockListItemElement extends Components.ManagedStockListItem, HTMLStencilElement {
    }
    var HTMLManagedStockListItemElement: {
        prototype: HTMLManagedStockListItemElement;
        new (): HTMLManagedStockListItemElement;
    };
    interface HTMLMenuTabButtonElement extends Components.MenuTabButton, HTMLStencilElement {
    }
    var HTMLMenuTabButtonElement: {
        prototype: HTMLMenuTabButtonElement;
        new (): HTMLMenuTabButtonElement;
    };
    interface HTMLMoreChipElement extends Components.MoreChip, HTMLStencilElement {
    }
    var HTMLMoreChipElement: {
        prototype: HTMLMoreChipElement;
        new (): HTMLMoreChipElement;
    };
    interface HTMLMultiSpinnerElement extends Components.MultiSpinner, HTMLStencilElement {
    }
    var HTMLMultiSpinnerElement: {
        prototype: HTMLMultiSpinnerElement;
        new (): HTMLMultiSpinnerElement;
    };
    interface HTMLPdmIonTableElement extends Components.PdmIonTable, HTMLStencilElement {
    }
    var HTMLPdmIonTableElement: {
        prototype: HTMLPdmIonTableElement;
        new (): HTMLPdmIonTableElement;
    };
    interface HTMLPdmSsappLoaderElement extends Components.PdmSsappLoader, HTMLStencilElement {
    }
    var HTMLPdmSsappLoaderElement: {
        prototype: HTMLPdmSsappLoaderElement;
        new (): HTMLPdmSsappLoaderElement;
    };
    interface HTMLElementTagNameMap {
        "barcode-generator": HTMLBarcodeGeneratorElement;
        "batch-chip": HTMLBatchChipElement;
        "managed-batch-list-item": HTMLManagedBatchListItemElement;
        "managed-issued-shipment": HTMLManagedIssuedShipmentElement;
        "managed-orderline-list-item": HTMLManagedOrderlineListItemElement;
        "managed-orderline-stock-chip": HTMLManagedOrderlineStockChipElement;
        "managed-product-list-item": HTMLManagedProductListItemElement;
        "managed-received-order": HTMLManagedReceivedOrderElement;
        "managed-received-order-list-item": HTMLManagedReceivedOrderListItemElement;
        "managed-shipment-list-item": HTMLManagedShipmentListItemElement;
        "managed-stock-list-item": HTMLManagedStockListItemElement;
        "menu-tab-button": HTMLMenuTabButtonElement;
        "more-chip": HTMLMoreChipElement;
        "multi-spinner": HTMLMultiSpinnerElement;
        "pdm-ion-table": HTMLPdmIonTableElement;
        "pdm-ssapp-loader": HTMLPdmSsappLoaderElement;
    }
}
declare namespace LocalJSX {
    interface BarcodeGenerator {
        "data"?: any;
        "includeText"?: boolean;
        "scale"?: any;
        /**
          * description: `The size of the barcode in mm. Default is set to 32 mm.`, isMandatory: false, propertyType: `integer`
         */
        "size"?: any;
        /**
          * description: `A title that will be used for the current component instance.`, isMandatory: false, propertyType: `string`
         */
        "title"?: string;
        /**
          * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`, isMandatory: true, propertyType: `string`
         */
        "type"?: string;
    }
    interface BatchChip {
        "expiryThreshold"?: number;
        "gtinBatch"?: string;
        "loaderType"?: string;
        "mode"?: string;
        "quantity"?: number;
    }
    interface ManagedBatchListItem {
        "gtinBatch"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedIssuedShipment {
        "availableString"?: string;
        "confirmedString"?: string;
        "delayString"?: string;
        "detailsString"?: string;
        "noStockString"?: string;
        /**
          * Through this event shipment creation requests are made
         */
        "onCreated"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event shipment rejection requests are made
         */
        "onRejected"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSendNavigateTab"?: (event: CustomEvent<any>) => void;
        "proceedString"?: string;
        "productsString"?: string;
        "rejectString"?: string;
        "remainingString"?: string;
        "selectProductString"?: string;
        "shipmentId"?: string;
        "stockString"?: string;
        "titleString"?: string;
        "unavailableString"?: string;
    }
    interface ManagedOrderlineListItem {
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        "orderLine"?: string;
    }
    interface ManagedOrderlineStockChip {
        "available"?: number;
        "button"?: string;
        "gtin"?: string;
        "loaderType"?: string;
        "mode"?: string;
        /**
          * Through this event actions are passed
         */
        "onSendAction"?: (event: CustomEvent<OverlayEventDetail>) => void;
        "quantity"?: number;
        "threshold"?: number;
    }
    interface ManagedProductListItem {
        "gtin"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
    }
    interface ManagedReceivedOrder {
        "availableString"?: string;
        "confirmedString"?: string;
        "delayString"?: string;
        "detailsString"?: string;
        "noStockString"?: string;
        /**
          * Through this event shipment creation requests are made
         */
        "onCreated"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event shipment rejection requests are made
         */
        "onRejected"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSendNavigateTab"?: (event: CustomEvent<any>) => void;
        "orderId"?: string;
        "proceedString"?: string;
        "productsString"?: string;
        "rejectString"?: string;
        "remainingString"?: string;
        "selectProductString"?: string;
        "stockString"?: string;
        "titleString"?: string;
        "unavailableString"?: string;
    }
    interface ManagedReceivedOrderListItem {
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        "orderId"?: string;
        "orderlineCount"?: number;
    }
    interface ManagedShipmentListItem {
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSendNavigateTab"?: (event: CustomEvent<any>) => void;
        "shipmentId"?: string;
        "shipmentLineCount"?: number;
        "type"?: string;
    }
    interface ManagedStockListItem {
        "gtin"?: string;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
    }
    interface MenuTabButton {
        "badge"?: number;
        "iconName"?: string;
        "label"?: string;
        "mode"?: string;
        /**
          * Through this event navigation requests to tabs are made
         */
        "onSsapp-navigate-tab"?: (event: CustomEvent<any>) => void;
        "tab"?: string;
    }
    interface MoreChip {
        "color"?: string;
        "float"?: string;
        "iconName"?: string;
        /**
          * Through this event errors are passed
         */
        "onShowMoreEvent"?: (event: CustomEvent<any>) => void;
        "outline"?: boolean;
        "text"?: string;
    }
    interface MultiSpinner {
        "type"?: string;
    }
    interface PdmIonTable {
        "buttons"?: string[];
        /**
          * Shows the search bar or not. (not working)
         */
        "canQuery"?: boolean;
        "currentPage"?: number;
        "iconName"?: string;
        /**
          * Option props to be passed to child elements in 'key1:attr1;key2:attr2' format
         */
        "itemProps"?: string;
        /**
          * if the {@link PdmIonTable} is set to mode:  - {@link ION_TABLE_MODES.BY_REF}: must be the querying attribute name so the items can query their own value  - {@link ION_TABLE_MODES.BY_MODEL}: must be the model chain for content list
         */
        "itemReference"?: string;
        /**
          * The tag for the item type that the table should use eg: 'li' would create list items
         */
        "itemType"?: string;
        "itemsPerPage"?: number;
        "loadingMessage"?: string;
        /**
          * sets the name of the manager to use Only required if mode if {@link PdmIonTable#mode} is set to {@link ION_TABLE_MODES.BY_REF}
         */
        "manager"?: string;
        /**
          * can be any of {@link ION_TABLE_MODES} Decides if the tables works by:  - {@link ION_TABLE_MODES.BY_MODEL}: uses the WebCardinal model api
         */
        "mode"?: string;
        "noContentMessage"?: string;
        /**
          * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
         */
        "onGetModelEvent"?: (event: CustomEvent<any>) => void;
        /**
          * Through this event errors are passed
         */
        "onSendErrorEvent"?: (event: CustomEvent<any>) => void;
        "pageCount"?: number;
        "paginated"?: boolean;
        /**
          * Querying/paginating Params - only available when mode is set by ref
         */
        "query"?: string;
        "sort"?: string;
        /**
          * Graphical Params
         */
        "title"?: string;
    }
    interface PdmSsappLoader {
        "loader"?: string;
        "timeout"?: number;
    }
    interface IntrinsicElements {
        "barcode-generator": BarcodeGenerator;
        "batch-chip": BatchChip;
        "managed-batch-list-item": ManagedBatchListItem;
        "managed-issued-shipment": ManagedIssuedShipment;
        "managed-orderline-list-item": ManagedOrderlineListItem;
        "managed-orderline-stock-chip": ManagedOrderlineStockChip;
        "managed-product-list-item": ManagedProductListItem;
        "managed-received-order": ManagedReceivedOrder;
        "managed-received-order-list-item": ManagedReceivedOrderListItem;
        "managed-shipment-list-item": ManagedShipmentListItem;
        "managed-stock-list-item": ManagedStockListItem;
        "menu-tab-button": MenuTabButton;
        "more-chip": MoreChip;
        "multi-spinner": MultiSpinner;
        "pdm-ion-table": PdmIonTable;
        "pdm-ssapp-loader": PdmSsappLoader;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "barcode-generator": LocalJSX.BarcodeGenerator & JSXBase.HTMLAttributes<HTMLBarcodeGeneratorElement>;
            "batch-chip": LocalJSX.BatchChip & JSXBase.HTMLAttributes<HTMLBatchChipElement>;
            "managed-batch-list-item": LocalJSX.ManagedBatchListItem & JSXBase.HTMLAttributes<HTMLManagedBatchListItemElement>;
            "managed-issued-shipment": LocalJSX.ManagedIssuedShipment & JSXBase.HTMLAttributes<HTMLManagedIssuedShipmentElement>;
            "managed-orderline-list-item": LocalJSX.ManagedOrderlineListItem & JSXBase.HTMLAttributes<HTMLManagedOrderlineListItemElement>;
            "managed-orderline-stock-chip": LocalJSX.ManagedOrderlineStockChip & JSXBase.HTMLAttributes<HTMLManagedOrderlineStockChipElement>;
            "managed-product-list-item": LocalJSX.ManagedProductListItem & JSXBase.HTMLAttributes<HTMLManagedProductListItemElement>;
            "managed-received-order": LocalJSX.ManagedReceivedOrder & JSXBase.HTMLAttributes<HTMLManagedReceivedOrderElement>;
            "managed-received-order-list-item": LocalJSX.ManagedReceivedOrderListItem & JSXBase.HTMLAttributes<HTMLManagedReceivedOrderListItemElement>;
            "managed-shipment-list-item": LocalJSX.ManagedShipmentListItem & JSXBase.HTMLAttributes<HTMLManagedShipmentListItemElement>;
            "managed-stock-list-item": LocalJSX.ManagedStockListItem & JSXBase.HTMLAttributes<HTMLManagedStockListItemElement>;
            "menu-tab-button": LocalJSX.MenuTabButton & JSXBase.HTMLAttributes<HTMLMenuTabButtonElement>;
            "more-chip": LocalJSX.MoreChip & JSXBase.HTMLAttributes<HTMLMoreChipElement>;
            "multi-spinner": LocalJSX.MultiSpinner & JSXBase.HTMLAttributes<HTMLMultiSpinnerElement>;
            "pdm-ion-table": LocalJSX.PdmIonTable & JSXBase.HTMLAttributes<HTMLPdmIonTableElement>;
            "pdm-ssapp-loader": LocalJSX.PdmSsappLoader & JSXBase.HTMLAttributes<HTMLPdmSsappLoaderElement>;
        }
    }
}
