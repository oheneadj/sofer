// Tags Management Module
// Handles tag creation, selection, and rendering

const tagIcons = [
    'hgi-user-group', 'hgi-heart', 'hgi-briefcase-01', 'hgi-coins-swap', 'hgi-prayer-hands-02',
    'hgi-home-01', 'hgi-airplane-01', 'hgi-book-open-01', 'hgi-check-circle', 'hgi-star',
    'hgi-alert-02', 'hgi-sun-01', 'hgi-moon-02', 'hgi-sparkles', 'hgi-repeat', 'hgi-eye', 'hgi-user'
];

const tagColors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#14b8a6'
];

let selectedTags = new Set();
let config = {
    storageKey: 'tags',
    containerId: 'tagsContainer',
    defaultTags: []
};

function initTags(options) {
    config = { ...config, ...options };

    if (!localStorage.getItem(config.storageKey)) {
        saveTags(config.defaultTags);
    }

    renderTags();

    // Close modal on outside click
    const modal = document.getElementById('tagModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target.id === 'tagModal') closeTagModal();
        });
    }
}

function getTags() {
    const stored = localStorage.getItem(config.storageKey);
    return stored ? JSON.parse(stored) : config.defaultTags;
}

function saveTags(tags) {
    localStorage.setItem(config.storageKey, JSON.stringify(tags));
}

function renderTags() {
    const tags = getTags();
    const container = document.getElementById(config.containerId);
    if (!container) return;

    container.innerHTML = tags.map(tag => {
        const isSelected = selectedTags.has(tag.id);
        const bgStyle = isSelected ? `background-color: ${tag.color}20; border-color: ${tag.color}; color: ${tag.color}` : `background-color: #f9fafb; border-color: #e5e7eb; color: #374151`;

        return `
            <button type="button" onclick="toggleTag(${tag.id})"
                class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                style="${bgStyle}">
                <i class="hgi-stroke ${tag.icon}"></i>
                ${tag.name}
            </button>
        `;
    }).join('');

    // Update hidden input
    const input = document.getElementById('selectedTagsInput');
    if (input) {
        input.value = Array.from(selectedTags).join(',');
    }
}

function toggleTag(id) {
    if (selectedTags.has(id)) {
        selectedTags.delete(id);
    } else {
        selectedTags.add(id);
    }
    renderTags();
}

// Modal Functions
function openTagModal() {
    const modal = document.getElementById('tagModal');
    if (modal) {
        modal.classList.remove('hidden');
        renderTagIcons();
        renderTagColors();
    }
}

function closeTagModal() {
    const modal = document.getElementById('tagModal');
    if (modal) {
        modal.classList.add('hidden');
        const nameInput = document.getElementById('modalTagName');
        if (nameInput) nameInput.value = '';
    }
}

function renderTagIcons() {
    const container = document.getElementById('tagIconPicker');
    if (!container) return;

    const iconInput = document.getElementById('modalTagIcon');
    const currentIcon = iconInput ? (iconInput.value || tagIcons[0]) : tagIcons[0];

    if (iconInput) iconInput.value = currentIcon;

    container.innerHTML = tagIcons.map(icon => `
        <button type="button" onclick="selectTagIcon('${icon}')"
            class="p-2 rounded-lg border ${icon === currentIcon ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50'} flex items-center justify-center transition-all">
            <i class="hgi-stroke ${icon} text-xl"></i>
        </button>
    `).join('');
}

function selectTagIcon(icon) {
    const input = document.getElementById('modalTagIcon');
    if (input) {
        input.value = icon;
        renderTagIcons();
    }
}

function renderTagColors() {
    const container = document.getElementById('tagColorPicker');
    if (!container) return;

    const colorInput = document.getElementById('modalTagColor');
    const currentColor = colorInput ? (colorInput.value || tagColors[0]) : tagColors[0];

    container.innerHTML = tagColors.map(color => `
        <button type="button" onclick="selectTagColor('${color}')"
            class="w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === currentColor ? 'ring-2 ring-offset-2 ring-gray-300' : ''}"
            style="background-color: ${color}">
        </button>
    `).join('');
}

function selectTagColor(color) {
    const input = document.getElementById('modalTagColor');
    if (input) {
        input.value = color;
        renderTagColors();
    }
}

function addTagFromModal() {
    const nameInput = document.getElementById('modalTagName');
    const iconInput = document.getElementById('modalTagIcon');
    const colorInput = document.getElementById('modalTagColor');

    if (!nameInput || !iconInput || !colorInput) return;

    const name = nameInput.value.trim();
    const icon = iconInput.value;
    const color = colorInput.value;

    if (!name) {
        alert('Please enter a tag name');
        return;
    }

    const tags = getTags();
    const newTag = { id: Date.now(), name, icon, color };
    tags.push(newTag);
    saveTags(tags);

    // Auto-select the new tag
    selectedTags.add(newTag.id);

    closeTagModal();
    renderTags();
}
