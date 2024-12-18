export const cssClassManager = {
  // ---------- Helper Functions ----------
  removeClass(targetElements = null, className) {
    if (!targetElements) return this; // Return early if no elements are provided
  
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements]; // Ensure targetElements is an array
  
    targetElements.forEach(element => {
      element.classList.remove(className);
    });
  
    return this; // Allow method chaining
  },

  addClass(targetElements = null, className) {
    if (!targetElements) return this; 
  
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
  
    targetElements.forEach(element => {
      element.classList.add(className);
    });
  
    return this; 
  },

  emptyClass(targetElements = null) {
    if (!targetElements) return this;

    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach(element => {
      element.className = '';
    });
  },

  // ---------- Interface Functions ----------
  toggleFrameVisibility({mode, target}) {    
    console.info(`toggleFrameVisibility() called by ${generalFunctionsManager.retrieveCallerFunctionName()}, mode: ${mode}`);
    switch(mode) {
      case "show":
        return this.removeClass(target, "hidden"); // The preceding `return this` enables method chaining.
      case "hide":
        return this.addClass(target, "hidden"); 
      default:
        console.warn("Invalid mode. Use 'show' or 'hide'.");
        return this;
    }
  },

  toggleClass({mode, className, target}) {
    console.info(`toggleFrameClass() called by ${this.retrieveCallerFunctionName()}, mode: ${mode}, className: ${className}`);
    switch(mode) {
      case "add":
        return this.addClass(target, className);
      case "remove":
        return this.removeClass(target, className);
      default:
        console.warn("Invalid mode. Use 'add' or 'remove'.");
        return this;
    }
  },

};

export const contentManager = {
  insertTextContent(targetElement, content) {
    targetElement.textContent = content;
    return this;
  },

  insertInnerHTML(targetElement, content) {
    targetElement.innerHTML = "";  
    targetElement.innerHTML = content;
    return this;
  },
};

export const utilityFunctionsManager = {
  checkAndConvertArray(value) {
    return value = Array.isArray(value)? value : [value];
  },
};

const generalFunctionsManager = {
  retrieveCallerFunctionName() {
    const stack = new Error().stack; // Get the stack trace
    const stackLines = stack.split("\n");
  
    // Retrieve the 3rd entry in the stack trace (index 3) to get the original caller (Check detail at cheat sheets from gitHub)
    const callerLine = stackLines[3]?.trim();
    let callerName = callerLine?.split(" ")[1] || "Unknown";
  
    // Remove the class or object prefix (e.g., "Global.toggleFrameOrderMessage" becomes "toggleFrameOrderMessage")
    callerName = callerName.includes(".") ? callerName.split(".").pop() : callerName;
  
    return callerName;
  },  
};
