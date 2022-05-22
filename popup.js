// Initialize button with user's preferred color
let changeModeSwitch = document.getElementById("switch");

chrome.storage.sync.get(["removeShorts"], result => {
    changeModeSwitch.checked = result.removeShorts;
});



// When the button is clicked, inject setPageBackgroundColor into current page  
changeModeSwitch.addEventListener("change", function() {
    chrome.storage.sync.set({"removeShorts": changeModeSwitch.checked}, function() {
        console.log('set');
      });
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {"removeShortsSwitchMessage": {"state": changeModeSwitch.checked}},
            null
        );
    });
}); 
  