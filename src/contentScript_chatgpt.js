chrome.storage.local.get("text", function (data) {
  const text = data.text || "";
  chrome.storage.local.remove("text");

  if (!text.trim()) {
    console.debug("No text found in storage");
    return;
  }

  const prompt = `Give me key ideas from this text: ${text}`;

  querySelectorPromise("textarea")
    .then(async (textarea) => {
      changeValue(textarea, prompt);

      const submitButton = await querySelectorPromise(
        "[data-testid=fruitjuice-send-button]"
      );

      if (!submitButton) {
        console.error("Submit button not found");
        return;
      }

      submitButton.click();
    })
    .catch(console.error);
});

function querySelectorPromise(selector, timeout = 500) {
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

function changeValue(textarea, value) {
  textarea.value = value;

  let event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });

  textarea.dispatchEvent(event);
  console.debug("Changed value of textarea");
}
