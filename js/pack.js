import { consumerKey, consumerSecret } from './config.js';
import Global from './globals.js';

class Local {
  constructor(successMessage) {
    this.orderItems = []; // to fetch all info of an order
    this.orderedSKUs = []; // to keep the ordered SKUs
    this.orderID = 0;
    this.totalSKUs = 0;
    this.successMessage = successMessage;
    this.orderURL= "https://mmls.biz/wp-json/wc/v3/orders/"
    this.noteURLpostfix = "/notes";
  }
}

const globalInstance = new Global();
const localInstance = new Local("All SKUs matched with barcodes successfully.");
const listenerInstance = listenerManager();
const orderInstance = orderManager();
const soundInstance = soundManager();
const utilityInstance = utilityManager();

(function initialize(){
  console.groupCollapsed("initialize()");
  globalInstance
    .toggleVisibility([
      globalInstance.frameOrderMessage,
      globalInstance.frameSKUContainer,
      globalInstance.frameProgressContainer,
      globalInstance.frameScanBarcode,
    ], "hide"); 
    
  listenerInstance
    .loadListeners();

  console.groupEnd();
})();

function listenerManager() {
  function loadListeners() {
    console.info("loadListeners()");

    // To ensure that the DOM is fully loaded before the script executes
    document.addEventListener("DOMContentLoaded", handleDOMloaded);

    // click listeners
    globalInstance.checkBarcodeBtn.addEventListener("click", utilityInstance.checkBarcode);
    globalInstance.loadOrderBtn.addEventListener("click", orderInstance.loadOrder);
    globalInstance.resetBtn.addEventListener("click", utilityInstance.resetAll);
    
    // key listeners
    globalInstance.orderInput.addEventListener("keydown", handleOrderInputKey); // don't need to manually pass `event`, the browser takes care of providing the event object.
    globalInstance.barcodeInput.addEventListener("keydown", handleBarcodeInputKey);
  }

  function handleDOMloaded() {
    globalInstance.orderInput.focus(); // focus on the input at start.
    utilityInstance.resetAll(); // Reset everything at the start.
  }

  function handleOrderInputKey(event) {
    if (event.key === "Enter") {
      orderInstance.loadOrder();
    }
  }

  function handleBarcodeInputKey(event) {
    if (event.key === "Enter") {
      utilityInstance.checkBarcode();
    }
  }

  return {
    loadListeners,
  }
}

