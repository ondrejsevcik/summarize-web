browser.runtime.onMessage.addListener((data, sender) => {
  console.log({ data, sender });

  const url = "https://api.openai.com/v1/chat/completions";
  const OPENAI_API_KEY = "TODO";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const body = JSON.stringify({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: `Summarize this text using bullet points: 

        ${data.text}`,
      },
    ],
  });

  fetch(url, { method: "POST", headers, body })
    .then((response) => response.json())
    .then((data) => console.log(data?.choices[0]?.message?.content))
    .catch((error) => console.error("Error:", error));
});

// When the browser_action is clicked, inject a content script into the current page
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript(tab.id, {
    file: "contentScript.js",
  });
});
