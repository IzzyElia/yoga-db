const searchResultsAreaId = "search-results";
const searchBarID = "pose-search-bar";
let index = {};
updateIndex();


let searchTypeButtonIDCounter = 0;
function generateSearchTypeButton (searchParam, buttonText) {
    //$(document).ready(() => {
        const thisElement = document.currentScript;
        const buttonID = `search-type-selector-${searchTypeButtonIDCounter}`
        const buttonElement = Object.assign(document.createElement('button'), {
            id:buttonID,
            onclick:() => {setActiveElementOrToggleOff(buttonID, 'search-type-selector-button'); updateIndex()},
            classList:[`search-param=${searchParam}`]
        }) 
        buttonElement.innerHTML = buttonText
        /*
        const content = `
        <button class="search-type-selector" id="${buttonID}" onClick="setActiveElementOrToggleOff('${buttonID}', 'search-type-selector')">${buttonText}</button>
        `
        */
        thisElement.replaceWith(buttonElement);
        searchTypeButtonIDCounter += 1;
    //})
}

function setActiveElementOrToggleOff(elementID, group) {
    let thisElement = document.getElementById(elementID);
    const activeClassName = `${group}-active`
    const isActive = thisElement.classList.contains(activeClassName);
    if (isActive) {
        thisElement.classList.remove(activeClassName);
    }
    else {
        const activeElements = document.getElementsByClassName(activeClassName);
        for (let i = 0; i < activeElements.length; i++) {
            const element = activeElements[i];
            element.classList.remove(activeClassName);
        }
        thisElement.classList.add(activeClassName);
    }
}

function getActiveElement (group) {
    const activeClassName = `${group}-active`;
    const elements = document.getElementsByClassName(activeClassName);
    if(elements.length == 0) { return null; }
    element = elements[0];
    return element;
    //wip
}

function updateIndex() {
    let searchSection = 'english-names' //default
    const selectedButton = getActiveElement('search-type-selector-button');
    if (selectedButton != null) {
        selectedButton.classList.forEach(clas => {
            if (clas.startsWith('search-param=')) {
                searchSection = clas.split('search-param=')[1];
            }
        });
    }
    fetch(`/api/index/${searchSection}`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        index = data;
    })
}

function doSearchOnLocalIndex() { //load search results from the index as it exists now
    let html = ``;
    const search = document.getElementById(searchBarID).value;
    if (search == '') {
        document.getElementById(searchResultsAreaId).innerHTML = '';
        return;
    }
    const poses = index.poses;
    let foundPoses = [];
    poses.forEach(pose => {
        let names = [replaceUnderscoresWithSpaces(pose.sanskrit)];
        pose.searchItemsFoundOn = [];
    
        pose.finds.forEach(item => {
            names.push(item);
        })
        for (let i = 0; i < names.length; i++) {
            const n = names[i];
            getStringAsLowercaseWithNoSpaces(n);
            if (checkIfStringsContainSameWords(search, n)) {
                if(!foundPoses.includes(pose)) {
                    foundPoses.push(pose);
                }
                pose.searchItemsFoundOn.push(n);
            }
        }
    });
    foundPoses.forEach(pose => {
        html += `
        <a href='/view/${pose.sanskrit}'>
            ${replaceUnderscoresWithSpaces(pose.sanskrit)} -> ${JSON.stringify(pose.searchItemsFoundOn)}
        </a>
        `
    })
    html += `
    <p>Not finding your pose here? </p><button onclick="createPose('${search}')">Create '${search}'</button>
    `
    document.getElementById(searchResultsAreaId).innerHTML = html;
}

function checkIfStringsContainSameWords (search, str) {
    const preppedSearch = search.split(/[^a-zA-Z0-9]/gmi);
    const preppedString = str.split(/[^a-zA-Z0-9]/gmi);
    for(i=0; i < preppedSearch.length; i++) {
        const searchTerm = preppedSearch[i].toLowerCase();
        if (searchTerm == '') {continue;}
        matchedAtLeastOneWord = false;
        for (let i = 0; i < preppedString.length; i++) {
            const word = preppedString[i].toLowerCase();
            if (word.includes(searchTerm)) {
                matchedAtLeastOneWord = true
            }
        }
        if (matchedAtLeastOneWord == false) {return false;}
    }
    return true;
}

function createPose(poseName) {
    $.ajax ({
        url: `/api/pose/create/${poseName}`,
        method: 'post',
        success: (response) => {
            updateIndex();
            doSearchOnLocalIndex();
            window.location.href=`/view/${poseName.replace(/\s/g, '_')}`;
        }
    })
}

