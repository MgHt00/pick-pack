import { consumerKey, consumerSecret } from './config.js';
import Global from './globals.js';

/*const consumerKey = '%%CONSUMER_KEY%%';
const consumerSecret = '%%CONSUMER_SECRET%%';*/

let orderItems = []; // to fetch all info of an order
let orderedSKUs = []; // to keep the ordered SKUs
let orderID = 0;
let totalSKUs = 0;

const globalInstance = new Global();
const listenerInstance = listenerManager();
const soundInstance = soundManager();
const helperInstance = helperFunctions();

(function initialize(){
  console.groupCollapsed("initialize()");
  globalInstance
    .toggleFrameOrderMessage("hide")
    .toggleFrameSKUContainer("hide")
    .toggleFrameProgressContainer("hide")
    .toggleFrameScanBarcode("hide");

  listenerInstance
    .loadListeners();

  console.groupEnd();
})();

function listenerManager() {
  function loadListeners() {
    console.info("loadListeners()");

    // To ensure that the DOM is fully loaded before the script executes
    document.addEventListener("DOMContentLoaded", DOMloaded);

    // click listeners
    globalInstance.checkBarcodeBtn.addEventListener("click", checkBarcode);
    globalInstance.loadOrderBtn.addEventListener("click", loadOrder);
    globalInstance.resetBtn.addEventListener("click", resetAll);
    
    // key listeners
    globalInstance.orderInput.addEventListener("keydown", handleOrderInputKey); // don't need to manually pass `event`, the browser takes care of providing the event object.
    globalInstance.barcodeInput.addEventListener("keydown", handleBarcodeInputKey);
  }

  function DOMloaded() {
    globalInstance.orderInput.focus(); // focus on the input at start.
    resetAll(); // Reset everything at the start.
  }

  function handleOrderInputKey(event) {
    if (event.key === "Enter") {
      loadOrder();
    }
  }

  function handleBarcodeInputKey(event) {
    if (event.key === "Enter") {
      checkBarcode();
    }
  }

  return {
    loadListeners,
  }
}

// FUNCTION: To load an order with a user input
async function loadOrder() {
  console.groupCollapsed("loadOrder()");
  globalInstance
    .toggleFrameOrderMessage("show")
    .removeClassFromOrderMessage("success-message");

  orderID = globalInstance.readOrderInputValue(); // Read the order ID before resetting

  if (!orderID) {
    soundInstance.playWrongSound();
    globalInstance
      .updateOrderMessage("Enter an order ID to load.")
      .orderInput.focus();
    console.groupEnd();
    return;
  }

  resetAll(); // reset everything before loading new order
  globalInstance.toggleFrameOrderMessage("show"); // need to show again because of `resetAll()`

  // Check if the order has already been checked
  // Need to ensure that the checkOrderNote function is called and 
  // awaited properly within the loadOrder function.
  const isOrderChecked = await checkOrderNote(orderID, globalInstance.successMessage);
  if (isOrderChecked) {
    globalInstance
      .setOrderMessageInnerHTML("Order already checked.<br>Enter another order.")
      .addClassToOrderMessage("success-message")
      .resetOrderInput();
    soundInstance.playWrongSound();
    console.groupEnd();
    return;
  }

  globalInstance.updateOrderMessage("Order loading...");
  await fetchOrderItems(orderID); 
  console.groupEnd();
}

