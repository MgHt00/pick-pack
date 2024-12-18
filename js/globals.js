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
    this.successMessage = "All SKUs matched with barcodes successfully.";
  }

  readOrderInputValue() {
    console.info("Order input:", document.querySelector("#order-input").value);
    return document.querySelector("#order-input").value;
  }

  resetOrderInput() {
    this.orderInput.value = "";
    this.orderInput.focus();
    return this;
  }

  // Visibility changes functions
  toggleVisibility(targetElements = [], mode) {
    targetElements = this.checkArray(targetElements);

    targetElements.forEach(element => {
      this.toggleTargetVisibility({mode, target: element});
    });
    return this;
  }

  toggleClass(targetElements = [], mode) {

  }

  // class changes functions
  /*toggleOrderMessageClass(mode, className) {
    return this.toggleClass({mode, className, target: this.orderMessage})
  }

  addClassToOrderMessage(className) {
    console.info("addClassToOrderMessage():", className);
    return this.addClass(this.orderMessage, className);
  }

  removeClassFromOrderMessage(className) {
    console.info("removeClassFromOrderMessage():", className);
    return this.removeClass(this.orderMessage, className);
  }*/

  toggleBarcodeBundle({mode, className}) {
    console.info(`toggleBarcodeBundle(): mode: ${mode}, className: ${className}`);
    switch (mode) {
      case "add":
        return this.addClass([
          this.barcodeInputTop, 
          this.barcodeLabel
        ], className);

      case "remove":
        return this.removeClass([
          this.barcodeInputTop, 
          this.barcodeLabel
        ], className);

      default:
        console.warn("Invalid mode. Use 'add' or 'remove'.");
        return this;
    }
  }

  // text manipulation functions
  emptyInnerHTML(targetElements = []) {
    console.info("emptyInnerHTML()");
    targetElements = this.checkAndConvertArray(targetElements);
  }

  updateOrderMessage(content) {
    console.info("orderMessageContent():", content);
    return this.insertTextContent(this.orderMessage, content);
  }
  
  setOrderMessageInnerHTML(content) {
    console.info("updateOrderMessageInnerHTML():", content);
    return this.insertInnerHTML(this.orderMessage, content);
  }

  // enable / disable functions
  enableBarcodeInput() {
    console.info("enableBarcodeInput()");
    this.barcodeInput.disabled = false;
    return this;
  }

  disableBarcodeInput() {
    console.info("disableBarcodeInput()");
    this.barcodeInput.disabled = true;
    return this;
  }

  enableCheckBarcodeBtn() {
    console.info("enableCheckBarcodeBtn()");
    this.checkBarcodeBtn.disabled = false;
    return this;
  }

  disableCheckBarcodeBtn() {
    console.info("disableCheckBarcodeBtn()");
    this.checkBarcodeBtn.disabled = true;
    return this;
  }
}

Object.assign(Global.prototype, cssClassManager, contentManager);