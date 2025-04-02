import { ACTION_SUMMARIZE_TWEET, Tweet } from "./types.js";
import { querySelectorPromise } from "./utils.js";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);
  console.log("Sender information:", sender);
  
  // Check the message type/action to determine how to process it
  if (message.action !== ACTION_SUMMARIZE_TWEET) {
    return;
  }

  let tweet = message.data as Tweet;

  querySelectorPromise("textarea")
    .then(async (textarea) => {
        const prompt = 
`Explain this tweet.

Tweet author: ${tweet.authorName} @${tweet.authorHandle}
Tweet content
${tweet.tweetContent}`;

      changeValue(textarea, prompt);

      const submitButton = await querySelectorPromise("[aria-label=Submit]");
      submitButton.click();
      sendResponse({ status: "success" });
    })
    .catch((error) => {
      console.error(error)
      sendResponse({ status: "fail" });
    });
});

// browserAPI.storage.local.get("text", function (data) {
//   const text = data.text || "";
//   console.debug('Text retrieved from storage:', text);
//   browserAPI.storage.local.remove("text");

//   if (!text.trim()) {
//     console.debug("No text found in storage");
//     return;
//   }

//   querySelectorPromise("textarea")
//     .then(async (textarea) => {
//       if (text.startsWith("Tweet")) {
//         const prompt = `Explain this tweet
        
// ${text}`;
//         changeValue(textarea, prompt);
//       } else {
//         const prompt = `Give me key ideas from the attached file`;
//         changeValue(textarea, prompt);

//         const inputElement = document.querySelector('input[type=file]')
//         simulateFileSelection(inputElement, text, 'content.txt', 'text/plain');

//         // Wait 5s for upload
//         await new Promise(resolve => setTimeout(resolve, 5000));
//       }

//       const submitButton = await querySelectorPromise("[aria-label=Submit]");

//       if (!submitButton) {
//         console.error("Submit button not found");
//         return;
//       }

//       submitButton.click();
//     })
//     .catch(console.error);
// });

function changeValue(textarea, value) {
  textarea.value = value;

  let event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });

  textarea.dispatchEvent(event);
  console.debug("Changed value of textarea");
}


function simulateFileSelection(inputElement, fileContent, fileName, fileType) {
  // Create a File object
  const file = new File([fileContent], fileName, { type: fileType });
  
  // Create a DataTransfer object and add the file
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  
  // Set the files property on the input element
  inputElement.files = dataTransfer.files;
  
  // Dispatch a change event
  const event = new Event('change', { bubbles: true });
  inputElement.dispatchEvent(event);
}
