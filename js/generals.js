export const classManager = {
  removeClass(targetElements = null, className) {
    if (!targetElements) return this; // Return early if no elements are provided
  
    // Ensure targetElements is an array
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
  
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

  emptyClass(targetElements = null, className) {
    if (!targetElements) return this;

    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach(element => {
      element.className = '';
    });
  },

  // Helper Functions
  toggleFrameVisibility(mode, target) {
    const stack = new Error().stack;     // (For console.log) To get the stack trace and parse the caller's function name dynamically.
    const callerName = stack.split("\n")[2]?.trim().split(" ")[1] || "Unknown";

    console.info(`toggleFrameVisibility() called by ${callerName}, mode: ${mode}`);

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

};

export const contentManager = {
  insertTextContent(targetElement, content) {
    targetElement.textContent = content;
    return this;
  },

  insertInnerHTML(targetElement, content) {
    targetElement.innerHtml = content;
    return this;
  },
}
