function locatorsValidateLocators(data) {
    console.debug('Start validateLocators');
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

function locatorsCreateMessage(text = "", backgroundColor = '#e14f4f') {
    const width = 300;
    let block = document.createElement('div');
    block.style.zIndex = '10000';
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
    p.innerText = text;
    p.style.lineHeight = '40px';
    p.style.margin = '0';
    p.style.textAlign = 'center';
    p.style.color = 'white';
    p.style.fontWeight = 'bold';
    block.appendChild(p);
    block.addEventListener('click', () => block.remove());
    setInterval(function () {
        block.remove();
    }, 3000)
    document.body.appendChild(block);
}

function locatorsCreateErrorMsg(fileName = '') {
    locatorsCreateMessage(`Error upload json file ${fileName}`)
}

function locatorsCreateSuccessMsg(fileName = '') {
    locatorsCreateMessage(`Upload json file ${fileName}`, '#338544')
}


function locatorsDownloadJsonFile() {
    console.debug('Load script');
    let locatorDataSourceInput = document.createElement('input');
    locatorDataSourceInput.type = 'file';
    locatorDataSourceInput.id = 'locatorDataSource';
    locatorDataSourceInput.style.display = 'none';
    locatorDataSourceInput.accept = '.json'
    locatorDataSourceInput.addEventListener('change', () => {
        let file = locatorDataSourceInput.files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            console.debug('locatorDataSourceInput onload');
            try {
                let loaded = JSON.parse(reader.result);
                let data = {
                    time: new Date().toLocaleDateString(),
                    name: file.name,
                    locators: loaded
                }
                locatorsValidateLocators(data);
                chrome.storage.local.set({locators: JSON.stringify(data)}, function () {
                    console.debug('Save storage');
                    locatorsCreateSuccessMsg(file.name);
                });
            } catch (e) {
                console.debug(e);
                locatorsCreateErrorMsg(file.name);
            }
            locatorDataSourceInput.remove();
        };
    });
    document.body.appendChild(locatorDataSourceInput);
    locatorDataSourceInput.click();
}
locatorsDownloadJsonFile();