function orderManager() {
  /**
   * Asynchronously loads an order based on user input.
   * 
   * This function performs the following steps:
   * 1. Reads the order ID from user input.
   * 2. Sets up the initial frame message.
   * 3. Checks if the order ID is valid.
   * 4. If the order ID is invalid, handles the invalid order scenario.
   * 5. If the order is already checked, handles the checked order scenario.
   * 6. Prepares to load order items.
   * 7. Fetches the order items.
   * 
   * @async
   * @function loadOrder
   * @returns {Promise<void>} A promise that resolves when the order is loaded.
   */
  async function loadOrder() { // To load an order with a user input
    console.groupCollapsed("loadOrder()");
    
    const { frameOrderMessage, orderMessage } = globalInstance;
    localInstance.orderID = globalInstance.readOrderInputValue(); // Read the order ID before resetting

    setupFrameMessage(); // Prepare the frame message initially
    if (!localInstance.orderID) {
      handleInvalidOrder(); 
      return;
    }
  
    const isOrderChecked = await checkOrderNote(localInstance.orderID, localInstance.successMessage); // awaited properly within the loadOrder function.
    if (isOrderChecked) {
      handleCheckedOrder(); 
      return;
    } 

    prepareToLoadOrderItems();
    await fetchOrderItems(localInstance.orderID); 
    
    console.groupEnd();
  
    // Helper functions
    function setupFrameMessage() {
      utilityInstance.resetAll();
      globalInstance.toggleVisibilityWithClass(frameOrderMessage, "show", "success-message", "remove");
    }
  
    function handleInvalidOrder() { 
      console.groupCollapsed(`handleInvalidOrder()`);
      globalInstance
        .displayMessageWithClass(orderMessage, "Enter an order ID to load.", "error-message")
      soundInstance.playWrongSound();
      utilityInstance.resetOrderInput();
      console.groupEnd();
    }
  
    function handleCheckedOrder() {
      console.groupCollapsed(`handleCheckedOrder()`);
      globalInstance
        .displayMessageWithClass(orderMessage, "Order already checked.<br>Enter another order.", "success-message")
      utilityInstance.resetOrderInput();
      soundInstance.playWrongSound();
  
      console.groupEnd();
    }
  
    function prepareToLoadOrderItems() {
      globalInstance
        .toggleVisibility(frameOrderMessage, "show") // need to show again because of `resetAll()`
        .insertTextContent(orderMessage, "Order loading..."); // need to show again because of `resetAll()`
    }
    // Helper functions ENDS
  }

  /**
   * Fetches order items from the given order ID and processes them.
   * 
   * @param {string} orderId - The ID of the order to fetch.
   * @returns {Promise<void>} - A promise that resolves when the order items have been fetched and processed.
   * 
   * @throws {Error} - Throws an error if the order is not found or if there is an issue with the fetch request.
   * 
   * @example
   * fetchOrderItems('12345')
   *   .then(() => {
   *     console.log('Order items fetched and processed successfully.');
   *   })
   *   .catch((error) => {
   *     console.error('Error fetching order items:', error);
   *   });
   */
  async function fetchOrderItems(orderId) { // To fetch SKUs from the user-input order number
    console.groupCollapsed("fetchOrderItems()");
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const url = `${localInstance.orderURL}${orderId}`; // construct URL by string interpolation
    const timeout = 10000; // Set a timeout limit in milliseconds
  
    try {
      const response = await fetchWithTimeout(url, timeout, {
        headers: { 'Authorization': `Basic ${auth}` }
      });
  
      if (response.data && response.data.line_items) {
        localInstance.orderItems = response.data.line_items; // Assign WooCommerce order into `localInstance.orderItems`
        console.info(localInstance.orderItems);

        processOrderItems(localInstance.orderItems);
        setupUIAfterSuccess(orderId);
      } else {
        throw new Error("Order not found");
      }
    } catch (error) {
      handleFetchError(error); // Handle specific error messages by calling a helper sub-function
    } finally {
      console.groupEnd();
    }
  
    // Helper functions 
    function processOrderItems(orderItems) { // To fetch ordered SKUs
      for (const orderItem of orderItems) {
        const { sku, quantity } = orderItem;
        for (let i = 0; i < Number(quantity); i++) {
          addSKUToDOM(sku, i);
          localInstance.orderedSKUs[localInstance.totalSKUs++] = sku;
        }
      }
    }

    function addSKUToDOM(sku, index) { // To add SKU to the DOM
      const container = globalInstance.frameSKUContainer;
      const skuElement = document.createElement("p");
      globalInstance
        .toggleVisibility(container, "show")
        .setAttribute(skuElement, "id", `${sku}-${index}`)
        .insertTextContent(skuElement, sku)
        .appendContent(container, skuElement);
    }

    function setupUIAfterSuccess(orderId) {
      manipulateCSS(orderId);
      soundInstance.playBeepSound();
      utilityInstance.enableBarcode().resetBarcodeInput();
    }

    function manipulateCSS() {
      globalInstance
        .toggleClass({
          targetElements: globalInstance.bodyElement,
          mode: "add",
          className: "start",
        })
        .toggleClass({
          targetElements: [globalInstance.bodyElement, globalInstance.orderMessage, globalInstance.frameScanBarcode],
          mode: "add",
          className: "transition",
        })
        .toggleVisibility(
          [globalInstance.headerElement, globalInstance.frameLoadOrder]
          , "hide")
        .insertTextContent(
          globalInstance.orderMessage,
          `${orderId} Loaded.`
        )
        .toggleClass({
          targetElements: globalInstance.orderMessage,
          mode: "add",
          className: "loaded",
        })
        .toggleVisibility([
          globalInstance.frameScanBarcode, globalInstance.resetBtn
        ], "show");
    }
  
    function handleFetchError(error) {
      console.error('Error fetching order data:', error);

      const errorMessage = getErrorMessage(error);
      globalInstance
        .insertInnerHTML(globalInstance.orderMessage, errorMessage)
        .toggleClass({
          targetElements: globalInstance.orderMessage,
          mode: "add",
          className: "error-message",
        });

      soundInstance.playWrongSound();
      utilityInstance.resetOrderInput();
    }

    function getErrorMessage(error) {
      if (error.message === "Request timed out") {
        return "Order loading timed out. Please try again.";
      } else if (error.response?.status === 404) {
        return "Order not found!";
      }
      return "Error loading order.<br>Please try again.";
    }

    async function fetchWithTimeout(url, timeout, config) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      // Fetch the order data with a race between the request and the timeout
      return Promise.race([axios.get(url, config), timeoutPromise]);
    }
    // Helper function ENDS
  } 
  
  /**
   * Checks if a specific note exists in the order's notes.
   * @param {string} orderId - The ID of the order to check.
   * @param {string} successMessage - The note to search for in the order's notes.
   * @returns {Promise<boolean>} - Resolves to true if the note exists, otherwise false.
   */
  async function checkOrderNote(orderId, successMessage) {
    console.info(`checkOrderNote(): Checking notes for order ID: ${orderId}`);

    if (!orderId || !successMessage) {
      console.error("checkOrderNote(): Invalid parameters - orderId or successMessage missing.");
      return false;
    }

    globalInstance.insertTextContent(globalInstance.orderMessage, "Order loading..."); // Dummy message for the user while checking the order status.
  
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const noteURL = `${localInstance.orderURL}${orderId}${localInstance.noteURLpostfix}`; // construct URL by string interpolation
  
    try { // Fetch existing order details to get notes
      const response = await axios.get(noteURL, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });
  
      const existingNotes = response.data || []; // Extract existing notes array from the response
      console.info('checkOrderNote(): Existing notes:', existingNotes);
      const isNoteFound = existingNotes.some(orderNote => orderNote.note === successMessage);

      if (isNoteFound) {
        console.info("checkOrderNote(): Success message found in the order.");
      }

      return isNoteFound; // Return true if the note is found, otherwise false.

    } catch (error) {
      if (error.response) {
        console.error('checkOrderNote(): Server responded with an error:', error.response.status);
      } else if (error.request) {
        console.error('checkOrderNote(): No response received from the server.');
      } else {
        console.error('checkOrderNote(): Error setting up the request:', error.message);
      }
      return false; // In case of error, consider the order as not checked
    }
  }

  /**
   * Appends a note to an order and changes its status to "packed".
   * @param {string} orderId - The ID of the order.
   * @param {string} successMessage - The note to append to the order.
   * @returns {Promise<void>} - Resolves when the operation is successful.
   */
  async function appendOrderNoteAndChangeStatus(orderId, successMessage) {
    console.groupCollapsed("appendOrderNoteAndChangeStatus()");
    const auth = btoa(`${consumerKey}:${consumerSecret}`);  
    const noteURL = `${localInstance.orderURL}${orderId}${localInstance.noteURLpostfix}`; // construct URL by string interpolation
    const orderURL = `${localInstance.orderURL}${orderId}`;
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    if (!orderId || !successMessage) {
      console.error('Invalid inputs: orderId and successMessage are required.');
      return;
    }
  
    try {
      await prepareAndAddNewNote();
    } catch (error) {
      console.error('Error adding order note:', error);
      throw error; // Re-throw to prevent subsequent operations
    }

    try {
      await changeStatusToPacked();
    } catch (error) {
      console.error('Error update order status to packed:, error');
    }

    console.groupEnd();

    // Helper functions
    /**
     * Prepares and adds a new note to the order.
     * @returns {Promise<void>} - Resolves when the note is successfully added.
     * @throws {Error} - If the note addition fails.
     */
    async function prepareAndAddNewNote() { // Prepare and add a new note to the order.
      const currentDate = new Date().toISOString(); // Get current date in ISO 8601 format (UTC timezone)
      
      const newNote = { // Prepare the new note data
        note: successMessage,
        customer_note: false, // Set to false for a private note
        date_created: currentDate,
      };

      try {
        const noteResponse = await axios.post(noteURL, newNote, { headers }); // Add new note to the order using POST request
        if (noteResponse.status !== 201) {
          throw new Error(`Failed to add note: ${noteResponse.status}`);
        }
        console.info('Order note added successfully:', noteResponse.data);
      } catch (error) {
        console.error('Error in prepareAndAddNewNote:', error);
        throw error; // Propagate error to the parent function
      }
    }

    /**
     * Change the order status to "packed".
     * @returns {Promise<void>} - Resolves when the note is successfully added.
     * @throws {Error} - If the note addition fails.
     */
    async function changeStatusToPacked() { // change the order status to 'packed'
      const orderUpdate = { status: 'packed' };

      try {
        const orderResponse = await axios.put(orderURL, orderUpdate, { headers });
        if (orderResponse.status !== 200) {
          throw new Error(`Failed to update status: ${orderResponse.status}`);
        }
        console.info('Order status updated successfully:', orderResponse.data);
      } catch (error) {
        console.error('Error in changeStatusToPacked:', error);
        throw error; // Propagate error to the parent function
      }
    }
    // Helper functions ENDS
  }

  return{
    loadOrder,
    appendOrderNoteAndChangeStatus,
  }
}

