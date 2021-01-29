const log = chrome.extension.getBackgroundPage().console;


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


window.onload = function () {
    log.log('Open popup');
    chrome.storage.local.get(['locators'], function (result) {
        document.querySelector('.lds-spinner').classList.add('d-none');
        let locators = result.locators || '';
        if (locators.length > 0) {
            log.log('New file');
            document.getElementById('save').classList.remove('d-none');
        } else {
            log.log('Old file');
        }
    });
    // document.getElementById('showLocators').onclick = showData;
    // document.getElementById('save').onclick = downloadData;
}

