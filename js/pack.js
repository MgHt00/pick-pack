import { consumerKey, consumerSecret } from './config.js';

/*const consumerKey = '%%CONSUMER_KEY%%';
const consumerSecret = '%%CONSUMER_SECRET%%';*/

let orderItems = []; // to fetch all info of an order
let orderedSKUs = []; // to keep the ordered SKUs
const bodyElement = document.body;
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
const messageContainer = document.querySelector("#message-container");
const frameOrderMessage = document.querySelector("#frame-order-message");
const orderMessage = document.querySelector("#order-message");
const frameProgressContainer = document.querySelector("#frame-progress-container");
const successMessage = "All SKUs matched with barcodes successfully.";
let orderID = 0;
let totalSKUs = 0;

// To ensure that the DOM is fully loaded before the script executes
document.addEventListener("DOMContentLoaded", function() {
  orderInput.focus(); // focus on the input at start.
  resetAll(); // Reset everything at the start.
});

// Add Event Listeners
checkBarcodeBtn.addEventListener("click", checkBarcode);
loadOrderBtn.addEventListener("click", loadOrder);
resetBtn.addEventListener("click", resetAll);

// Add event listener for the "Enter" key press within the input field
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

// To disable barcode input and button
function disableBarcode() {
  barcodeInputTop.classList.add("disabled");
  barcodeLabel.classList.add("disabled");
  barcodeInput.disabled = true;
  checkBarcodeBtn.disabled = true;
}

// To enable barcode input and button
function enableBarcode() {
  barcodeInputTop.classList.remove("disabled");
  barcodeLabel.classList.remove("disabled");
  barcodeInput.disabled = false;
  checkBarcodeBtn.disabled = false;
}

// To reset when Load Order is pressed.
function resetAll() {
  bodyElement.classList.add("start");
  frameOrderMessage.classList.add("hidden");
  orderMessage.textContent = "";
  orderMessage.classList.remove("order-not-found");
  orderMessage.classList.remove("loaded");
  resetBtn.classList.add("hidden");
  frameSKUContainer.classList.add("hidden");
  frameSKUContainer.innerHTML = "";
  frameProgressContainer.innerHTML = "";
  disableBarcode();
  //orderMessage.textContent = "Ready to begin.";
  orderItems = []; // NEW line
  orderedSKUs = []; // NEW line
  totalSKUs = 0; // NEW line
  frameLoadOrder.classList.remove("hidden");
  frameScanBarcode.classList.add("hidden");
  orderInput.value = "";
  orderInput.focus();
}

// To load an order with a user input
async function loadOrder() {
  frameOrderMessage.classList.remove("hidden");
  orderMessage.classList.remove("checked");
  orderID = orderInput.value; // Read the order ID before resetting
  if (!orderID) {
    orderMessage.textContent = "Enter an order ID to load.";
    //orderMessage.style.color = "red";
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
    orderMessage.classList.add("checked");
    orderInput.value = "";
    orderInput.focus();
    return;
  }

  orderMessage.textContent = "Order loading...";
  await fetchOrderItems(orderID); // ADD await
}

// Fetch SKUs from the user-input order number
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

  orderMessage.textContent = `${orderId} Loaded.`;
  orderMessage.classList.add("loaded");

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

    orderMessage.classList.add("order-not-found");
    orderInput.value = "";
    orderInput.focus();
    return; // Exit the function if there is an error
  }
} 



// To match scanned-SKUs with ordered-SKUs
async function checkBarcode() {
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
    const errorParagraph = document.createElement("p");
    errorParagraph.textContent = "Please scan a barcode.";
    errorParagraph.setAttribute("id", "barcodeError");
    //errorParagraph.style.color = "red";
    frameProgressContainer.append(errorParagraph);
    return;
  }

  // Iterate through the ordered SKUs to find a match
  for (let i = 0; i < orderedSKUs.length; i++) {
    if (barcode === orderedSKUs[i]) {
      ///orderMessage.textContent = "";
      checkedSKUparagraph.textContent = orderedSKUs[i];
      // If scanned barcode is same as orderedSKU, matched SKU is removed from the frame-SKU-container
      // and put it in the progress-container; loop until the end of orderedSKUs array.
      frameProgressContainer.append(checkedSKUparagraph);
      document.querySelector(`#${orderedSKUs[i]}`).remove();

      // Remove scanned SKU from orderedSKUs array.
      console.log(`Before splice: ${orderedSKUs}`);
      orderedSKUs.splice(i, 1);
      console.log(`After splice: ${orderedSKUs}`);

      skuFound = true;
      barcodeInput.value = "";
      barcodeInput.focus();
      break; // To exit the loop immediately after processing the matched SKU.
    }
  } 

  // If no matching SKU is found
  if (!skuFound) {
    orderMessage.textContent = "Wrong Product";
    barcodeInput.value = "";
    barcodeInput.focus();
  }

  // Check if all SKUs are scanned
  if (orderedSKUs.length === 0) {
    disableBarcode();
    orderMessage.textContent = "Order complete!";
    const orderId = orderID; // MOVED line (from duplicated 'if')
    await appendOrderNoteAndChangeStatus(orderId, successMessage); // MOVED line (from duplicated 'if')
  }
}

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
