// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const guestBtn = document.getElementById('guest-btn');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('[id$="-tab"]');
const likeButtons = document.querySelectorAll('.like-btn');
const commentToggles = document.querySelectorAll('.comment-toggle');
const publishPostBtn = document.getElementById('publish-post');
const postText = document.getElementById('post-text');
const mediaOptions = document.querySelectorAll('.media-option');
const textPost = document.getElementById('text-post');
const photoPost = document.getElementById('photo-post');
const videoPost = document.getElementById('video-post');
const addPhotoBtn = document.getElementById('add-photo');
const addVideoBtn = document.getElementById('add-video');
const photoInput = document.getElementById('photo-input');
const videoInput = document.getElementById('video-input');
const viewOtherProfileBtn = document.getElementById('view-other-profile');
const backToOwnProfileBtn = document.getElementById('back-to-own-profile');
const followBtn = document.querySelector('.follow-btn');
const postsContainer = document.getElementById('posts-container'); 

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!prefersDark) {
        document.documentElement.classList.remove('dark');
        themeToggle.innerHTML = '☀️';
        document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)';
    }
    
    // Auto-login for demo
    setTimeout(() => {
        if(loginScreen) {
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }
    }, 1500);
}); 

// Login/Logout Functions
if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        localStorage.setItem('fuadsi_logged_in', 'true');
    });
} 

if(signupBtn) {
    signupBtn.addEventListener('click', () => {
        alert('Sign up functionality would be implemented here. For demo, using login.');
    });
} 

if(guestBtn) {
    guestBtn.addEventListener('click', () => {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        localStorage.setItem('fuadsi_logged_in', 'guest');
    });
} 

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            appContainer.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            localStorage.removeItem('fuadsi_logged_in');
            
            // Reset to home tab
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('[id$="-tab"]').forEach(tab => tab.classList.add('hidden'));
            document.querySelector('[data-tab="home-tab"]').classList.add('active');
            document.getElementById('home-tab').classList.remove('hidden');
            
            // Reset profile view
            document.getElementById('other-profile').classList.add('hidden');
            document.getElementById('own-profile').classList.remove('hidden');
        }
    });
} 

// Theme Toggle
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const htmlEl = document.documentElement;
        const isDark = htmlEl.classList.contains('dark');
        if (isDark) {
            htmlEl.classList.remove('dark');
            themeToggle.innerHTML = '☀️';
            document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)';
        } else {
            htmlEl.classList.add('dark');
            themeToggle.innerHTML = '🌙';
            document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        }
    });
} 

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update active nav item
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected tab
        const tabId = item.getAttribute('data-tab');
        tabs.forEach(tab => {
            if (tab.id === tabId) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        });
        
        // Special handling for messages tab
        if (tabId === 'messages-tab') {
            document.getElementById('active-chat').classList.add('hidden');
        }
    });
}); 

