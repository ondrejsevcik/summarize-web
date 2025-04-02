import { ACTION_SUMMARIZE_PAGE, ACTION_SUMMARIZE_TWEET, ACTION_SUMMARIZE_YOUTUBE, Page, Tweet, Youtube } from "./types.js";
import { querySelectorPromise } from "./utils.js";

// Cross-browser compatible approach
// @ts-ignore
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Tweet summarization
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

// Page summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);
  console.log("Sender information:", sender);
  
  // Check the message type/action to determine how to process it
  if (message.action !== ACTION_SUMMARIZE_PAGE) {
    return;
  }

  let pageData = message.data as Page;

  querySelectorPromise("textarea")
    .then(async (textarea) => {
        const prompt = `Give me key ides from the attached file.`;
        changeValue(textarea, prompt);

        const fileContent = `Title: ${pageData.title}\n\nContent:\n${pageData.content}`;
        const inputElement = document.querySelector('input[type=file]')
        simulateFileSelection(inputElement, fileContent, 'content.txt', 'text/plain');

        // Wait 5s for upload
        await new Promise(resolve => setTimeout(resolve, 5000));

      const submitButton = await querySelectorPromise("[aria-label=Submit]");
      submitButton.click();
      sendResponse({ status: "success" });
    })
    .catch((error) => {
      console.error(error)
      sendResponse({ status: "fail" });
    });
});

// Youtube summarization
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);
  console.log("Sender information:", sender);
  
  // Check the message type/action to determine how to process it
  if (message.action !== ACTION_SUMMARIZE_YOUTUBE) {
    return;
  }

  let youtubeData = message.data as Youtube;

  querySelectorPromise("textarea")
    .then(async (textarea) => {
        const prompt = `Give me key ides from the attached YouTube transcript.`;
        changeValue(textarea, prompt);

        const fileContent = `Title: ${youtubeData.title}\n\nContent:\n${youtubeData.transcript}`;
        const inputElement = document.querySelector('input[type=file]')
        simulateFileSelection(inputElement, fileContent, 'content.txt', 'text/plain');

        // Wait 5s for upload
        await new Promise(resolve => setTimeout(resolve, 5000));

      const submitButton = await querySelectorPromise("[aria-label=Submit]");
      submitButton.click();
      sendResponse({ status: "success" });
    })
    .catch((error) => {
      console.error(error)
      sendResponse({ status: "fail" });
    });
});

// TODO move to utils
function changeValue(textarea, value) {
  textarea.value = value;

  let event = new Event("input", {
    bubbles: true,
    cancelable: true,
  });

  textarea.dispatchEvent(event);
  console.debug("Changed value of textarea");
}


// TODO move to utils
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
