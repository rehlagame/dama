// js/ui/timer.js

class Timer {
    constructor() {
        this.timerElement = document.getElementById('game-timer');
        this.seconds = 0;
        this.interval = null;
    }

    // بدء العداد
    start() {
        // نمنع تشغيل أكثر من عداد في نفس الوقت
        if (this.interval) return;

        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();
        }, 1000);
    }

    // إيقاف العداد (عند الفوز أو الخسارة)
    stop() {
        clearInterval(this.interval);
        this.interval = null;
    }

    // تصفير العداد (عند بدء لعبة جديدة)
    reset() {
        this.stop();
        this.seconds = 0;
        this.updateDisplay();
    }

    // تحديث الأرقام على الشاشة بصيغة احترافية (دقائق:ثواني)
    updateDisplay() {
        const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        this.timerElement.textContent = `${mins}:${secs}`;
    }
}