import { consumerKey, consumerSecret } from './config.js';

/*const consumerKey = 'ck_2c623eb59a0d402737750dc26c82bf0b11298816';
const consumerSecret = 'cs_99211764913a428f22e7a4e39b67f58ec4011c7a';*/

let orderItems = []; // to fetch all info of an order
let orderedSKUs = []; // to keep the ordered SKUs
const bodyElement = document.body;
const headerElement = document.querySelector("#frame-header");
const frameLoadOrder = document.querySelector("#frame-load-order");
const orderInput = document.querySelector("#order-input");
const loadOrderBtn = document.querySelector("#load-order-btn");
const resetBtn = document.querySelector("#reset-btn");
const frameSKUContainer = document.querySelector("#frame-SKU-container");
const frameScanBarcode = document.querySelector("#frame-scan-barcode");
const barcodeInputTop = document.querySelector("#barcode-input-top");
const barcodeLabel = document.querySelector("#barcode-label");
const barcodeInput = document.querySelector("#barcode-input");
const checkBarcodeBtn = document.querySelector("#check-barcode-btn");
const frameOrderMessage = document.querySelector("#frame-order-message");
const orderMessage = document.querySelector("#order-message");
const frameProgressContainer = document.querySelector("#frame-progress-container");
const successMessage = "All SKUs matched with barcodes successfully.";
let orderID = 0;
let totalSKUs = 0;

// EVENT: Listeners
// To ensure that the DOM is fully loaded before the script executes
document.addEventListener("DOMContentLoaded", function() {
  orderInput.focus(); // focus on the input at start.
  resetAll(); // Reset everything at the start.
});

checkBarcodeBtn.addEventListener("click", checkBarcode);
loadOrderBtn.addEventListener("click", loadOrder);
resetBtn.addEventListener("click", resetAll);

orderInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    loadOrder();
  }
});

barcodeInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    checkBarcode();
  }
});

// FUNCTION: To load an order with a user input
async function loadOrder() {
  frameOrderMessage.classList.remove("hidden");
  orderMessage.classList.remove("success-message");
  orderID = orderInput.value; // Read the order ID before resetting
  if (!orderID) {
    playWrongSound();
    orderMessage.textContent = "Enter an order ID to load.";
    //playBeepSound();
    orderInput.focus();
    return;
  }

  resetAll();

  // Check if the order has already been checked
  // Need to ensure that the checkOrderNote function is called and 
  // awaited properly within the loadOrder function.
  frameOrderMessage.classList.remove("hidden");
  const isOrderChecked = await checkOrderNote(orderID, successMessage);
  if (isOrderChecked) {
    orderMessage.innerHTML = "Order already checked.<br>Enter another order.";
    orderMessage.classList.add("success-message");
    orderInput.value = "";
    orderInput.focus();
    playWrongSound();
    return;
  }

  orderMessage.textContent = "Order loading...";
  await fetchOrderItems(orderID); // ADD await
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
      console.log(orderItems);
    } else {
      throw new Error("Order not found");
    }

  // To fetch ordered SKUs
  for (let orderItem of orderItems) {
    // Get `quantity` property from and `orderItem` object
    const quantity = Number(orderItem["quantity"]);
    /*console.log(`Order quantity ${quantity}`);*/

    frameSKUContainer.classList.remove("hidden");

    // Add ordered SKU to the `orderedSKUs` array, and increment the counter.
    for (let i = 0; i < quantity; i++) {
      orderedSKUs[totalSKUs++] = orderItem["sku"];
      // Create new element with the ID same as the SKU.
      const sku = document.createElement("p");
      sku.setAttribute("id", `${orderItem["sku"]}`);
      sku.textContent = orderItem["sku"];
      frameSKUContainer.append(sku);
    }   
  }

  bodyElement.classList.remove("start");
  bodyElement.classList.add("transition");

  headerElement.classList.add("hidden");

  orderMessage.textContent = `${orderId} Loaded.`;
  orderMessage.classList.add("loaded");
  playBeepSound();

  frameLoadOrder.classList.add("hidden");
  frameScanBarcode.classList.remove("hidden");

  orderMessage.classList.add("transition");
  resetBtn.classList.remove("hidden");

  frameScanBarcode.classList.add("transition");

  enableBarcode();
  barcodeInput.focus();
  
} catch (error) {
    console.error('Error fetching order data:', error);

    // Handle specific error messages
    if (error.message === "Request timed out") {
      orderMessage.innerHTML = "Order loading timed out. Please try again.";
    } else if (error.response && error.response.status === 404) {
      orderMessage.innerHTML = "Order not found!";
    } else {
      orderMessage.innerHTML = "Error loading order.<br>Please try again.";
    }

    orderMessage.classList.add("error-message");
    playWrongSound();
    orderInput.value = "";
    orderInput.focus();
    return; // Exit the function if there is an error
  }
} 


