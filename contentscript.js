/*jshint esversion: 6*/


let videos = [];
let hideShortsState;

chrome.storage.sync.get(["removeShorts"], result => {
    hideShortsState = result.removeShorts;
});

function setVideosVisibility(state) {
    videos.forEach(video => {
        video.hidden = state;
    });
    hideShortsState = state;
}

// Called for every new video
function newVideo(timeOverlay) {
    let video = timeOverlay.parentNode.parentNode.parentNode.parentNode.parentNode;
    if (timeOverlay.getAttribute("overlay-style") == "SHORTS") {
        video.hidden = hideShortsState;
        videos.push(video);
    }

}

// Called when the addpage is loaded.
function newSection(section) {
    console.assert(section != null);

    if (section.nodeName !== "YTD-ITEM-SECTION-RENDERER") {
        console.log(`unsupported section ${section.nodeName}`);
        return;
    }

    let itemsContainer = section.querySelector("#items")
    console.assert(itemsContainer != null, "itemsContainer is null")

    console.log(itemsContainer.children.length)

    // Updates when a videos load.
    let observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.target.tagName == "YTD-THUMBNAIL-OVERLAY-TIME-STATUS-RENDERER")
                newVideo(mutation.target);
        }
        //todo:close observer
    });

    observer.observe(itemsContainer, {
        subtree: true,
        attributes: true,
        attributeFilter: ["overlay-style"]
    });

    let sectionVideos = itemsContainer.children;
    for (let video of sectionVideos) {
        let el = video.querySelector("ytd-thumbnail-overlay-time-status-renderer");
        if (el != null)
            newVideo(el);
    }
}

// Called when the added page is loaded.
function pageLoaded(pageSectionsContainer) {
    console.assert(pageSectionsContainer != null);

    for (let section of pageSectionsContainer.children) {
        newSection(section)
    }

    // Updates when a new section is added.
    let pageSectionsContainerObserver = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach(newSection)
            }
        }
    });

    pageSectionsContainerObserver.observe(pageSectionsContainer, {
        childList: true
    })
}


// Called when a new page is added
function newPage(page) {
    console.assert(page != null, "page is null");

    if (!(page.tagName == "YTD-BROWSE" && page.getAttribute("page-subtype") == "subscriptions")) {
        console.log(`unsupported page ${page.nodeName}`);
        return;
    }

    console.log("SHORTS remover active!");

    let pagePrimary = page.querySelector("#primary");
    let contentContainer = pagePrimary.querySelector("ytd-section-list-renderer > #contents")

    if (contentContainer !== null) {
        pageLoaded(contentContainer);
        return;
    }

    //Updates when the page is loaded.
    let pageLoadedObserver = new MutationObserver(_ => {
        pageLoaded(pagePrimary.querySelector("ytd-section-list-renderer > #contents"));
        pageLoadedObserver.disconnect()
    });

    pageLoadedObserver.observe(pagePrimary, {
        childList: true
    });

}

function ListenrForPages(pageManager) {
    console.warn(pageManager != null, "Page manager isn't available");

    // Updates when a new page is added.
    let pageManagerObserver = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            for (let page of mutation.addedNodes) {
                newPage(page);
            }
        }
    });

    pageManagerObserver.observe(pageManager, {
        childList: true
    });
}


let pageManagerNode = document.getElementById("page-manager");
ListenrForPages(pageManagerNode)

chrome.storage.sync.onChanged.addListener(function(changes, namespace) {
    setVideosVisibility(changes.removeShorts.newValue);
});