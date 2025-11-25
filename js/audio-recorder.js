// Audio Recording Module for record-dream.html and record-prayer.html
// Handles audio recording, upload, preview, and delete functionality

let mediaRecorder = null;
let audioChunks = [];
let recordingInterval = null;
let recordingStartTime = 0;
let currentAudioBlob = null;

let mediaRecorderPrayer = null;
let audioChunksPrayer = [];
let recordingIntervalPrayer = null;
let recordingStartTimePrayer = 0;
let currentAudioBlobPrayer = null;

// Format time helper
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========== DREAM PAGE FUNCTIONS ==========

// Handle audio file upload
function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (file) {
        currentAudioBlob = file;
        showAudioPreview(file, file.name);
    }
}

// Toggle recording
async function toggleRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                currentAudioBlob = audioBlob;
                showAudioPreview(audioBlob, 'recording.mp3');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            recordingStartTime = Date.now();

            // Show recording status
            document.getElementById('recordingStatus').classList.remove('hidden');
            document.getElementById('audioUploadSection').classList.add('hidden');

            // Update recording time
            recordingInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
                document.getElementById('recordingTime').textContent = formatTime(elapsed);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    }
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(recordingInterval);
        document.getElementById('recordingStatus').classList.add('hidden');
    }
}

// Show audio preview
function showAudioPreview(audioBlob, fileName) {
    const audioPreview = document.getElementById('audioPreview');
    const audioUrl = URL.createObjectURL(audioBlob);

    audioPreview.src = audioUrl;
    document.getElementById('audioFileName').textContent = fileName;
    document.getElementById('audioPreviewSection').classList.remove('hidden');
    document.getElementById('audioUploadSection').classList.add('hidden');

    // Set up preview player
    audioPreview.addEventListener('loadedmetadata', () => {
        document.getElementById('previewDuration').textContent = formatTime(audioPreview.duration);
    });

    audioPreview.addEventListener('timeupdate', () => {
        const progress = (audioPreview.currentTime / audioPreview.duration) * 100;
        document.getElementById('previewProgress').style.width = progress + '%';
        document.getElementById('previewCurrentTime').textContent = formatTime(audioPreview.currentTime);
    });

    audioPreview.addEventListener('ended', () => {
        document.getElementById('previewPlayBtn').querySelector('i').className = 'hgi-stroke hgi-play text-lg';
    });
}

// Toggle audio preview playback
function toggleAudioPreview() {
    const audioPreview = document.getElementById('audioPreview');
    const playBtn = document.getElementById('previewPlayBtn');

    if (audioPreview.paused) {
        audioPreview.play();
        playBtn.querySelector('i').className = 'hgi-stroke hgi-pause text-lg';
    } else {
        audioPreview.pause();
        playBtn.querySelector('i').className = 'hgi-stroke hgi-play text-lg';
    }
}

// Delete audio
function deleteAudio() {
    currentAudioBlob = null;
    document.getElementById('audioPreview').src = '';
    document.getElementById('audioPreviewSection').classList.add('hidden');
    document.getElementById('audioUploadSection').classList.remove('hidden');
    document.getElementById('audioFileInput').value = '';
}

// ========== PRAYER PAGE FUNCTIONS ==========

// Handle audio file upload for prayer
function handleAudioUploadPrayer(event) {
    const file = event.target.files[0];
    if (file) {
        currentAudioBlobPrayer = file;
        showAudioPreviewPrayer(file, file.name);
    }
}

// Toggle recording for prayer
async function toggleRecordingPrayer() {
    if (!mediaRecorderPrayer || mediaRecorderPrayer.state === 'inactive') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderPrayer = new MediaRecorder(stream);
            audioChunksPrayer = [];

            mediaRecorderPrayer.ondataavailable = (event) => {
                audioChunksPrayer.push(event.data);
            };

            mediaRecorderPrayer.onstop = () => {
                const audioBlob = new Blob(audioChunksPrayer, { type: 'audio/mp3' });
                currentAudioBlobPrayer = audioBlob;
                showAudioPreviewPrayer(audioBlob, 'recording.mp3');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderPrayer.start();
            recordingStartTimePrayer = Date.now();

            // Show recording status
            document.getElementById('recordingStatusPrayer').classList.remove('hidden');
            document.getElementById('audioUploadSectionPrayer').classList.add('hidden');

            // Update recording time
            recordingIntervalPrayer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTimePrayer) / 1000);
                document.getElementById('recordingTimePrayer').textContent = formatTime(elapsed);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    }
}

