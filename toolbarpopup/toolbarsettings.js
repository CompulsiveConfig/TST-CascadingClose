/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */

const buttonClass = "redbutton";

function notifyBackgroundPage(e) {
  var sending = browser.runtime.sendMessage({
    greeting: "Greeting from the content script"
  });
  sending.then(handleResponse, handleError);  
}

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function listenForClicks() {
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains(buttonClass)) {
      var sending = browser.runtime.sendMessage({
        command: "closetabs"
      });
      sending.then(handleResponse, handleError);  
        }
  });
}


/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
listenForClicks();
