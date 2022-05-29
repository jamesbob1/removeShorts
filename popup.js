
let changeModeSwitch = document.getElementById("switch");

chrome.storage.sync.get(["removeShorts"], result => {
    changeModeSwitch.checked = result.removeShorts;
});

changeModeSwitch.addEventListener("change", function() {
    chrome.storage.sync.set({"removeShorts": changeModeSwitch.checked}, function() {
        // console.log(`set to ${changeModeSwitch.checked}`);
      });
}); 
