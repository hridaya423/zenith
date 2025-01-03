class TaskManager {
    constructor() {
        this.tasks = [];
        this.init();
    }

    async init() {
        await this.loadTasks();
        this.render();
        this.bindEvents();
        this.startTimeTracking();
    }

    async loadTasks() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({ tasks: [] }, (items) => {
                this.tasks = items.tasks || [];
                resolve();
            });
        });
    }

    async saveTasks() {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ tasks: this.tasks }, resolve);
        });
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addItem') {
                this.addItem();
            }
        });

        const tasksContainer = document.querySelector('#tasks');
        if (tasksContainer) {
            tasksContainer.addEventListener('click', (e) => {
                const itemContainer = e.target.closest('.task-item');
                if (!itemContainer) return;
                
                const id = Number(itemContainer.dataset.id);
                if (e.target.classList.contains('finish-button')) {
                    this.toggleComplete(id);
                } else if (e.target.classList.contains('timer-button')) {
                    this.toggleTimer(id);
                } else if (e.target.classList.contains('delete-button')) {
                    this.deleteItem(id);
                }
            });

            tasksContainer.addEventListener('dblclick', (e) => {
                if (e.target.classList.contains('task-text')) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = e.target.textContent;
                    input.className = 'edit-input';
                    
                    input.addEventListener('blur', () => {
                        const id = Number(e.target.closest('.task-item').dataset.id);
                        this.editItem(id, input.value);
                    });

                    e.target.parentNode.replaceChild(input, e.target);
                    input.focus();
                }
            });
        }
    }

    startTimeTracking() {
        setInterval(() => {
            let updated = false;
            
            this.tasks = this.tasks.map(item => {
                if (item.isTracking) {
                    updated = true;
                    const newTimeSpent = (item.timeSpent || 0) + 1;
                    if (item.estimatedTime && newTimeSpent >= item.estimatedTime * 60) {
                        return { 
                            ...item, 
                            timeSpent: newTimeSpent,
                            isTracking: false,
                            completed: true 
                        };
                    }
                    return { ...item, timeSpent: newTimeSpent };
                }
                return item;
            });
            
            if (updated) {
                this.render();
                this.saveTasks();
            }
        }, 1000);
    }

    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs ? hrs + 'h ' : ''}${mins}m ${secs}s`;
    }

    async addItem() {
        const input = document.getElementById('itemInput');
        const timeInput = document.getElementById('taskTime');
        const text = input?.value?.trim();
        
        if (!text) return;

        const newItem = {
            id: Date.now(),
            text: text,
            completed: false,
            timeSpent: 0,
            isTracking: false,
            estimatedTime: timeInput?.value ? parseInt(timeInput.value) : null
        };

        this.tasks.push(newItem);
        
        if (input) input.value = '';
        if (timeInput) timeInput.value = '';
        
        await this.saveTasks();
        this.render();
    }

    async toggleComplete(id) {
        const item = this.tasks.find(t => t.id === id);
        if (item) {
            item.completed = !item.completed;
            item.isTracking = false;
            await this.saveTasks();
            this.render();
        }
    }

    async toggleTimer(id) {
        const item = this.tasks.find(t => t.id === id);
        if (item) {
            item.isTracking = !item.isTracking;
            await this.saveTasks();
            this.render();
        }
    }

    async deleteItem(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        await this.saveTasks();
        this.render();
    }

    async editItem(id, newText) {
        const item = this.tasks.find(t => t.id === id);
        if (item && newText?.trim()) {
            item.text = newText.trim();
            await this.saveTasks();
            this.render();
        }
    }

    render() {
        const container = document.querySelector('#tasks');
        if (!container) return;
        
        container.innerHTML = `
            <div class="input-group">
                <input type="text" id="itemInput" placeholder="Add new task...">
                <input type="number" id="taskTime" placeholder="Est. time (min)">
                <button id="addItem">Add</button>
            </div>

            <div class="tasks-list">
                ${this.tasks.map(item => `
                    <div class="task-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
                        <div class="task-content">
                            <button class="finish-button">&check;</button>
                            <span class="task-text">${item.text || ''}</span>
                            ${item.estimatedTime ? 
                                `<span class="task-time">${this.formatTime(item.timeSpent)}/${item.estimatedTime}m</span>` : 
                                ''}
                            <button class="timer-button">${item.isTracking ? '||' : '>'}</button>
                            <button class="delete-button">&times;</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.taskManager = new TaskManager();