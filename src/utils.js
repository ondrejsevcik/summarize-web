export function querySelectorPromise(selector, timeout = 500) {
  return new Promise((resolve, reject) => {
    let intervalId = null;
    let timeoutId = null;

    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        resolve(element);
        console.debug(`Element ${selector} found`);
      }
    };

    intervalId = setInterval(checkElement, timeout);
    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(
        new Error(
          `Element with selector "${selector}" was not found within the timeout period.`
        )
      );
    }, 5000); // Maximum wait for 5 seconds.
  });
}

export function waitForTime(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
