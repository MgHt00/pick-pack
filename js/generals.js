export const generalFunctions = {
  removeClass(targetElements = [], className) {
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach((e) => {
      e.classList.remove(className);
    });
    return this;
  },

  addClass(targetElements = [], className) {
    targetElements = Array.isArray(targetElements) ? targetElements : [targetElements];
    targetElements.forEach((e) => {
      e.classList.add(className);
    });
    return this;
  },

  // Add more utility functions here as needed
};
