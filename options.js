document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get({
        apiKey: '',
        blurLevel: 5,
        quoteFontSize: 24,
        showTime: true,
        showDate: true
    }, (items) => {
        document.getElementById('apiKey').value = items.apiKey;
        document.getElementById('blurLevel').value = items.blurLevel;
        document.getElementById('quoteFontSize').value = items.quoteFontSize;
        document.getElementById('showTime').checked = items.showTime;
        document.getElementById('showDate').checked = items.showDate;
    });

    document.getElementById('save').addEventListener('click', () => {
        const button = document.getElementById('save');
        const settings = {
            apiKey: document.getElementById('apiKey').value,
            blurLevel: document.getElementById('blurLevel').value,
            quoteFontSize: document.getElementById('quoteFontSize').value,
            showTime: document.getElementById('showTime').checked,
            showDate: document.getElementById('showDate').checked
        };

        chrome.storage.sync.set(settings, () => {
            button.textContent = 'Saved!';
            button.classList.add('success');
            setTimeout(() => {
                chrome.tabs.create({ url: 'chrome://newtab' }, () => {
                    window.close();
                }); 
            }, 500);
        });

    document.getElementById('blurLevel').addEventListener('input', (e) => {
        document.getElementById('blurLevel').style.background = 
            `linear-gradient(to right, #3B82F6 ${e.target.value * 5}%, #E5E7EB ${e.target.value * 5}%)`;
    });

    document.getElementById('quoteFontSize').addEventListener('input', (e) => {
        document.getElementById('quoteFontSize').style.background = 
            `linear-gradient(to right, #3B82F6 ${(e.target.value - 16) * 6.25}%, #E5E7EB ${(e.target.value - 16) * 6.25}%)`;
    });
})})
