/*jshint esversion: 6*/


function newVideo(timeOverlay) {
    let video = timeOverlay.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (timeOverlay.getAttribute("overlay-style") == "SHORTS")
        video.hidden = true;
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
        else
            break;
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
        let sectionsContainer = document.querySelector("ytd-section-list-renderer > #contents");
        if (sectionsContainer !== null) {
            [...sectionsContainer.children].filter((node) => node.nodeName === "YTD-ITEM-SECTION-RENDERER").forEach(newSection);

            let observer = new MutationObserver(sectionsContainerObservered);
            observer.observe(sectionsContainer, {
                childList: true
            });
            clearInterval(checkExist);
        }
    }, 100);
}

function pageManagerUpdate(mutations) {
    pages = pageManager.children;

    for (let page of pageManager.children) {
        if (page.tagName == "YTD-BROWSE" && page.baseURI == "https://www.youtube.com/feed/subscriptions") {
            console.log("SHORTS remover NOW!!!!");
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