var locatorsFindEnabled = true;
var locatorsClickEnabled = true;
var locatorsInteractionEnabled = true;
var mutationObserver = null;

function locatorsUpdateInfo(element) {
    let container = document.getElementById('infoBar-body');
    container.innerHTML = '';
    container.appendChild(element);
}

function createLoader() {
    let loader = document.createElement('div');
    loader.classList.add('lds-spinner');
    for (let i = 0; i < 12; i++) {
        loader.appendChild(document.createElement('div'));
    }
    let wrapper = document.createElement('div');
    wrapper.classList.add('lds-spinner-wrapper');
    wrapper.appendChild(loader)
    locatorsUpdateInfo(wrapper);
}


/**
 * Create base block
 * @return {HTMLDivElement} base block
 */
function createInfoBar() {
    console.debug('createInfoBar');
    let infoBar = document.createElement('div');
    infoBar.id = 'locatorsInfoBar';
    infoBar.style.height = '500px';
    infoBar.style.width = '200px';
    let header = document.createElement('div');
    header.id = 'infoBar-header';
    header.addEventListener('mousedown', ev => {
        if (ev.target === header) {
            infoBar.draggable = true;
        }
    });
    header.addEventListener('mouseup', () => infoBar.draggable = false);

    infoBar.addEventListener('dragstart', event => {
        infoBar.startClientTop = event.y;
        infoBar.startClientLeft = event.x;
    });
    infoBar.addEventListener('dragend', event => {
        let start = event.target.getBoundingClientRect()
        let top = event.clientY + (start.y - event.target.startClientTop);
        let left = event.clientX + (start.x - event.target.startClientLeft);
        if (left < 0) {
            left = 0;
        } else if (left + start.width > document.documentElement.clientWidth) {
            left = document.documentElement.clientWidth - start.width;
        }
        if (top < 0) {
            top = 0;
        } else if (top + start.height > document.documentElement.clientHeight) {
            top = document.documentElement.clientHeight - start.height;
        }
        infoBar.style.top = `${top}px`;
        infoBar.style.left = `${left}px`;
        infoBar.draggable = false;
    });
    let closed = document.createElement('div');
    closed.classList.add('close-locators');
    closed.title = 'close';
    closed.addEventListener('click', removeOldInfoBar);
    header.appendChild(closed);

    infoBar.appendChild(header);
    let body = document.createElement('div');
    body.id = 'infoBar-body';

    infoBar.appendChild(body);
    document.body.appendChild(infoBar);
    return infoBar
}

function removeOldInfoBar() {
    if (mutationObserver) {
        mutationObserver.disconnect();
    }
    // clearInterval(IdInterval);
    document.getElementById('locatorsInfoBar').remove();
    document.querySelectorAll('.locators-pin').forEach(el => el.remove());
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>||[]}
 */
function searchByXPath(locator) {
    let elements = [];
    if (locator) {
        let result = document.evaluate(locator, document, null, XPathResult.ANY_TYPE, null);
        let elm = result.iterateNext();
        while (elm) {
            elements.push(elm);
            elm = result.iterateNext();
        }
    }
    return elements;
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>}
 */
function searchByCssSelector(locator) {
    return document.querySelectorAll(locator);
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>}
 */
function searchByClassName(locator) {
    return document.getElementsByClassName(locator);
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>||[]}
 */
function searchById(locator) {
    return searchByCssSelector(`#${locator}`);
}

/**
 * @param locator {String}
 * @return {NodeListOf<HTMLElement>}
 */
function searchByName(locator) {
    return document.getElementsByName(locator);
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<*>}
 */
function searchByTagName(locator) {
    return document.getElementsByTagName(locator);
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>|*[]}
 */
function searchByLinkText(locator) {
    return searchByXPath(`//a[text()="${locator}"]`);
}

/**
 * @param locator {String}
 * @return {HTMLCollectionOf<Element>|*[]}
 */
function searchByPartialLinkText(locator) {
    return searchByXPath(`//a[contains(text(), "${locator}")]`);
}

/**
 * TODO переделать на один урл
 * @param urls {String[]}
 * @return {boolean}
 */
function matchCurrentHref(urls) {
    for (let url of urls) {
        if (location.href.match(url)) {
            return true
        }
    }
    return false;
}

function createModalInfo(info) {
    let old = document.getElementById('locatorsModalInfo');
    if (old) {
        old.remove();
    }
    let body = document.createElement('div');
    body.id = 'locatorsModalInfo';
}


var findElementsBy = {
    "xpath": searchByXPath,
    "id": searchById,
    "link text": searchByLinkText,
    "partial link text": searchByPartialLinkText,
    "name": searchByName,
    "tag name": searchByTagName,
    "class name": searchByClassName,
    "css selector": searchByCssSelector
}

/**
 * @param elements {Node[]}
 * @param info {Object}
 * @return {number}
 */
function createHotSpot(elements, info) {
    let totalCount = 0;
    totalCount += locatorsFindEnabled ? info.find : 0;
    totalCount += locatorsFindEnabled ? info.click : 0;
    totalCount += locatorsFindEnabled ? info.interaction : 0;
    if (!totalCount) {
        return 0;
    }
    let element = elements[0];
    let pin = document.createElement('div');
    pin.classList.add('locators-pin');
    pin.innerText = String(totalCount);
    let data = element.getBoundingClientRect();
    pin.style.top = `${data.y + data.height / 2 - 12}px`;
    let left = data.x - 25 - 10;
    if (left < 0) {
        pin.classList.add('locators-pin-right');
        pin.style.left = `${data.x + data.width + 25 + 10}px`
    } else {
        pin.classList.add('locators-pin-left');
        pin.style.left = `${left}px`;
    }
    element.style.outline = '6px solid #d0011b91';
    pin.title = `By: ${info.by} locator: ${info.fullPath}`;
    pin.style.zIndex = '5000';
    pin.addEventListener('click', () => {
        console.log(info);
    });
    document.body.appendChild(pin);
    return 1;
}


function createLocatorsHotSpots() {
    chrome.storage.local.get(['locators'], items => {
        let totalCount = 0;
        let findCount = 0;
        let clickCount = 0;
        let interactionCount = 0;
        let displayedCount = 0;
        let locatorsNotFound = []
        let locatorsInfo = JSON.parse(items.locators);
        for (let info of locatorsInfo.locators) {
            if (matchCurrentHref(info.urls)) {
                totalCount++;
                let elements = findElementsBy[info.by](info.fullPath);
                if (!elements.length) {
                    locatorsNotFound.push(info);
                    continue;
                }
                findCount += info.find;
                clickCount += info.click;
                interactionCount += info.interaction;
                displayedCount += createHotSpot(elements, info);
            }
        }
    });
}


function renderLocatorsInformation() {
    if (document.getElementById('locatorsInfoBar')) {
        removeOldInfoBar();
    }
    createInfoBar();
    createLoader()
    createLocatorsHotSpots();
}

document.body.style.position = 'relative';
renderLocatorsInformation();


