import { cssClassManager, contentManager} from "./generals.js";

export default class Global {
  constructor() {
    this.bodyElement = document.body;
    this.headerElement = document.querySelector("#frame-header");
    this.frameLoadOrder = document.querySelector("#frame-load-order");
    this.orderInput = document.querySelector("#order-input");
    this.loadOrderBtn = document.querySelector("#load-order-btn");
    this.resetBtn = document.querySelector("#reset-btn");
    this.frameSKUContainer = document.querySelector("#frame-SKU-container");
    this.frameScanBarcode = document.querySelector("#frame-scan-barcode");
    this.barcodeInputTop = document.querySelector("#barcode-input-top");
    this.barcodeLabel = document.querySelector("#barcode-label");
    this.barcodeInput = document.querySelector("#barcode-input");
    this.checkBarcodeBtn = document.querySelector("#check-barcode-btn");
    this.frameOrderMessage = document.querySelector("#frame-order-message");
    this.orderMessage = document.querySelector("#order-message");
    this.frameProgressContainer = document.querySelector("#frame-progress-container");
  }

  readOrderInputValue() {
    console.info("Order input:", document.querySelector("#order-input").value);
    return document.querySelector("#order-input").value;
  }

  readBarcodeInputValue() {
    return document.querySelector("#barcode-input").value;
  }

  // Visibility changes functions
  toggleVisibility(targetElements = [], mode) { // expected mode -> "show", "hide"
    targetElements = cssClassManager.checkArray(targetElements);

    targetElements.forEach(element => {
      cssClassManager.toggleTargetVisibility({mode, target: element});
    });
    return this;
  }

  toggleDisability(targetElements = [], mode) { // expected mode -> "disabled", "enabled"
    targetElements = cssClassManager.checkArray(targetElements);

    targetElements.forEach(element => {
      cssClassManager.toggleTargetDisability({mode, target: element});
    });
    return this;
  }

  toggleClass({targetElements = [], mode, className}) { // expecte mode -> "add", "remove"
    targetElements = cssClassManager.checkArray(targetElements);

    targetElements.forEach(element => {
      cssClassManager.toggleTargetClass({mode, className, target: element}); 
    });
    return this;
  }

  emptyAllClass(targetElements = []) {
    targetElements = cssClassManager.checkArray(targetElements);
    cssClassManager.emptyCSSClass(targetElements);
    return this;
  }  

  // text manipulation functions
  emptyInnerHTML(targetElements = []) {
    console.info("emptyInnerHTML()");
    targetElements = cssClassManager.checkArray(targetElements);
    targetElements.forEach(element => {
      this.insertInnerHTML(element, "");
    });
    return this;
  }
  
  // enable / disable functions
  
}

Object.assign(Global.prototype, cssClassManager, contentManager);