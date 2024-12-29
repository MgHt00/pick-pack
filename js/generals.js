export const utilityFunctionsManager = {
  checkAndConvertArray(value) {
    return value = Array.isArray(value)? value : [value];
  },

  isValidClassName(value) {
    return typeof value === 'string' && value.trim() !== '';
  },

  removeClass(targetElements = [], className) {  
    targetElements = this.checkAndConvertArray(targetElements);
    if (!this.isValidClassName(className)) return this; // Validate className

    targetElements.forEach(element => {
      if (element) element.classList.remove(className);
    });
    return this;
  },

  addClass(targetElements = [], className) {  
    targetElements = this.checkAndConvertArray(targetElements);
    if (!this.isValidClassName(className)) return this;
    
    targetElements.forEach(element => {
      if (element) element.classList.add(className);
    });
    return this;
  },

  emptyClass(targetElements = []) {
    targetElements = this.checkAndConvertArray(targetElements);
    targetElements.forEach(element => {
      if (element) element.className = '';
    });
    return this;
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