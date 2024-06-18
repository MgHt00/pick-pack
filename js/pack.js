import { consumerKey, consumerSecret } from './config.js';

/*
const consumerKey = '%%CONSUMER_KEY%%';
const consumerSecret = '%%CONSUMER_SECRET%%';
*/

let orderItems = []; // to fetch all info of an order
let orderedSKUs = []; // to keep the ordered SKUs
const orderInput = document.querySelector("#order-input");
const loadOrderBtn = document.querySelector("#load-order-btn");
const skuContainer = document.querySelector("#SKU-container");
//const orderMessage = document.querySelector("#message-container");
const barcodeInput = document.querySelector("#barcode-input");
const checkBarcodeBtn = document.querySelector("#check-barcode-btn");
const messageContainer = document.querySelector("#message-container");
const progressContainer = document.querySelector("#progress-container");
let orderID = 0;
let totalSKUs = 0;

// To ensure that the DOM is fully loaded before the script executes
document.addEventListener("DOMContentLoaded", function() {
  orderInput.focus(); // focus on the input at start.
});

// Add Event Listeners
checkBarcodeBtn.addEventListener("click", checkBarcode);
loadOrderBtn.addEventListener("click", loadOrder);

// To load an order with a user input
function loadOrder() {
  orderID = orderInput.value;
  fetchOrderItems(orderID);
  /*fetchOrderItems(66536);*/
  orderInput.value = "";
  skuContainer.innerHTML = "";
}

// Fetch SKUs from the user-input order number
async function fetchOrderItems(orderId) {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  /*const url = `/wp-json/wc/v3/orders/${orderId}`;*/
  const url = `https://mmls.biz/wp-json/wc/v3/orders/${orderId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (response.data && response.data.line_items) {
      orderItems = response.data.line_items;
      console.log(orderItems);
    } else {
      throw new Error("Order not found");
    }
  } catch (error) {
    console.error('Error fetching order data:', error);

    /*
    orderMessage.textContent = "Order not found!";
    orderMessage.style.color = "red"; // Ensure the message is visible
    */
    messageContainer.textContent = "Order not found!";
    messageContainer.style.color = "red";
    orderInput.value = "";
    orderInput.focus();
    return; //// Exit the function if there is an error
  }

  //// To fetch ordered SKUs
  for (let orderItem of orderItems) {
    const quantity = Number(orderItem["quantity"]);
    console.log(`Order quantity ${quantity}`);

    //// Add orderedSKU to the array, and increment the counter.
    for (let i = 0; i < quantity; i++) {
      orderedSKUs[totalSKUs++] = orderItem["sku"];
      //// Create new element with the ID same as the SKU.
      const sku = document.createElement("p");
      sku.setAttribute("id", `${orderItem["sku"]}`);
      sku.textContent = orderItem["sku"];
      skuContainer.append(sku);
    }   
  }
  barcodeInput.focus();
}

// To match scanned-SKUs with ordered-SKUs
function checkBarcode() {
  const barcode = barcodeInput.value;
  const checkedSKU = document.createElement("p");
  
  for (let i=0; i<orderedSKUs.length; i++) {
    if (barcode === orderedSKUs[i]) {
      console.log(`${i} time.`);
      messageContainer.textContent = "";
      checkedSKU.textContent = orderedSKUs[i];
      //// If scanned barcode is same as orderedSKU, matched SKU is removed from the SKU-container
      //// and put it in the progress-container; loop until the end of orderedSKUs array.
      progressContainer.append(checkedSKU);
      document.querySelector(`#${orderedSKUs[i]}`).remove();

      //// Remove scanned SKU from orderedSKUs array.
      console.log(`Before splice: ${orderedSKUs}`);
      orderedSKUs.splice(i, 1);
      console.log(`After splice: ${orderedSKUs}`);

      barcodeInput.value = "";
      barcodeInput.focus();
      break;

      //// Disable button and input when there is no more SKU left in the array.
      if (orderedSKUs.length === 0) {
        barcodeInput.disabled = true;
        checkBarcodeBtn.disabled = true;
      }

    } else {
      messageContainer.textContent = "Wrong Product";
      barcodeInput.value = "";
      barcodeInput.focus();
    }
  }

  // After checking barcodes, if all SKUs are matched
  if (orderedSKUs.length === 0) {
    const successMessage = "All SKUs matched with barcodes successfully.";
    const orderId = orderID;
    appendOrderNote(orderId, successMessage);
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
