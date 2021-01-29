const log = console;


function downloadData() {
    log.debug('Start downloadData');
    let source = document.getElementById('dataSource').value;
    log.log("Download: " + source);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "file:///" + source, true);
    xhr.send();
    document.getElementById('save').disabled = true;
    xhr.onreadystatechange = function () {
        log.log(xhr.readyState);
        if (xhr.readyState === 4) {
            // try {
            //     var resp = JSON.parse(xhr.responseText);
            // } catch (e) {
            //     bkg.console.error(e);
            // }
            log.log(xhr.responseText);
            chrome.storage.local.set({locators: xhr.responseText}, function () {
                log.log('Save storage')
            });
        }
    };
    bkg.console.debug('wait response');
}

function showData() {
    chrome.storage.local.get(["locators"], function (items) {
        log.log(" # " + items.locators)
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


function showCoverage() {
    log.log('Start Parsing')
    createLoader();
}


function validateLocators(data) {
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
    localStorage.removeItem('locators');
    createDownload();
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


function createErrorMsg(fileName = '', backgroundColor = '#e14f4f') {
    const width = 300;
    let block = document.createElement('div');
    block.style.backgroundColor = backgroundColor;
    block.style.position = 'fixed';
    let leftPosition = (document.documentElement.clientWidth / 2) - (width / 2);
    block.style.left = `${leftPosition}px`;
    block.style.top = '0px';
    block.style.width = `${width}px`;
    block.style.height = '40px';
    block.style.boxShadow = '2px 4px 20px #00000085';
    block.style.borderRadius = '0 0 .25rem .25rem';
    let p = document.createElement('p');
    p.innerText = 'Error upload Json File';
    p.style.lineHeight = '40px';
    p.style.margin = '0';
    p.style.textAlign = 'center';
    p.style.color = 'white';
    p.style.fontWeight = 'bold';
    block.appendChild(p);
    // block.addEventListener('click', () => block.remove());
    // setInterval(function () {
    //     block.remove();
    // }, 3000)
    document.body.appendChild(block);
}

function createFileView(data) {
    let task = document.createElement('div');
    task.classList.add('tasks');
    let taskBody = document.createElement('div');
    taskBody.addEventListener('click', showCoverage);
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
    let input = document.createElement('input');
    input.type = 'file';
    input.id = 'dataSource';
    input.style.display = 'none';
    input.accept = '.json'
    input.addEventListener('change', () => {
        let file = input.files[0];
        let reader = new FileReader();
        createLoader();
        reader.readAsText(file);
        reader.onload = function () {
            try {
                let loaded = JSON.parse(reader.result);
                let data = {
                    time: new Date().toLocaleDateString(),
                    name: file.name,
                    locators: loaded
                }
                validateLocators(data);
                localStorage.setItem('locators', JSON.stringify(data));
                createFileView(data);
            } catch (e) {
                log.debug(e);
                createErrorMsg(file.name);
            }
        };
    });
    upload.appendChild(input);
    let button = document.createElement('button');
    button.type = 'button';
    button.id = 'save';
    button.innerText = 'Upload Json File';
    button.addEventListener('click', () => input.click());
    upload.appendChild(button);
    updateContainer(upload);
}

function openPopup() {
    try {
        let data = JSON.parse(localStorage.getItem('locators'));
        validateLocators(data);
        createFileView(data);
    } catch (e) {
        createDownload();
    }
}

window.addEventListener('load', createErrorMsg);

