let settings = {
    apiKey: '',
    blurLevel: 5,
    quoteFontSize: 24,
    showTime: true,
    showDate: true
};

document.addEventListener('DOMContentLoaded', async () => {
    const timeContainer = document.querySelector('.time-container');
    const quoteContainer = document.querySelector('.quote-container');
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const quoteElement = document.getElementById('quote');
    const authorElement = document.getElementById('author');

    if (timeContainer) timeContainer.style.opacity = '0';
    if (quoteContainer) quoteContainer.style.opacity = '0';

    console.log('DOM Content Loaded');
    await loadSettings();
    await setRandomBackground();
    await setRandomQuote();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setTimeout(() => {
        if (timeContainer) timeContainer.style.transition = 'opacity 0.5s ease';
        if (timeContainer) timeContainer.style.opacity = '1';
    }, 200);

    setTimeout(() => {
        if (quoteContainer) quoteContainer.style.transition = 'opacity 0.5s ease';
        if (quoteContainer) quoteContainer.style.opacity = '1';
    }, 600);

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            console.log('Settings button clicked');
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });
    }

    const quoteCont = document.querySelector('.quote-container');
    if (quoteCont) {
        quoteCont.style.cursor = 'pointer';
        quoteCont.addEventListener('dblclick', () => {
            const quote = document.getElementById('quote').textContent;
            const author = document.getElementById('author').textContent;
            const fullQuote = `${quote} ${author}`;
            
            navigator.clipboard.writeText(fullQuote)
                .then(() => {
                    quoteCont.style.opacity = '0.5';
                    setTimeout(() => quoteCont.style.opacity = '1', 200);
                });
        });
    }
});

async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get({
            apiKey: '',
            blurLevel: 5,
            quoteFontSize: 24,
            showTime: true,
            showDate: true
        }, (items) => {
            console.log('Loaded settings:', items);
            settings = items;
            applySettings();
            resolve();
        });
    });
}

function applySettings() {
    console.log('Applying settings');
    const container = document.querySelector('.content-box');
    if (container) {
        container.style.backdropFilter = `blur(${settings.blurLevel}px)`;
    }
    
    const quoteElement = document.getElementById('quote');
    if (quoteElement) {
        quoteElement.style.fontSize = `${settings.quoteFontSize}px`;
    }
    
    const timeContainer = document.querySelector('.time-container');
    if (timeContainer) {
        timeContainer.style.display = (settings.showTime || settings.showDate) ? 'block' : 'none';
    }
    
    const timeElement = document.getElementById('time');
    if (timeElement) {
        timeElement.style.display = settings.showTime ? 'block' : 'none';
    }
    
    const dateElement = document.getElementById('date');
    if (dateElement) {
        dateElement.style.display = settings.showDate ? 'block' : 'none';
    }
}

async function setRandomBackground() {
    try {
        if (!settings.apiKey) {
            console.log('No API key, using default background');
            document.body.style.backgroundImage = 'url(https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&q=60&w=1920)';
            return;
        }

        console.log('Fetching background with API key:', settings.apiKey);
        const response = await fetch('https://api.unsplash.com/photos/random?query=nature&orientation=landscape', {
            headers: {
                'Authorization': `Client-ID ${settings.apiKey}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch image');

        const data = await response.json();
        const optimizedUrl = `${data.urls.regular}&auto=format&q=60&w=1920`;
        console.log('Got background image:', optimizedUrl);
        
        const img = new Image();
        img.src = optimizedUrl;
        
        img.onload = () => {
            document.body.style.backgroundImage = `url(${optimizedUrl})`;
            document.body.style.transition = 'background-image 0.5s ease';
        };
    } catch (error) {
        console.error('Error fetching background:', error);
        document.body.style.backgroundImage = 'url(https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&q=60&w=1920)';
    }
}

async function setRandomQuote() {
    try {
        console.log('Fetching quote');
        const response = await fetch('https://api.quotable.io/random?tags=inspirational');
        if (!response.ok) {
            throw new Error('Failed to fetch quote');
        }

        const data = await response.json();
        console.log('Got quote:', data);
        
        const quoteElem = document.getElementById('quote');
        const authorElem = document.getElementById('author');
        
        if (quoteElem && authorElem) {
            quoteElem.textContent = `"${data.content}"`;
            authorElem.textContent = `- ${data.author}`;
        }
    } catch (error) {
        console.error('Error fetching quote:', error);
        const quoteElem = document.getElementById('quote');
        const authorElem = document.getElementById('author');
        
        if (quoteElem && authorElem) {
            quoteElem.textContent = '"The best way to predict the future is to create it."';
            authorElem.textContent = '- Peter Drucker';
        }
    }
}

function updateDateTime() {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');

    if (settings.showTime && timeElement) {
        const time = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        timeElement.textContent = time;
    }
    
    if (settings.showDate && dateElement) {
        const date = new Date().toLocaleDateString([], { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        dateElement.textContent = date;
    }
}