// FUNCTION: Fetch SKUs from the user-input order number
async function fetchOrderItems(orderId) {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const url = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}`;
  const timeout = 10000; // Set a timeout limit in milliseconds

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    );

    // Fetch the order data with a race between the request and the timeout
    const response = await Promise.race([
      axios.get(url, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }),
      timeoutPromise
    ]);

    // Assign WooCommerce order into `orderItems`
    if (response.data && response.data.line_items) {
      orderItems = response.data.line_items;
      console.info(orderItems);
    } else {
      throw new Error("Order not found");
    }

  // To fetch ordered SKUs
  for (let orderItem of orderItems) {
    // Get `quantity` property from and `orderItem` object
    const quantity = Number(orderItem["quantity"]);
    /*console.info(`Order quantity ${quantity}`);*/

    globalInstance.frameSKUContainer.classList.remove("hidden");

    // Add ordered SKU to the `orderedSKUs` array, and increment the counter.
    for (let i = 0; i < quantity; i++) {
      orderedSKUs[totalSKUs++] = orderItem["sku"];
      // Create new element with the ID same as the SKU.
      const sku = document.createElement("p");
      sku.setAttribute("id", `${orderItem["sku"]}`);
      sku.textContent = orderItem["sku"];
      globalInstance.frameSKUContainer.append(sku);
    }   
  }

  globalInstance.bodyElement.classList.remove("start");
  globalInstance.bodyElement.classList.add("transition");

  globalInstance.headerElement.classList.add("hidden");

  globalInstance.orderMessage.textContent = `${orderId} Loaded.`;
  globalInstance.orderMessage.classList.add("loaded");
  soundInstance.playBeepSound();

  globalInstance.frameLoadOrder.classList.add("hidden");
  globalInstance.frameScanBarcode.classList.remove("hidden");

  globalInstance.orderMessage.classList.add("transition");
  globalInstance.resetBtn.classList.remove("hidden");

  globalInstance.frameScanBarcode.classList.add("transition");

  helperInstance.enableBarcode();
  globalInstance.barcodeInput.focus();
  
} catch (error) {
    console.error('Error fetching order data:', error);

    // Handle specific error messages
    if (error.message === "Request timed out") {
      globalInstance.orderMessage.innerHTML = "Order loading timed out. Please try again.";
    } else if (error.response && error.response.status === 404) {
      globalInstance.orderMessage.innerHTML = "Order not found!";
    } else {
      globalInstance.orderMessage.innerHTML = "Error loading order.<br>Please try again.";
    }

    globalInstance.orderMessage.classList.add("error-message");
    soundInstance.playWrongSound();
    globalInstance.orderInput.value = "";
    globalInstance.orderInput.focus();
    return; // Exit the function if there is an error
  }
} 


// FUNCTION: To match scanned-SKUs with ordered-SKUs
async function checkBarcode() {
  globalInstance.frameProgressContainer.classList.remove("hidden");

  const barcode = globalInstance.barcodeInput.value;
  const checkedSKUparagraph = document.createElement("p");
  const existingError = document.querySelector("#barcodeError");

  let skuFound = false;

  // Remove existing error message if any
  if (existingError) {
    existingError.remove();
  }

  // Display error if barcode input is empty
  if (!barcode) {
    globalInstance.frameProgressContainer.innerHTML = "";
    const errorParagraph = document.createElement("p");
    errorParagraph.textContent = "Scan a barcode to check.";
    errorParagraph.classList.add("error-message");
    errorParagraph.setAttribute("id", "barcodeError");
    //errorParagraph.style.color = "red";
    globalInstance.frameProgressContainer.append(errorParagraph);
    soundInstance.playWrongSound();
    return;
  }

  // Iterate through the ordered SKUs to find a match
  for (let i = 0; i < orderedSKUs.length; i++) {
    if (barcode === orderedSKUs[i]) {
      ///globalInstance.orderMessage.textContent = "";
      //checkedSKUparagraph.textContent = orderedSKUs[i];
      // If scanned barcode is same as orderedSKU, matched SKU is removed from the frame-SKU-container
      // and put it in the progress-container; loop until the end of orderedSKUs array.
      
      globalInstance.frameProgressContainer.classList.remove("error-message");
      globalInstance.frameProgressContainer.innerHTML = "Correct!! Scan another.";
      globalInstance.frameProgressContainer.classList.add("success-message");
      
      document.querySelector(`#${orderedSKUs[i]}`).classList.add("checked-sku");

      // Remove scanned SKU from orderedSKUs array.
      console.info(`Before splice: ${orderedSKUs}`);
      orderedSKUs.splice(i, 1);
      console.info(`After splice: ${orderedSKUs}`);

      skuFound = true;
      soundInstance.playBeepSound();
      globalInstance.barcodeInput.value = "";
      globalInstance.barcodeInput.focus();
      break; // To exit the loop immediately after processing the matched SKU.
    }
  } 

  // If no matching SKU is found
  if (!skuFound) {
    //globalInstance.orderMessage.textContent = "Wrong Product";

    globalInstance.frameProgressContainer.classList.remove("success-message");
    globalInstance.frameProgressContainer.innerHTML = "Wrong Product";
    globalInstance.frameProgressContainer.classList.add("error-message");
    
    soundInstance.playWrongSound();
    globalInstance.barcodeInput.value = "";
    globalInstance.barcodeInput.focus();
  }

  // Check if all SKUs are scanned
  if (orderedSKUs.length === 0) {
    helperInstance.disableBarcode();
    //soundInstance.playCorrectSound();
    soundInstance.playCompleteSound();

    globalInstance.orderMessage.textContent = "Order complete!";
    globalInstance.orderMessage.classList.add("order-complete");

    globalInstance.frameSKUContainer.classList.add("hidden");
    globalInstance.frameProgressContainer.classList.add("hidden");
    globalInstance.frameScanBarcode.classList.add("hidden");

    globalInstance.resetBtn.textContent = "Check a new order";
    const orderId = orderID; 

    /* TEMP COMMENT */
    await appendOrderNoteAndChangeStatus(orderId, globalInstance.successMessage);
    
    console.info("appendOrderNoteAndChangeStatus() is called");
  }
}