// Like Functionality & Comments
document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn')) {
        const btn = e.target.closest('.like-btn');
        const countEl = btn.querySelector('.like-count');
        let count = parseInt(countEl.textContent);
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            btn.querySelector('span:first-child').textContent = '♡';
            countEl.textContent = count - 1;
        } else {
            btn.classList.add('active');
            btn.querySelector('span:first-child').textContent = '❤️';
            countEl.textContent = count + 1;
        }
    }
    
    // Comment toggle
    if (e.target.closest('.comment-toggle')) {
        const postCard = e.target.closest('.post-card');
        const commentSection = postCard.querySelector('.comment-section');
        commentSection.classList.toggle('active');
    }
    
    // Add comment
    if (e.target.closest('.add-comment')) {
        const commentField = e.target.closest('.comment-input').querySelector('.comment-field');
        if (commentField.value.trim() !== '') {
            const commentsContainer = e.target.closest('.post-card').querySelector('.space-y-2');
            const newComment = document.createElement('div');
            newComment.className = 'flex space-x-2';
            newComment.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex-shrink-0"></div>
                <div>
                    <p class="text-white"><span class="font-bold">You</span> ${commentField.value.trim()}</p>
                    <p class="text-xs text-gray-400 mt-1">Just now</p>
                </div>
            `;
            commentsContainer.appendChild(newComment);
            commentField.value = '';
            
            // Update comment count
            const commentBtn = e.target.closest('.post-card').querySelector('.comment-toggle span:last-child');
            commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
        }
    }
}); 

// Media Post Selection
mediaOptions.forEach(option => {
    option.addEventListener('click', () => {
        mediaOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        const type = option.getAttribute('data-type');
        textPost.classList.add('hidden');
        photoPost.classList.add('hidden');
        videoPost.classList.add('hidden');
        if (type === 'text') textPost.classList.remove('hidden');
        if (type === 'photo') photoPost.classList.remove('hidden');
        if (type === 'video') videoPost.classList.remove('hidden');
    });
}); 

// Add Media Buttons
if(addPhotoBtn) {
    addPhotoBtn.addEventListener('click', () => {
        photoInput.click();
    });
} 

if(addVideoBtn) {
    addVideoBtn.addEventListener('click', () => {
        videoInput.click();
    });
} 

if(photoInput) {
    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const preview = photoPost.querySelector('.media-preview');
            preview.innerHTML = `<img src="${URL.createObjectURL(e.target.files[0])}" alt="Selected photo">`;
        }
    });
} 

if(videoInput) {
    videoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const preview = videoPost.querySelector('.media-preview');
            preview.innerHTML = `<video src="${URL.createObjectURL(e.target.files[0])}" controls></video>`;
        }
    });
} 

// Publish Post
if(publishPostBtn) {
    publishPostBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.media-option.active').getAttribute('data-type');
        let content = '';
        if (activeTab === 'text' && postText.value.trim() !== '') {
            content = postText.value.trim();
        } else if (activeTab === 'photo' && photoPost.querySelector('img')) {
            content = '📸 Shared a photo';
        } else if (activeTab === 'video' && videoPost.querySelector('video')) {
            content = '🎥 Shared a video';
        } else {
            alert('Please add content to your post');
            return;
        }
        
        // Create new post
        const newPost = document.createElement('div');
        newPost.className = 'post-card bg-dark-800 border border-gray-800 fade-in';
        newPost.style.animationDelay = '0s';
        newPost.innerHTML = `
            <div class="p-4 border-b border-gray-800 flex items-center space-x-3">
                <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">Y</div>
                    <div class="online-badge"></div>
                </div>
                <div>
                    <p class="font-bold text-white">You</p>
                    <p class="text-xs text-gray-400">Just now</p>
                </div>
                <div class="ml-auto text-gray-400 text-lg">⋯</div>
            </div>
            <div class="p-4">
                <p class="text-white mb-3">${content}</p>
                <div class="flex justify-between text-gray-400">
                    <div class="flex space-x-4">
                        <button class="like-btn flex items-center space-x-1 hover:text-red-400 transition">
                            <span>♡</span>
                            <span class="like-count">0</span>
                        </button>
                        <button class="flex items-center space-x-1 hover:text-blue-400 transition comment-toggle">
                            <span>💬</span>
                            <span>0</span>
                        </button>
                    </div>
                    <button class="hover:text-purple-400 transition">↪️</button>
                </div>
                <div class="comment-section mt-3">
                    <div class="space-y-2 mb-2 max-h-48 overflow-y-auto"></div>
                    <div class="comment-input">
                        <input type="text" placeholder="Add a comment..." class="comment-field">
                        <button class="add-comment">➤</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to top of feed
        postsContainer.insertBefore(newPost, postsContainer.firstChild);
        
        // Reset form
        postText.value = '';
        photoPost.querySelector('.media-preview').innerHTML = '<div class="text-gray-500">+ Tap to select photo</div>';
        videoPost.querySelector('.media-preview').innerHTML = '<div class="text-gray-500">+ Tap to select video</div>';
        photoInput.value = '';
        videoInput.value = '';
        
        // Switch to home tab
        navItems.forEach(i => i.classList.remove('active'));
        document.querySelector('[data-tab="home-tab"]').classList.add('active');
        tabs.forEach(tab => tab.classList.add('hidden'));
        document.getElementById('home-tab').classList.remove('hidden');
        alert('Post published successfully!');
    });
} 

// Profile Switching
if(viewOtherProfileBtn) {
    viewOtherProfileBtn.addEventListener('click', () => {
        document.getElementById('own-profile').classList.add('hidden');
        document.getElementById('other-profile').classList.remove('hidden');
    });
} 

if(backToOwnProfileBtn) {
    backToOwnProfileBtn.addEventListener('click', () => {
        document.getElementById('other-profile').classList.add('hidden');
        document.getElementById('own-profile').classList.remove('hidden');
    });
} 

// Follow Button
if (followBtn) {
    followBtn.addEventListener('click', () => {
        if (followBtn.classList.contains('following')) {
            followBtn.classList.remove('following');
            followBtn.innerHTML = '<span>Follow</span>';
            followBtn.classList.remove('bg-gray-700');
            followBtn.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-blue-500');
        } else {
            followBtn.classList.add('following');
            followBtn.innerHTML = '<span>Following</span>';
            followBtn.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-blue-500');
            followBtn.classList.add('bg-gray-700');
        }
    });
} 

// Camera Capture Simulation
const cameraBtn = document.querySelector('.camera-btn:nth-child(2)');
if(cameraBtn) {
    cameraBtn.addEventListener('click', () => {
        const btn = cameraBtn;
        const originalBg = btn.style.backgroundColor;
        const originalContent = btn.innerHTML;
        btn.style.backgroundColor = '#ef4444';
        btn.innerHTML = '■';
        setTimeout(() => {
            btn.style.backgroundColor = originalBg;
            btn.innerHTML = originalContent;
            // Show capture animation
            const screen = document.querySelector('.camera-screen');
            screen.style.animation = 'pulse 0.3s';
            setTimeout(() => {
                screen.style.animation = '';
            }, 300);
        }, 800);
    });
} 

// Message Chat Simulation
document.querySelectorAll('#messages-tab .bg-dark-800').forEach(chat => {
    chat.addEventListener('click', () => {
        document.querySelectorAll('#messages-tab > div').forEach(el => {
            if (el.id !== 'active-chat' && !el.classList.contains('space-y-4')) {
                el.classList.add('hidden');
            }
        });
        document.getElementById('active-chat').classList.remove('hidden');
        // Scroll to bottom of chat
        const chatBox = document.querySelector('#active-chat .h-96');
        if(chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    });
});
