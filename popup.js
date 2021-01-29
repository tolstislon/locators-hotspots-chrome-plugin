function showCoverage() {
    chrome.extension.getBackgroundPage().console.log('Start Parsing')
    createLoader();
    chrome.storage.local.get(["locators"], function (items) {
        chrome.extension.getBackgroundPage().console.log(" # " + items.locators)
        var stringify = JSON.stringify(items.locators);
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.executeScript(
                tabs[0].id, {
                    code: `localStorage.setItem("locators", ${stringify});`
                });
        });
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.insertCSS(tabs[0].id, {
                file: "onpage/main.css"
            });
            chrome.tabs.executeScript(tabs[0].id, {file: "onpage/split-page.js"}, function () {
                chrome.tabs.executeScript(tabs[0].id, {file: "onpage/show-locators.js"}, function () {
                    chrome.tabs.executeScript(tabs[0].id, {file: "onpage/show-info.js"})
                })
            });
        });
    });
}


function testShowCoverage() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.insertCSS(tabs[0].id, {file: "onpage/main.css"});
        chrome.tabs.executeScript(tabs[0].id, {file: "onpage/info-bar.js"});
    });
    window.close();
}


function validateLocators(data) {
    chrome.extension.getBackgroundPage().console.log('start validateLocators');
    if (Array.isArray(data.locators) && data.locators.length > 0) {
        data.locators.forEach(elem => {
            if (!elem.by || !elem.fullPath || !elem.urls) {
                throw "Invalid json"
            }
        })
    } else {
        throw "Invalid json"
    }
}


function removeLocators() {
    chrome.storage.local.set({'locators': ''}, () => createDownload());
}

function updateContainer(element) {
    let container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild(element);
}

function createLoader() {
    let loader = document.createElement('div');
    loader.classList.add('lds-spinner');
    for (let i = 0; i < 12; i++) {
        loader.appendChild(document.createElement('div'));
    }
    updateContainer(loader);
}

function createFileView(data) {
    let task = document.createElement('div');
    task.classList.add('tasks');
    let taskBody = document.createElement('div');
    taskBody.addEventListener('click', testShowCoverage);
    taskBody.classList.add('tasks-body');
    let h = document.createElement('h5');
    h.innerText = data.name || 'No file name';
    taskBody.appendChild(h);
    let p = document.createElement('p');
    p.innerText = `file uploaded: ${data.time || "No date"}`;
    taskBody.appendChild(p);
    task.appendChild(taskBody);
    let remove = document.createElement('div');
    remove.classList.add('remove');
    remove.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">\n' +
        '  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>\n' +
        '</svg>'
    remove.title = 'remove';
    remove.addEventListener('click', removeLocators);
    task.appendChild(remove);
    updateContainer(task);
}


function createDownload() {
    let upload = document.createElement('div');
    upload.classList.add('upload');
    let button = document.createElement('button');
    button.type = 'button';
    button.id = 'save';
    button.innerText = 'Upload Json File';
    button.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.executeScript(tabs[0].id, {file: "onpage/download.js"})
        });
    });
    upload.appendChild(button);
    updateContainer(upload);
}

function openPopup() {
    chrome.storage.local.get(['locators'], item => {
        try {
            let data = JSON.parse(item.locators);
            validateLocators(data);
            createFileView(data);
        } catch (e) {
            chrome.extension.getBackgroundPage().console.error(e)
            createDownload();
        }

    })
}

window.addEventListener('load', openPopup);