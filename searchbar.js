class SearchManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.render();
            this.bindEvents();
            this.loadPreferredEngine();
        });
    }

    loadPreferredEngine() {
        chrome.storage.sync.get({ preferredEngine: 'google' }, (items) => {
            const engineSelect = document.getElementById('searchEngine');
            if (engineSelect) {
                engineSelect.value = items.preferredEngine;
            }
        });
    }

    bindEvents() {
        const searchForm = document.getElementById('searchForm');
        const engineSelect = document.getElementById('searchEngine');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        if (engineSelect) {
            engineSelect.addEventListener('change', (e) => {
                chrome.storage.sync.set({ preferredEngine: e.target.value });
            });
        }
    }

    performSearch() {
        const query = document.getElementById('searchInput').value.trim();
        const engine = document.getElementById('searchEngine').value;
        
        if (!query) return;

        const searchEngines = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q='
        };

        const searchUrl = searchEngines[engine] + encodeURIComponent(query);
        window.location.href = searchUrl;
    }

    render() {
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.innerHTML = `
                <form id="searchForm" class="search-form">
                    <select id="searchEngine" class="search-engine">
                        <option value="google">Google</option>
                        <option value="bing">Bing</option>
                        <option value="duckduckgo">DuckDuckGo</option>
                    </select>
                    <input 
                        type="text" 
                        id="searchInput" 
                        class="search-input" 
                        placeholder="Search the web..."
                        autocomplete="off"
                    >
                </form>
            `;
        }
    }
}

new SearchManager();