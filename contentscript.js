/*jshint esversion: 6*/

let videos = [];
let hideShortsState;

chrome.storage.sync.get(["removeShorts"], result => {
    hideShortsState = result.removeShorts;
});

function newVideo(timeOverlay) {
    let video = timeOverlay.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (timeOverlay.getAttribute("overlay-style") == "SHORTS")
    {
        video.hidden = hideShortsState;
        videos.push(video);
    }
        
}   

function sectionsObservered(mutations) {
    for (let mutation of mutations) {
        if (mutation.target.tagName == "YTD-THUMBNAIL-OVERLAY-TIME-STATUS-RENDERER")
            newVideo(mutation.target);
    }
}

function newSection(section) {
    let videosContainer = section.querySelector("#items");
    let videos = videosContainer.children;

    let observer = new MutationObserver(sectionsObservered);
    observer.observe(videosContainer, {
        subtree: true,
        attributes: true,
        attributeFilter: ["overlay-style"]
    });

    for (let video of videos) {
        let el = video.querySelector("ytd-thumbnail-overlay-time-status-renderer");
        if (el != null)
            newVideo(el);
    }
}

function sectionsContainerObservered(mutations) {
    for (let mutation of mutations) {
        if (mutation.type === "childList") {
            for (let node of mutation.addedNodes) {
                if (node.nodeName === "YTD-ITEM-SECTION-RENDERER")
                    newSection(node);
            }
        }
    }
}

function waitForSectionsContainerToLoad(page) {
    let checkExist = setInterval(function () {
        let sectionsContainer = document.querySelector("ytd-section-list-renderer[page-subtype='subscriptions'] > #contents");
        if (sectionsContainer !== null) {
            clearInterval(checkExist);
            
            [...sectionsContainer.children].filter((node) => node.nodeName === "YTD-ITEM-SECTION-RENDERER").forEach(newSection);

            let observer = new MutationObserver(sectionsContainerObservered);
            observer.observe(sectionsContainer, {
                childList: true
            });
        }
    }, 200);
}

function pageManagerUpdate(mutations) {
    pages = pageManager.children;

    for (let page of pageManager.children) {
        if (page.tagName == "YTD-BROWSE" && page.baseURI == "https://www.youtube.com/feed/subscriptions") {
            console.log("SHORTS remover active!");
            pageManagerObserver.disconnect();
            waitForSectionsContainerToLoad(page);
            break;
        }
    }
}

let pageManager = document.getElementById("page-manager");
let pageManagerObserver = new MutationObserver(pageManagerUpdate);
pageManagerObserver.observe(pageManager, {
    childList: true
});


chrome.runtime.onMessage.addListener(request => {
    if(request.removeShortsSwitchMessage)
    {
        hideShortsState = request.removeShortsSwitchMessage.state;
        videos.forEach(video=>{
            video.hidden = hideShortsState;
        });
    }
    return true;
    }
  );
