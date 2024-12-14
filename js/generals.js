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

  insertTextContent(targetElement, content) {
    targetElement.textContent = content;
    return this;
  },
};

export const contentManager = {

}
