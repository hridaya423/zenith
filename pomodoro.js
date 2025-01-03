class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.mode = 'work';
        this.timer = null;
        this.initUI();
        this.bindEvents();
    }

    initUI() {
        const template = `
            <div class="pomodoro-container">
                <div class="pomodoro-mode">${this.mode === 'work' ? 'Work Time' : 'Break Time'}</div>
                <div class="pomodoro-time">${this.formatTime(this.timeLeft)}</div>
                <div class="pomodoro-controls">
                    <button class="pomodoro-toggle">Start</button>
                    <button class="pomodoro-reset">Reset</button>
                </div>
            </div>
        `;
        document.querySelector('#pomodoro').innerHTML = template;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    bindEvents() {
        document.querySelector('.pomodoro-toggle').addEventListener('click', () => this.toggleTimer());
        document.querySelector('.pomodoro-reset').addEventListener('click', () => this.resetTimer());
    }

    toggleTimer() {
        this.isRunning = !this.isRunning;
        document.querySelector('.pomodoro-toggle').textContent = this.isRunning ? 'Pause' : 'Start';
        
        if (this.isRunning) {
            this.timer = setInterval(() => this.tick(), 1000);
        } else {
            clearInterval(this.timer);
        }
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            document.querySelector('.pomodoro-time').textContent = this.formatTime(this.timeLeft);
        } else {
            this.handleTimerComplete();
        }
    }

    handleTimerComplete() {
        clearInterval(this.timer);
        this.isRunning = false;
        
        new Notification('Pomodoro Timer', {
            body: `${this.mode === 'work' ? 'Work' : 'Break'} session completed!`
        });

        this.mode = this.mode === 'work' ? 'break' : 'work';
        this.timeLeft = this.mode === 'work' ? 25 * 60 : 5 * 60;
        document.querySelector('.pomodoro-mode').textContent = 
            this.mode === 'work' ? 'Work Time' : 'Break Time';
        document.querySelector('.pomodoro-time').textContent = 
            this.formatTime(this.timeLeft);
        document.querySelector('.pomodoro-toggle').textContent = 'Start';
    }

    resetTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.timeLeft = this.mode === 'work' ? 25 * 60 : 5 * 60;
        document.querySelector('.pomodoro-time').textContent = 
            this.formatTime(this.timeLeft);
        document.querySelector('.pomodoro-toggle').textContent = 'Start';
    }
}

document.addEventListener('DOMContentLoaded', () => new PomodoroTimer());