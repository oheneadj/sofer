// Audio Player Module
// Handles custom audio player functionality for view-dream.html and view-prayer.html

function initAudioPlayer(audioId, playPauseBtnId, progressBarId, progressId, currentTimeId, durationId, volumeBtnId, volumeSliderId) {
    const audio = document.getElementById(audioId);
    const playPauseBtn = document.getElementById(playPauseBtnId);
    const progressBar = document.getElementById(progressBarId);
    const progress = document.getElementById(progressId);
    const currentTimeEl = document.getElementById(currentTimeId);
    const durationEl = document.getElementById(durationId);
    const volumeBtn = document.getElementById(volumeBtnId);
    const volumeSlider = document.getElementById(volumeSliderId);

    if (!audio || !playPauseBtn) return;

    // Format time helper
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.querySelector('i').className = 'hgi-stroke hgi-pause text-xl';
        } else {
            audio.pause();
            playPauseBtn.querySelector('i').className = 'hgi-stroke hgi-play text-xl';
        }
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = progressPercent + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    // Set duration when metadata loads
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    // Seek functionality
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
        });
    }

    // Volume control
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
            updateVolumeIcon(e.target.value);
        });
    }

    // Volume button toggle mute
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.volume = 0;
                volumeSlider.value = 0;
                updateVolumeIcon(0);
            } else {
                audio.volume = 1;
                volumeSlider.value = 100;
                updateVolumeIcon(100);
            }
        });
    }

    // Update volume icon based on level
    function updateVolumeIcon(volume) {
        const icon = volumeBtn.querySelector('i');
        if (volume == 0) {
            icon.className = 'hgi-stroke hgi-volume-mute text-xl';
        } else if (volume < 50) {
            icon.className = 'hgi-stroke hgi-volume-low text-xl';
        } else {
            icon.className = 'hgi-stroke hgi-volume-high text-xl';
        }
    }

    // Reset to play icon when audio ends
    audio.addEventListener('ended', () => {
        playPauseBtn.querySelector('i').className = 'hgi-stroke hgi-play text-xl';
        progress.style.width = '0%';
        audio.currentTime = 0;
    });
}

// Initialize audio players when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Dream audio player
        initAudioPlayer('dreamAudio', 'playPauseBtn', 'progressBar', 'progress', 'currentTime', 'duration', 'volumeBtn', 'volumeSlider');

        // Prayer audio player
        initAudioPlayer('prayerAudio', 'playPauseBtnPrayer', 'progressBarPrayer', 'progressPrayer', 'currentTimePrayer', 'durationPrayer', 'volumeBtnPrayer', 'volumeSliderPrayer');
    });
} else {
    // Dream audio player
    initAudioPlayer('dreamAudio', 'playPauseBtn', 'progressBar', 'progress', 'currentTime', 'duration', 'volumeBtn', 'volumeSlider');

    // Prayer audio player
    initAudioPlayer('prayerAudio', 'playPauseBtnPrayer', 'progressBarPrayer', 'progressPrayer', 'currentTimePrayer', 'durationPrayer', 'volumeBtnPrayer', 'volumeSliderPrayer');
}
