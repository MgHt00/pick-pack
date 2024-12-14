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

  removeClass(targetElements = null, className) {
    console.log("removeClass()");
    if (!targetElements) return this; // Return early if no elements are provided

    // Ensure targetElements is an array
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach(element => {
      element.classList.remove(className);
    });
    
    return this;
  }

  addClass(targetElements = null, className) {
    console.log("addClass()");
    if (!targetElements) return this; // Return early if no elements are provided

    // Ensure targetElements is an array
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach(element => {
      element.classList.add(className);
    });

    return this;
  }

  insertInnerHTML(targetElement, content) {
    targetElement.innerHtml = content;
    return this;
  }

  insertTextContent(targetElement, content) {
    targetElement.textContent = content;
    return this;
  }

  resetOrderInput() {
    this.orderInput.value = "";
    this.orderInput.focus();
    return this;
  }
}