// Navigation Module - Mobile Menu, Notification Drawer, Create Menu
// This module handles all navigation-related functionality

// Mobile Menu Logic
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
    const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    function toggleMobileMenu() {
        const isHidden = mobileMenuDrawer.classList.contains('-translate-x-full');
        if (isHidden) {
            mobileMenuDrawer.classList.remove('-translate-x-full');
            mobileMenuOverlay.classList.remove('hidden');
            setTimeout(() => mobileMenuOverlay.classList.remove('opacity-0'), 10);
        } else {
            mobileMenuDrawer.classList.add('-translate-x-full');
            mobileMenuOverlay.classList.add('opacity-0');
            setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', toggleMobileMenu);
}

// Notification Drawer Logic
function initNotificationDrawer() {
    const notificationBtnDesktop = document.getElementById('notificationBtnDesktop');
    const notificationBtnMobile = document.getElementById('notificationBtnMobile');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');
    const notificationDrawer = document.getElementById('notificationDrawer');
    const notificationOverlay = document.getElementById('notificationOverlay');

    function toggleNotificationDrawer() {
        const isHidden = notificationDrawer.classList.contains('translate-x-full');
        if (isHidden) {
            notificationDrawer.classList.remove('translate-x-full');
            notificationOverlay.classList.remove('hidden');
            setTimeout(() => notificationOverlay.classList.remove('opacity-0'), 10);
        } else {
            notificationDrawer.classList.add('translate-x-full');
            notificationOverlay.classList.add('opacity-0');
            setTimeout(() => notificationOverlay.classList.add('hidden'), 300);
        }
    }

    if (notificationBtnDesktop) notificationBtnDesktop.addEventListener('click', toggleNotificationDrawer);
    if (notificationBtnMobile) notificationBtnMobile.addEventListener('click', toggleNotificationDrawer);
    if (closeNotificationBtn) closeNotificationBtn.addEventListener('click', toggleNotificationDrawer);
    if (notificationOverlay) notificationOverlay.addEventListener('click', toggleNotificationDrawer);
}

// Create Menu Logic
function initCreateMenu() {
    const createBtn = document.getElementById('createBtn');
    const createMenu = document.getElementById('createMenu');

    if (createBtn && createMenu) {
        createBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = createMenu.classList.contains('hidden');
            if (isHidden) {
                createMenu.classList.remove('hidden');
                setTimeout(() => createMenu.classList.remove('opacity-0'), 10);
            } else {
                createMenu.classList.add('opacity-0');
                setTimeout(() => createMenu.classList.add('hidden'), 200);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!createMenu.contains(e.target) && !createBtn.contains(e.target)) {
                createMenu.classList.add('opacity-0');
                setTimeout(() => createMenu.classList.add('hidden'), 200);
            }
        });
    }
}

// Streak Drawer Logic (for index.html)
function initStreakDrawer() {
    const streakBtn = document.getElementById('streakBtn');
    const closeStreakBtn = document.getElementById('closeStreakBtn');
    const streakDrawer = document.getElementById('streakDrawer');
    const streakOverlay = document.getElementById('streakOverlay');

    function toggleStreakDrawer() {
        const isHidden = streakDrawer.classList.contains('translate-y-full');
        if (isHidden) {
            streakDrawer.classList.remove('translate-y-full');
            streakOverlay.classList.remove('hidden');
            setTimeout(() => streakOverlay.classList.remove('opacity-0'), 10);
        } else {
            streakDrawer.classList.add('translate-y-full');
            streakOverlay.classList.add('opacity-0');
            setTimeout(() => streakOverlay.classList.add('hidden'), 300);
        }
    }

    if (streakBtn) streakBtn.addEventListener('click', toggleStreakDrawer);
    if (closeStreakBtn) closeStreakBtn.addEventListener('click', toggleStreakDrawer);
    if (streakOverlay) streakOverlay.addEventListener('click', toggleStreakDrawer);
}

// Profile Dropdown Logic
function initProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }
}

// Initialize all navigation components
function initNavigation() {
    initMobileMenu();
    initNotificationDrawer();
    initCreateMenu();
    initStreakDrawer();
    initProfileDropdown();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
