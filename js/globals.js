import { classManager, contentManager } from "./generals.js";

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

  // hide functions
  hideFrameOrderMessage() {
    console.info("hideFrameOrderMessage()");
    return this.addClass(this.frameOrderMessage, "hidden"); // The preceding `return this` enables method chaining.
  }

  hideFrameSKUContainer() {
    console.info("hideFrameSKUContainer()");
    return this.addClass(this.frameSKUContainer, "hidden");
  }

  hideFrameProgressContainer() {
    console.info("hideFrameProgressContainer()");
    return this.addClass(this.frameProgressContainer, "hidden");
  }

  hideFrameScanBarcode() {
    console.info("hideFrameScanBarcode()");
    return this.addClass(this.frameScanBarcode, "hidden");
  }

  // show functions
  showFrameOrderMessage() {
    console.info("showFrameOrderMessage()");
    return this.removeClass(this.frameOrderMessage, "hidden"); 
  }

  showFrameSKUContainer() {
    console.info("showFrameSKUContainer()");
    return this.removeClass(this.frameSKUContainer, "hidden"); 
  }

  showFrameProgressContainer() {
    console.info("showFrameProgressContainer()");
    return this.removeClass(this.frameProgressContainer, "hidden"); 
  }

  showFrameScanBarcode() {
    console.info("showFrameScanBarcoder()");
    return this.removeClass(this.frameScanBarcode, "hidden"); 
  }

  // class changes functions
  addClassToOrderMessage(className) {
    console.info("addClassToOrderMessage():", className);
    return this.addClass(this.orderMessage, className);
  }

  removeClassFromOrderMessage(className) {
    console.info("removeClassFromOrderMessage():", className);
    return this.removeClass(this.orderMessage, className);
  }

  changeBarcodeBundleClass({mode, className}) {
    console.info(`changeBarcodeBundleClass(): mode: ${mode}, className: ${className}`);
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
        console.warn("Invalid mode.");
        return this;
    }
  }

  // text insertion functions
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
    console.info("disableBarcodeInput()");
    this.barcodeInput.disabled = false;
    return this;
  }

  disableBarcodeInput() {
    console.info("disableBarcodeInput()");
    this.barcodeInput.disabled = true;
    return this;
  }

  disableCheckBarcodeBtn() {
    console.info("disableCheckBarcodeBtn()");
    this.checkBarcodeBtn.disabled = true;
    return this;
  }
}

Object.assign(Global.prototype, classManager, contentManager);