// Emotion Management Module
// Handles custom emotion creation and management

function getEmotions() {
    const emotions = localStorage.getItem('customEmotions');
    return emotions ? JSON.parse(emotions) : [];
}

function saveEmotions(emotions) {
    localStorage.setItem('customEmotions', JSON.stringify(emotions));
}

function selectEmoji(btn, emoji) {
    // Remove active class from all buttons
    document.querySelectorAll('.emoji-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-primary', 'bg-purple-50');
    });
    // Add active class to selected
    btn.classList.add('ring-2', 'ring-primary', 'bg-purple-50');
    document.getElementById('selectedEmoji').value = emoji;
}

function selectColor(btn, color) {
    // Remove active ring from all buttons
    document.querySelectorAll('.color-btn').forEach(b => {
        b.classList.remove('ring-gray-300');
        b.classList.add('ring-transparent');
    });
    // Add active ring to selected
    btn.classList.remove('ring-transparent');
    btn.classList.add('ring-gray-300');
    document.getElementById('selectedColor').value = color;
}

function renderEmotions() {
    const container = document.getElementById('customEmotionsList');
    if (!container) return;

    const emotions = getEmotions();

    if (emotions.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                <i class="hgi-stroke hgi-smile text-3xl mb-2"></i>
                <p>No custom emotions yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = emotions.map((emotion, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-xl" style="background-color: ${emotion.color}20">
                    ${emotion.emoji}
                </div>
                <span class="font-medium text-gray-900">${emotion.name}</span>
            </div>
            <button onclick="deleteEmotion(${index})" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <i class="hgi-stroke hgi-delete-02"></i>
            </button>
        </div>
    `).join('');
}

function deleteEmotion(index) {
    const emotions = getEmotions();
    emotions.splice(index, 1);
    saveEmotions(emotions);
    renderEmotions();
}

function addEmotion() {
    const name = document.getElementById('emotionName').value.trim();
    const emoji = document.getElementById('selectedEmoji').value;
    const color = document.getElementById('selectedColor').value;

    if (!name) {
        alert('Please enter an emotion name');
        return;
    }
    if (!emoji) {
        alert('Please select an emoji icon');
        return;
    }

    const emotions = getEmotions();
    emotions.push({ name, emoji, color, id: Date.now() });
    saveEmotions(emotions);

    // Reset form
    document.getElementById('emotionName').value = '';
    // Reset selection states
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('ring-2', 'ring-primary', 'bg-purple-50'));
    document.querySelectorAll('.color-btn').forEach(b => {
        b.classList.remove('ring-gray-300');
        b.classList.add('ring-transparent');
    });

    renderEmotions();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderEmotions);
} else {
    renderEmotions();
}
