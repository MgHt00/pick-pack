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

  // Helper Functions
  toggleFrameVisibility(mode, target) {
    const stack = new Error().stack;     // (For console.log) To get the stack trace and parse the caller's function name dynamically.
    const callerName = stack.split("\n")[2]?.trim().split(" ")[1] || "Unknown";

    console.info(`toggleFrameVisibility() called by ${callerName}, mode: ${mode}`);

    switch(mode) {
      case "show":
        return this.removeClass(target, "hidden"); // The preceding `return this` enables method chaining.
      case "hide":
        return this.addClass(target, "hidden"); 
      default:
        console.warn("Invalid mode. Use 'show' or 'hide'.");
        return this;
    }
  }

  toggleClass(mode, className, target) {

  }

  // Visibility changes functions
  toggleFrameOrderMessage(mode) {
    return this.toggleFrameVisibility(mode, this.frameOrderMessage);
  }

  toggleFrameSKUContainer(mode) {
    return this.toggleFrameVisibility(mode, this.frameSKUContainer);
  }

  toggleFrameProgressContainer(mode) {
    return this.toggleFrameVisibility(mode, this.frameProgressContainer);
  }

  toggleFrameScanBarcode(mode) {
    return this.toggleFrameVisibility(mode, this.frameScanBarcode);
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

Object.assign(Global.prototype, classManager, contentManager);