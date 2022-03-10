console.log("Shorts Remover");


let timeMultipliers = [1, 60, 3600, 86400];

function timeTextToSeconds(timeText) {
    return timeText.
    trim().
    split(":").
    map(Number).
    reverse().
    map((time, mult)=>time*timeMultipliers[mult]).
    reduce((partialSum, a) => partialSum + a, 0);
}


function newVideo(video_length_element) {
    let length = timeTextToSeconds(video_length_element.innerText);
    if (length <= 60)
    {
        let video = video_length_element.parentElement.parentElement.
                                        parentElement.parentElement.
                                        parentElement.parentElement;
        video.hidden = true;
    }
}

function sectionsObservered(mutations) {
    for (let mutation of mutations) {
        if (mutation.target.tagName == "SPAN")
            {
                newVideo(mutation.target);
            }
      }
}

function newSection(section) {
    let videosContainer = section.querySelector("#items");
    let videos = videosContainer.children;

    let observer = new MutationObserver(sectionsObservered);
    observer.observe(videosContainer, {subtree: true, attributes: true, attributeFilter: ["aria-label"], attributes:true})

    for (let video of videos) {
        let video_length = video.querySelector("ytd-thumbnail-overlay-time-status-renderer > #text");
        if (video_length !== null)
        {
            newVideo(video_length);
        }
    }
}

function sectionsContainerObservered(mutations) {
    for (let mutation of mutations) {
        if (mutation.type === "childList") {
            for (let node of mutation.addedNodes) {
                if (node.nodeName==="YTD-ITEM-SECTION-RENDERER")
                    newSection(node);
            }
        }
    }
}


let checkExist = setInterval(function() {
    let sectionsContainer = document.querySelector("ytd-section-list-renderer > #contents")
    if (sectionsContainer !== null)
    {
        [...sectionsContainer.children].filter((node)=>node.nodeName==="YTD-ITEM-SECTION-RENDERER").forEach(newSection);

        let observer = new MutationObserver(sectionsContainerObservered);
        observer.observe(sectionsContainer, {childList: true})
        clearInterval(checkExist);
    }
}, 100);
