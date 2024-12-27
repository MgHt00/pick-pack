export const utilityFunctionsManager = {
  checkAndConvertArray(value) {
    return value = Array.isArray(value)? value : [value];
  },

  removeClass(targetElements = null, className) {
    if (!targetElements) return this; // Return early if no elements are provided
  
    targetElements = this.checkAndConvertArray(targetElements);
  
    targetElements.forEach(element => {
      element.classList.remove(className);
    });
  },

  addClass(targetElements = null, className) {
    if (!targetElements) return this; 
  
    targetElements = this.checkAndConvertArray(targetElements);
  
    targetElements.forEach(element => {
      element.classList.add(className);
    });
  },

  emptyClass(targetElements = null) {
    if (!targetElements) return this;

    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach(element => {
      element.className = '';
    });
  },

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

export const cssClassManager = {
  // Function References: because `utilityFunctionsManager` shouldn't be exported to Global
  checkArray: utilityFunctionsManager.checkAndConvertArray, 
  emptyCSSClass: utilityFunctionsManager.emptyClass,

  toggleTargetVisibility({mode, target}) {    
    //console.info(`toggleFrameVisibility() called by ${utilityFunctionsManager.retrieveCallerFunctionName()}, mode: ${mode}`);
    switch(mode) {
      case "show":
        utilityFunctionsManager.removeClass(target, "hidden"); 
        break;
      case "hide":
        utilityFunctionsManager.addClass(target, "hidden"); 
        break;
      default:
        console.warn("Invalid mode. Use 'show' or 'hide'.");
    }
  },

  toggleTargetDisability({mode, target}) {    
    //console.info(`toggleFrameVisibility() called by ${utilityFunctionsManager.retrieveCallerFunctionName()}, mode: ${mode}`);
    switch(mode) {
      case "enabled":
        utilityFunctionsManager.removeClass(target, "disabled"); 
        break;
      case "disabled":
        utilityFunctionsManager.addClass(target, "disabled"); 
        break;
      default:
        console.warn("Invalid mode. Use 'enabled' or 'disabled'.");
    }
  },

  toggleTargetClass({mode, className, target}) {
    //console.info(`toggleFrameClass() called by ${utilityFunctionsManager.retrieveCallerFunctionName()}, mode: ${mode}, className: ${className}`);
    switch(mode) {
      case "add":
        utilityFunctionsManager.addClass(target, className);
        break;
      case "remove":
        utilityFunctionsManager.removeClass(target, className);
        break;
      default:
        console.warn("Invalid mode. Use 'add' or 'remove'.");
    }
    return this;
  },

};

export const contentManager = {
  setAttribute(targetElement, attribute, content){
    targetElement.setAttribute(attribute, content);
    return this;
  },

  insertTextContent(targetElement, content) {
    targetElement.textContent = content;
    return this;
  },

  insertInnerHTML(targetElement, content) {
    targetElement.innerHTML = "";  
    targetElement.innerHTML = content;
    return this;
  },

  appendContent(targetElement, content) {
    targetElement.append(content);
    return this;
  }
};