function utilityManager() {
  /**
   * Resets the application state when "Load Order" is pressed.
   * - Resets visibility, text, and content of specific elements.
   * - Empties local instance variables and disables barcode scanning.
   */
  function resetAll() { // To reset when Load Order is pressed.
    console.groupCollapsed("resetAll()");
    if (!globalInstance.bodyElement) {
      console.error('Error: `bodyElement` is missing in globalInstance.');
      return;
    }
    try {
      globalInstance // Add the "start" class
        .toggleClass({
          targetElements: globalInstance.bodyElement,
          mode: "add",
          className: "start"
        })

        .emptyAllClass([ // Empty all classes
          globalInstance.headerElement,
          globalInstance.frameLoadOrder,
          globalInstance.frameOrderMessage,
          globalInstance.orderMessage,
          globalInstance.frameSKUContainer,
          globalInstance.frameProgressContainer,
          globalInstance.frameScanBarcode,
        ])

        .toggleVisibility([ // Show and hide specific elements
          globalInstance.headerElement,
          globalInstance.frameLoadOrder,
        ], "show")

        .toggleVisibility([
          globalInstance.frameOrderMessage,
          globalInstance.resetBtn,
          globalInstance.frameSKUContainer,
          globalInstance.frameProgressContainer,
          globalInstance.frameScanBarcode
        ], "hide")

        .emptyInnerHTML([ // Reset text and HTML content
          globalInstance.orderMessage,
          globalInstance.frameSKUContainer,
          globalInstance.frameProgressContainer,
        ])

        .insertTextContent(globalInstance.resetBtn, "Reset");

      resetState();

    } catch (error) {
      console.error("Error in resetAll():", error);
    }
    console.groupEnd();
  }

  function resetState() {
    resetOrderInput();
    disableBarcode();
    localInstance.orderItems = [];
    localInstance.orderedSKUs = [];
    localInstance.totalSKUs = 0;
  }
  
  async function checkBarcode() { // To match scanned-SKUs with ordered-SKUs
    console.groupCollapsed("checkBarcode()");

    const barcode = globalInstance.readBarcodeInputValue();
    const existingError = document.querySelector("#barcodeError");
    let skuFound = false;
    
    globalInstance
      .toggleVisibility(
        globalInstance.frameProgressContainer, 
        "show");

    if (existingError) { // Remove existing error message if any
      existingError.remove();
    }

    if (!barcode) { // Display error if barcode input is empty
      barcodeInputIsEmpty();
      return;
    }
    
    for (let i = 0; i < localInstance.orderedSKUs.length; i++) { // Iterate through the ordered SKUs to find a match
      if (`${barcode}` === `${localInstance.orderedSKUs[i]}`) {
        decorateFrameProgressContainer("found", `${localInstance.orderedSKUs[i]}`);
        spliceCheckedItem(i);
        soundInstance.playBeepSound();
        resetBarcodeInput();
        skuFound = true;
        break; // To exit the loop immediately after processing the matched SKU.
      }
    }

    if (!skuFound) { // If no matching SKU is found
      decorateFrameProgressContainer("not-found");
      soundInstance.playWrongSound();
      resetBarcodeInput();
    }

    if (localInstance.orderedSKUs.length === 0) { // Check if all SKUs are scanned
      disableBarcode();
      soundInstance.playCompleteSound();
      wrapUpWhenComplete();
      /*DELETE when stable const orderId = localInstance.orderID;*/
      await orderInstance.appendOrderNoteAndChangeStatus(localInstance.orderID, localInstance.successMessage);
    }

    // helper sub-functions
    function barcodeInputIsEmpty() { // when barcode input is empty
      console.info("Barcode input is empty.");

      const errorParagraph = document.createElement("p");
      globalInstance
        .emptyInnerHTML(globalInstance.frameProgressContainer)
        .insertTextContent(
          errorParagraph, 
          "Scan a barcode to check."
        )
        .toggleClass({
          targetElement: errorParagraph,
          mode: "add",
          className: "error-message"
        })
        .appendContent(
          globalInstance.frameProgressContainer, 
          errorParagraph
        );
      
      errorParagraph.setAttribute("id", "barcodeError");
      soundInstance.playWrongSound();
      console.groupEnd();
    }

    function decorateFrameProgressContainer(status, sku) { // show or hide frames; strike-through SKU etc.      
      // helper function: Update the progress container based on status
      function updateProgressContainer(message, addClass, removeClass) { 
        const container = globalInstance.frameProgressContainer;
        globalInstance
          .toggleClass({
            targetElements: container,
            mode: "remove",
            className: removeClass,
          })
          .insertInnerHTML(container, message)
          .toggleClass({
            targetElements: container,
            mode: "add",
            className: addClass,
          });
      }

      switch (status) { 
        case "found":
          // Update progress container for a successful scan
          updateProgressContainer("Correct!! Scan another.", "success-message", "error-message");
          
          // Mark the SKU element as checked if it matches the scanned SKU
          globalInstance 
            .toggleClass({
              targetElements: document.querySelector(`[id^=${sku}]:not(.checked-sku)`),
              mode: "add",
              className: "checked-sku",
            });
          break;
        case "not-found":
          // Update progress container for an incorrect scan
          updateProgressContainer("Wrong Product", "error-message", "success-message");
          break;
      }
    }

    function spliceCheckedItem(i) {// Remove scanned SKU from localInstance.orderedSKUs array.
      console.groupCollapsed("spliceCheckedItem()");
      console.info(`Before splice: ${localInstance.orderedSKUs}`);
      localInstance.orderedSKUs.splice(i, 1);
      console.info(`After splice: ${localInstance.orderedSKUs}`);
      console.groupEnd();
    }

    function wrapUpWhenComplete() { // Decorate and insert text when no more SKU to check
      globalInstance
        .insertTextContent(
          globalInstance.orderMessage,
          "Order complete!"
        )
        .toggleClass({
          targetElements: globalInstance.orderMessage,
          mode: "add",
          className: "order-complete"
        })
        .toggleVisibility([
          globalInstance.frameSKUContainer,
          globalInstance.frameProgressContainer,
          globalInstance.frameScanBarcode,
        ], "hide")
        .insertTextContent(
          globalInstance.resetBtn,
          "Check a new order"
        );
    }
  }

  function disableBarcode() { //To disable barcode input and button
    console.groupCollapsed("disableBarcode()");
    globalInstance
      .toggleDisability([
          globalInstance.barcodeInputTop, 
          globalInstance.barcodeLabel
      ],"disabled")
      disableBarcodeInput()
      disableCheckBarcodeBtn();
    console.groupEnd();
  }

  function enableBarcode() { // To enable barcode input and button
    console.groupCollapsed("enableBarcode()");
    globalInstance
      .toggleDisability([
          globalInstance.barcodeInputTop, 
          globalInstance.barcodeLabel
      ],"enabled")
    enableBarcodeInput();
    enableCheckBarcodeBtn();
    console.groupEnd();
    return this;
  }

  function enableBarcodeInput() {
    globalInstance.barcodeInput.disabled = false;
  }

  function disableBarcodeInput() {
    globalInstance.barcodeInput.disabled = true;
  }

  function enableCheckBarcodeBtn() {
    globalInstance.checkBarcodeBtn.disabled = false;
  }

  function disableCheckBarcodeBtn() {
    globalInstance.checkBarcodeBtn.disabled = true;
  }

  function resetOrderInput() {
    globalInstance.orderInput.value = "";
    globalInstance.orderInput.focus();
    return this;
  }
  
  function resetBarcodeInput() {
    globalInstance.barcodeInput.value = "";
    globalInstance.barcodeInput.focus();
    return this;
  }

  return {
    resetAll,
    checkBarcode,
    disableBarcode,
    enableBarcode,
    resetOrderInput,
    resetBarcodeInput,
  }
}

function soundManager() {
  function playBeepSound() {
    console.info("playBeepSound() played.");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
    // Modern browsers require the AudioContext to be created or resumed after a user interaction (like a click or keypress) due to auto-play policies.
    // Error occours when this line is moved outside. 
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    // oscillator and gainNode should be created within each function that plays a sound. 
    // ...This ensures they are fresh instances each time the function is called.
    // An oscillator can only be started and stopped once, and it cannot be reused. 
    // ...Keeping it outside the function causes the error when you try to restart it. 

    /*oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Play sound for 0.1 seconds*/
  }
  
  function playCorrectSound() {
    console.info("playCorrectSound() played");
    /*const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2); // Play sound for 0.2 seconds*/
  }
  
  function playWrongSound() {
    console.info("playWrongSound() played");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    /*oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2); // Play sound for 0.2 seconds*/
  }
  
  function playCompleteSound() {
    console.info("playCompleteSound() played");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    /*oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5); // Play sound for 0.5 seconds*/
  }

  return {
    playBeepSound,
    playCorrectSound,
    playWrongSound,
    playCompleteSound,
  }
}
