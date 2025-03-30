import { querySelectorPromise } from "./utils.js";

chrome.storage.local.get("text", function (data) {
  const text = data.text || "";
  console.debug('Text retrieved from storage:', text);
  chrome.storage.local.remove("text");

  if (!text.trim()) {
    console.debug("No text found in storage");
    return;
  }

  const prompt = `Give me key ideas from the text: ${text}`;

  querySelectorPromise("textarea")
    .then(async (textarea) => {
      changeValue(textarea, prompt);

      const submitButton = await querySelectorPromise("[aria-label=Submit]");

      if (!submitButton) {
        console.error("Submit button not found");
        return;
      }

      submitButton.click();
    })
    .catch(console.error);
});

function changeValue(textarea, value) {
  textarea.value = value;

  let event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });

  textarea.dispatchEvent(event);
  console.debug("Changed value of textarea");
}