// Stop recording for prayer
function stopRecordingPrayer() {
    if (mediaRecorderPrayer && mediaRecorderPrayer.state === 'recording') {
        mediaRecorderPrayer.stop();
        clearInterval(recordingIntervalPrayer);
        document.getElementById('recordingStatusPrayer').classList.add('hidden');
    }
}

// Show audio preview for prayer
function showAudioPreviewPrayer(audioBlob, fileName) {
    const audioPreview = document.getElementById('audioPreviewPrayer');
    const audioUrl = URL.createObjectURL(audioBlob);

    audioPreview.src = audioUrl;
    document.getElementById('audioFileNamePrayer').textContent = fileName;
    document.getElementById('audioPreviewSectionPrayer').classList.remove('hidden');
    document.getElementById('audioUploadSectionPrayer').classList.add('hidden');

    // Set up preview player
    audioPreview.addEventListener('loadedmetadata', () => {
        document.getElementById('previewDurationPrayer').textContent = formatTime(audioPreview.duration);
    });

    audioPreview.addEventListener('timeupdate', () => {
        const progress = (audioPreview.currentTime / audioPreview.duration) * 100;
        document.getElementById('previewProgressPrayer').style.width = progress + '%';
        document.getElementById('previewCurrentTimePrayer').textContent = formatTime(audioPreview.currentTime);
    });

    audioPreview.addEventListener('ended', () => {
        document.getElementById('previewPlayBtnPrayer').querySelector('i').className = 'hgi-stroke hgi-play text-lg';
    });
}

// Toggle audio preview playback for prayer
function toggleAudioPreviewPrayer() {
    const audioPreview = document.getElementById('audioPreviewPrayer');
    const playBtn = document.getElementById('previewPlayBtnPrayer');

    if (audioPreview.paused) {
        audioPreview.play();
        playBtn.querySelector('i').className = 'hgi-stroke hgi-pause text-lg';
    } else {
        audioPreview.pause();
        playBtn.querySelector('i').className = 'hgi-stroke hgi-play text-lg';
    }
}

// Delete audio for prayer
function deleteAudioPrayer() {
    currentAudioBlobPrayer = null;
    document.getElementById('audioPreviewPrayer').src = '';
    document.getElementById('audioPreviewSectionPrayer').classList.add('hidden');
    document.getElementById('audioUploadSectionPrayer').classList.remove('hidden');
    document.getElementById('audioFileInputPrayer').value = '';
}

// Load example audio on page load (for dream page only)
function loadExampleAudio() {
    const audioPreview = document.getElementById('audioPreview');
    if (audioPreview) {
        // Fetch the example audio file
        fetch('/dream-audio.mp3')
            .then(response => response.blob())
            .then(blob => {
                currentAudioBlob = blob;
                const audioUrl = URL.createObjectURL(blob);

                audioPreview.src = audioUrl;
                document.getElementById('audioFileName').textContent = 'dream-audio.mp3 (Example)';
                document.getElementById('audioPreviewSection').classList.remove('hidden');
                document.getElementById('audioUploadSection').classList.add('hidden');

                // Set up preview player
                audioPreview.addEventListener('loadedmetadata', () => {
                    document.getElementById('previewDuration').textContent = formatTime(audioPreview.duration);
                });

                audioPreview.addEventListener('timeupdate', () => {
                    const progress = (audioPreview.currentTime / audioPreview.duration) * 100;
                    document.getElementById('previewProgress').style.width = progress + '%';
                    document.getElementById('previewCurrentTime').textContent = formatTime(audioPreview.currentTime);
                });

                audioPreview.addEventListener('ended', () => {
                    document.getElementById('previewPlayBtn').querySelector('i').className = 'hgi-stroke hgi-play text-lg';
                });
            })
            .catch(error => {
                console.log('Example audio not loaded:', error);
            });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExampleAudio);
} else {
    loadExampleAudio();
}

