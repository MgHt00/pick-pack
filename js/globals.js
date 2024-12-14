import { classManager } from "./generals.js";

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
    console.log(document.querySelector("#order-input").value);
    return document.querySelector("#order-input").value;
  }

  resetOrderInput() {
    this.orderInput.value = "";
    this.orderInput.focus();
    return this;
  }

  // hide functions
  hideFrameOrderMessage() {
    console.log("hideFrameOrderMessage()");
    return this.addClass(this.frameOrderMessage, "hidden"); // The preceding `return this` enables method chaining.
  }

  hideFrameSKUContainer() {
    console.log("hideFrameSKUContainer()");
    return this.addClass(this.frameSKUContainer, "hidden");
  }

  hideFrameProgressContainer() {
    console.log("hideFrameProgressContainer()");
    return this.addClass(this.frameProgressContainer, "hidden");
  }

  hideFrameScanBarcode() {
    console.log("hideFrameScanBarcode()");
    return this.addClass(this.frameScanBarcode, "hidden");
  }

  // show functions
  showFrameOrderMessage() {
    console.log("showFrameOrderMessage()");
    return this.removeClass(this.frameOrderMessage, "hidden"); 
  }

  showFrameSKUContainer() {
    console.log("showFrameSKUContainer()");
    return this.removeClass(this.frameSKUContainer, "hidden"); 
  }

  showFrameProgressContainer() {
    console.log("showFrameProgressContainer()");
    return this.removeClass(this.frameProgressContainer, "hidden"); 
  }

  showFrameScanBarcode() {
    console.log("showFrameScanBarcoder()");
    return this.removeClass(this.frameScanBarcode, "hidden"); 
  }

  // text insertion functions
  updateOrderMessage(content) {
    console.log("orderMessageContent()");
    return this.insertTextContent(this.orderMessage, content);
  }

  // other functions
  insertInnerHTML(targetElement, content) {
    targetElement.innerHtml = content;
    return this;
  }

  
}

Object.assign(Global.prototype, classManager);