// FUNCTION: To match scanned-SKUs with ordered-SKUs
async function checkBarcode() {
  frameProgressContainer.classList.remove("hidden");

  const barcode = barcodeInput.value;
  const checkedSKUparagraph = document.createElement("p");
  const existingError = document.querySelector("#barcodeError");

  let skuFound = false;

  // Remove existing error message if any
  if (existingError) {
    existingError.remove();
  }

  // Display error if barcode input is empty
  if (!barcode) {
    frameProgressContainer.innerHTML = "";
    const errorParagraph = document.createElement("p");
    errorParagraph.textContent = "Scan a barcode to check.";
    errorParagraph.classList.add("error-message");
    errorParagraph.setAttribute("id", "barcodeError");
    //errorParagraph.style.color = "red";
    frameProgressContainer.append(errorParagraph);
    playWrongSound();
    return;
  }

  // Iterate through the ordered SKUs to find a match
  for (let i = 0; i < orderedSKUs.length; i++) {
    if (barcode === orderedSKUs[i]) {
      ///orderMessage.textContent = "";
      //checkedSKUparagraph.textContent = orderedSKUs[i];
      // If scanned barcode is same as orderedSKU, matched SKU is removed from the frame-SKU-container
      // and put it in the progress-container; loop until the end of orderedSKUs array.
      
      frameProgressContainer.classList.remove("error-message");
      frameProgressContainer.innerHTML = "Correct!! Scan another.";
      frameProgressContainer.classList.add("success-message");
      
      document.querySelector(`#${orderedSKUs[i]}`).classList.add("checked-sku");

      // Remove scanned SKU from orderedSKUs array.
      console.log(`Before splice: ${orderedSKUs}`);
      orderedSKUs.splice(i, 1);
      console.log(`After splice: ${orderedSKUs}`);

      skuFound = true;
      playBeepSound();
      barcodeInput.value = "";
      barcodeInput.focus();
      break; // To exit the loop immediately after processing the matched SKU.
    }
  } 

  // If no matching SKU is found
  if (!skuFound) {
    //orderMessage.textContent = "Wrong Product";

    frameProgressContainer.classList.remove("success-message");
    frameProgressContainer.innerHTML = "Wrong Product";
    frameProgressContainer.classList.add("error-message");
    
    playWrongSound();
    barcodeInput.value = "";
    barcodeInput.focus();
  }

  // Check if all SKUs are scanned
  if (orderedSKUs.length === 0) {
    disableBarcode();
    //playCorrectSound();
    playCompleteSound();

    orderMessage.textContent = "Order complete!";
    orderMessage.classList.add("order-complete");

    frameSKUContainer.classList.add("hidden");
    frameProgressContainer.classList.add("hidden");
    frameScanBarcode.classList.add("hidden");

    resetBtn.textContent = "Check a new order";
    const orderId = orderID; 

    /* TEMP COMMENT 
    await appendOrderNoteAndChangeStatus(orderId, successMessage);
    */
    console.log("appendOrderNoteAndChangeStatus() is called");
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
    console.log('Order note added successfully:', response.data);
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

    console.log('Order note added successfully:', noteResponse.data);

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

    console.log('Order status updated successfully:', orderResponse.data);

  } catch (error) {
    console.error('Error appending order note or updating order status:', error);
  }
}

// FUNCTION:
async function checkOrderNote(orderId, successMessage) {
  orderMessage.textContent = "Order loading...";

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
      /*console.log(existingNotes[i].note);*/
      if (existingNotes[i].note === successMessage){
        console.log("Retrun true");
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
// FUNCTION: To disable barcode input and button
function disableBarcode() {
  barcodeInputTop.classList.add("disabled");
  barcodeLabel.classList.add("disabled");
  barcodeInput.disabled = true;
  checkBarcodeBtn.disabled = true;
}

// FUNCTION: To enable barcode input and button
function enableBarcode() {
  barcodeInputTop.classList.remove("disabled");
  barcodeLabel.classList.remove("disabled");
  barcodeInput.disabled = false;
  checkBarcodeBtn.disabled = false;
}

// FUNCTION: To reset when Load Order is pressed.
function resetAll() {
  bodyElement.classList.add("start");

  headerElement.className = "";
  headerElement.classList.remove("hidden");

  frameLoadOrder.className = "";
  frameLoadOrder.classList.remove("hidden");

  frameOrderMessage.className = "";
  frameOrderMessage.classList.add("hidden");

  orderMessage.textContent = "";
  orderMessage.className = "";
  resetBtn.textContent =  "Reset";
  resetBtn.classList.add("hidden");

  frameSKUContainer.className = "";
  frameSKUContainer.classList.add("hidden");
  frameSKUContainer.innerHTML = "";

  frameProgressContainer.className = "";
  frameProgressContainer.classList.add("hidden");
  frameProgressContainer.innerHTML = "";

  frameScanBarcode.className = "";
  frameScanBarcode.classList.add("hidden");
  
  disableBarcode();
  //orderMessage.textContent = "Ready to begin.";
  orderItems = []; 
  orderedSKUs = [];
  totalSKUs = 0; 
  
  orderInput.value = "";
  orderInput.focus();
}

// Sounds
function playBeepSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // 20% volume

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1); // Play sound for 0.1 seconds
}

function playCorrectSound() {
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
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  /*
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // Custom frequency
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 20% volume
  */

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // Custom frequency
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // 20% volume

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2); // Play sound for 0.2 seconds
}

function playCompleteSound() {
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