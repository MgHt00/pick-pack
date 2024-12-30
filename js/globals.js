import { cssClassManager, contentManager} from "./generals.js";

export default class Global {
  constructor() {
    this.bodyElement = document.body;
    this.headerElement = this.safeQuerySelector("#frame-header");
    this.frameLoadOrder = this.safeQuerySelector("#frame-load-order");
    this.orderInput = this.safeQuerySelector("#order-input");
    this.loadOrderBtn = this.safeQuerySelector("#load-order-btn");
    this.resetBtn = this.safeQuerySelector("#reset-btn");
    this.frameSKUContainer = this.safeQuerySelector("#frame-SKU-container");
    this.frameScanBarcode = this.safeQuerySelector("#frame-scan-barcode");
    this.barcodeInputTop = this.safeQuerySelector("#barcode-input-top");
    this.barcodeLabel = this.safeQuerySelector("#barcode-label");
    this.barcodeInput = this.safeQuerySelector("#barcode-input");
    this.checkBarcodeBtn = this.safeQuerySelector("#check-barcode-btn");
    this.frameOrderMessage = this.safeQuerySelector("#frame-order-message");
    this.orderMessage = this.safeQuerySelector("#order-message");
    this.frameProgressContainer = this.safeQuerySelector("#frame-progress-container");
  }

  safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`Element with selector '${selector}' not found.`);
    }
    return element;
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

  toggleVisibilityWithClass(element, visibility, className = "", mode = "add") {
    this.toggleVisibility(element, visibility);
    if (className) {
      this.toggleClass({
        targetElements: element,
        mode: mode,
        className: className,
      });
    }
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
  
  displayMessageWithClass(element, message, className) {
    this
      .insertInnerHTML(element, message)
      .toggleClass({
        targetElements: element,
        mode: "add",
        //className: `${type}-message`,
        className: className,
      });
  }

  // enable / disable functions
  
}

Object.assign(Global.prototype, cssClassManager, contentManager);