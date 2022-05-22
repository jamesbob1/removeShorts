// Initialize button with user's preferred color
let changeModeSwitch = document.getElementById("switch");

chrome.storage.sync.get("removeShorts", ({ state }) => {
    changeModeSwitch.checked = state;
});



// When the button is clicked, inject setPageBackgroundColor into current page  
changeModeSwitch.addEventListener("change", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {"removeShortsSwitchMessage": {"state": changeModeSwitch.checked}},
            null
        );
    });
}); 
  