// FUNCTION: 
async function appendOrderNote(orderId, successMessage) {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const noteURL = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}/notes`;

  try {
    // Get current date in ISO 8601 format (UTC timezone)
    const currentDate = new Date().toISOString();

    // Prepare the new note data
    const newNote = {
      note: successMessage,
      customer_note: false, // Set to false for a private note
      date_created: currentDate,
    };
    

    // Add new note to the order using POST
    const response = await axios.post(noteURL, newNote, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    // Log the full response object to inspect where updated notes are located
    console.info('Order note added successfully:', response.data);
  } catch (error) {
    console.error('Error appending order note:', error);
  }
}

// FUNCTION: 
async function appendOrderNoteAndChangeStatus(orderId, successMessage) {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const noteURL = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}/notes`;
  const orderURL = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}`;

  try {
    // Get current date in ISO 8601 format (UTC timezone)
    const currentDate = new Date().toISOString();

    // Prepare the new note data
    const newNote = {
      note: successMessage,
      customer_note: false, // Set to false for a private note
      date_created: currentDate,
    };

    // Add new note to the order using POST
    const noteResponse = await axios.post(noteURL, newNote, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    console.info('Order note added successfully:', noteResponse.data);

    // If the note is added successfully, change the order status to 'packed'
    const orderUpdate = {
      status: 'packed'
    };

    const orderResponse = await axios.put(orderURL, orderUpdate, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    console.info('Order status updated successfully:', orderResponse.data);

  } catch (error) {
    console.error('Error appending order note or updating order status:', error);
  }
}

// FUNCTION:
async function checkOrderNote(orderId, successMessage) {
  globalInstance.orderMessage.textContent = "Order loading...";

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  const noteURL = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}/notes`;

  try {
    // Fetch existing order details to get notes
    const response = await axios.get(noteURL, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    // Extract existing notes array from the response
    const existingNotes = response.data || [];

    for(let i = 0; i<existingNotes.length; i++) {
      /*console.info(existingNotes[i].note);*/
      if (existingNotes[i].note === successMessage){
        console.info("Retrun true");
        return true;
      }
    }

    // If no matching note is found
    return false;

  } catch (error) {
    console.error('Error appending order note:', error);
    return false; // In case of error, consider the order as not checked
  }
}

// MISC functions
function helperFunctions() {

  function disableBarcode() { //To disable barcode input and button
    console.groupCollapsed("disableBarcode()");
    globalInstance
      .toggleBarcodeBundle({mode: "add", className: "disabled"})
      .disableBarcodeInput()
      .disableCheckBarcodeBtn();
    console.groupEnd();
  }

  function enableBarcode() { // To enable barcode input and button
    console.groupCollapsed("enableBarcode()");
    globalInstance
      .toggleBarcodeBundle({mode: "remove", className: "disabled"})
      .enableBarcodeInput()
      .enableCheckBarcodeBtn();
    console.groupEnd();
  }

  return {
    disableBarcode,
    enableBarcode,
  }
}




// FUNCTION: To reset when Load Order is pressed.
function resetAll() {
  globalInstance.bodyElement.classList.add("start");

  globalInstance.headerElement.className = "";
  globalInstance.headerElement.classList.remove("hidden");

  globalInstance.frameLoadOrder.className = "";
  globalInstance.frameLoadOrder.classList.remove("hidden");

  globalInstance.frameOrderMessage.className = "";
  globalInstance.frameOrderMessage.classList.add("hidden");

  globalInstance.orderMessage.textContent = "";
  globalInstance.orderMessage.className = "";
  globalInstance.resetBtn.textContent =  "Reset";
  globalInstance.resetBtn.classList.add("hidden");

  globalInstance.frameSKUContainer.className = "";
  globalInstance.frameSKUContainer.classList.add("hidden");
  globalInstance.frameSKUContainer.innerHTML = "";

  globalInstance.frameProgressContainer.className = "";
  globalInstance.frameProgressContainer.classList.add("hidden");
  globalInstance.frameProgressContainer.innerHTML = "";

  globalInstance.frameScanBarcode.className = "";
  globalInstance.frameScanBarcode.classList.add("hidden");
  
  helperInstance.disableBarcode();
  //globalInstance.orderMessage.textContent = "Ready to begin.";
  orderItems = []; 
  orderedSKUs = [];
  totalSKUs = 0; 
  
  globalInstance.orderInput.value = "";
  globalInstance.orderInput.focus();
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

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Play sound for 0.1 seconds
  }
  
  function playCorrectSound() {
    console.info("playCorrectSound() played");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2); // Play sound for 0.2 seconds
  }
  
  function playWrongSound() {
    console.info("playWrongSound() played");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2); // Play sound for 0.2 seconds
  }
  
  function playCompleteSound() {
    console.info("playCompleteSound() played");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();  
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
  
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Custom frequency
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume
  
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5); // Play sound for 0.5 seconds
  }

  return {
    playBeepSound,
    playCorrectSound,
    playWrongSound,
    playCompleteSound,
  }
}
