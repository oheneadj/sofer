// Filters Module
// Handles filtering functionality for lists

function toggleFilter() {
    const dropdown = document.getElementById('filterDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

function applyFilter(period) {
    console.log('Filter applied:', period);
    // Here you would filter the data based on the period
    toggleFilter();
    alert(`Filter applied: ${period}`);
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const filterButton = document.getElementById('filterButton');
    const filterDropdown = document.getElementById('filterDropdown');

    if (filterButton && filterDropdown && !filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
        filterDropdown.classList.add('hidden');
    }
});
