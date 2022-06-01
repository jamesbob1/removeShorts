/*jshint esversion: 6*/

let videos = [];
let hideShortsState;

chrome.storage.sync.get(["removeShorts"], result => {
    hideShortsState = result.removeShorts;
});

function setVideosVisibility(state) {
    videos.forEach(video=>{
        video.hidden = state;
    });
    hideShortsState = state;
}

function newVideo(timeOverlay) {
    let video = timeOverlay.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (timeOverlay.getAttribute("overlay-style") == "SHORTS")
    {
        video.hidden = hideShortsState;
        videos.push(video);
    }
        
}   

//ytd-grid-video-renderer

function sectionsObservered(mutations) {
    for (let mutation of mutations) {
        if (mutation.target.tagName == "YTD-THUMBNAIL-OVERLAY-TIME-STATUS-RENDERER")
            newVideo(mutation.target);
    }
}

function newSection(section) {
    sectionType = [...section.querySelector("#contents").children].map(e=>e.tagName).filter((n)=> n.toLowerCase().startsWith("ytd"))[0];
    if (sectionType == "YTD-SHELF-RENDERER"){
        let videosContainer = section.querySelector("#items");
        let observer = new MutationObserver(sectionsObservered);
        
        observer.observe(videosContainer, {
            subtree: true,
            attributes: true,
            attributeFilter: ["overlay-style"]
        });
        
        let videos = videosContainer.children;
        for (let video of videos) {
            let el = video.querySelector("ytd-thumbnail-overlay-time-status-renderer");
            if (el != null)
                newVideo(el);
        }
    }
    else{
        console.alert(`unknow section ${sectionType}`);
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
    for (let mutation of mutations) {
        for (let page of mutation.addedNodes) {
            if (page.tagName == "YTD-BROWSE") {
                console.log("SHORTS remover active!");
                pageManagerObserver.disconnect();
                waitForSectionsContainerToLoad(page);
                break;
            }
        }
    }
}

let pageManager = document.getElementById("page-manager");
let pageManagerObserver = new MutationObserver(pageManagerUpdate);

pageManagerObserver.observe(pageManager, {
    childList: true
});

chrome.storage.sync.onChanged.addListener(function (changes, namespace) {
    setVideosVisibility(changes.removeShorts.newValue);
});


