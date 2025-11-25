// Mood Logger Module
// Handles quick mood logging functionality

function quickLogMood(name, emoji) {
    const moodLog = {
        name,
        emoji,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };

    let moodLogs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
    moodLogs.unshift(moodLog);

    // Keep only the last 30 logs
    localStorage.setItem('moodLogs', JSON.stringify(moodLogs.slice(0, 30)));

    alert(`Mood logged: ${emoji} ${name}`);
}
