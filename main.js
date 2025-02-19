// Main JavaScript file for CryptoProfile platform

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const connectWalletBtn = document.querySelector('.connect-wallet');
    const profileForm = document.querySelector('#profileForm');
    const roleOptions = document.querySelectorAll('.role-option');
    const usernameInput = document.querySelector('#username');
    const profileColorInput = document.querySelector('#profileColor');
    const profileBannerInput = document.querySelector('#profileBanner');
    const socialInputs = document.querySelectorAll('.social-input input');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    
    // Preview elements
    const previewUsername = document.querySelector('#previewUsername');
    const previewRole = document.querySelector('#previewRole');
    const previewWallet = document.querySelector('#previewWallet');
    const previewBannerImg = document.querySelector('#previewBannerImg');
    const previewCard = document.querySelector('.preview-card');
    
    let isWalletConnected = false;
    let selectedRole = null;

    // Initialize preview
    function initializePreview() {
        if (usernameInput) updateUsername();
        if (profileColorInput) updateThemeColor();
        updateSocialLinks();
    }
    
    // Username preview
    function updateUsername() {
        const username = usernameInput.value.trim();
        previewUsername.textContent = username || 'Username';
        previewUsername.style.color = username ? 'var(--text-primary)' : 'var(--text-secondary)';
    }

    // Role preview
    function updateRole(role) {
        if (!role) return;
        
        previewRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        previewRole.className = `role-badge ${role}`;
        
        // Update avatar icon based on role
        const previewAvatar = document.querySelector('.preview-avatar i');
        const roleIcons = {
            trader: 'fa-chart-line',
            artist: 'fa-palette',
            collector: 'fa-gem'
        };
        
        previewAvatar.className = `fas ${roleIcons[role] || 'fa-user-circle'}`;
    }

    // Theme color preview
    function updateThemeColor() {
        const color = profileColorInput.value;
        document.documentElement.style.setProperty('--primary-color', color);
    }

    // Banner preview
    function handleBannerUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewBannerImg.src = e.target.result;
            previewBannerImg.style.opacity = '1';
            uploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // Social links preview
    function updateSocialLinks() {
        socialInputs.forEach(input => {
            const socialType = input.closest('.social-input').querySelector('i').classList[1].split('-')[1];
            const previewIcon = document.querySelector(`.social-icon.${socialType}`);
            if (input.value) {
                previewIcon.style.opacity = '1';
                previewIcon.href = `https://${socialType}.com/${input.value}`;
            } else {
                previewIcon.style.opacity = '0.5';
                previewIcon.href = '#';
            }
        });
    }
    
    async function connectWallet() {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                alert('Please install Phantom wallet to continue!');
                window.open('https://phantom.app/', '_blank');
                return;
            }

            const response = await window.solana.connect();
            const publicKey = response.publicKey.toString();
            
            isWalletConnected = true;
            connectWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> Connected: ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
            connectWalletBtn.classList.add('connected');
            
            previewWallet.textContent = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
            localStorage.setItem('walletAddress', publicKey);
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    }

    // Event Listeners
    if (usernameInput) {
        usernameInput.addEventListener('input', updateUsername);
    }

    if (profileColorInput) {
        profileColorInput.addEventListener('input', updateThemeColor);
    }

    if (profileBannerInput) {
        profileBannerInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleBannerUpload(file);
        });

        // Drag and drop for banner upload
        const dropZone = document.querySelector('.banner-upload');
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            dropZone.addEventListener('drop', (e) => {
                const file = e.dataTransfer.files[0];
                if (file) handleBannerUpload(file);
            });
        }
    }

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedRole = option.dataset.role;
            updateRole(selectedRole);

            // Add animation effect
            option.style.animation = 'none';
            option.offsetHeight; // Trigger reflow
            option.style.animation = 'pulse 0.5s';
        });
    });

    socialInputs.forEach(input => {
        input.addEventListener('input', updateSocialLinks);
    });

    connectWalletBtn.addEventListener('click', connectWallet);

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!usernameInput.value.trim()) {
                alert('Please enter a username');
                return;
            }
            
            if (!selectedRole) {
                alert('Please select a role');
                return;
            }
            
            if (!isWalletConnected) {
                alert('Please connect your wallet first');
                return;
            }
            
            const socialLinks = {};
            socialInputs.forEach(input => {
                const socialType = input.closest('.social-input').querySelector('i').classList[1].split('-')[1];
                socialLinks[socialType] = input.value;
            });
            
            const profileData = {
                username: usernameInput.value.trim(),
                role: selectedRole,
                walletAddress: localStorage.getItem('walletAddress'),
                themeColor: profileColorInput.value,
                socialLinks
            };
            
            // Save profile data to localStorage
            localStorage.setItem('profileData', JSON.stringify(profileData));
            
            // Redirect to editor page
            window.location.href = 'editor.html';
        });
    }

    function showSuccessMessage() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-container';
        document.body.appendChild(confetti);
        
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            particle.style.setProperty('--rotation', `${Math.random() * 360}deg`);
            particle.style.left = `${Math.random() * 100}%`;
            confetti.appendChild(particle);
        }
        
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Profile Created Successfully!</h3>
            <p>Your crypto profile is now live</p>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            confetti.remove();
            message.remove();
        }, 5000);
    }

    // Add cursor light effect
    function initCursorLight() {
        const cursorLight = document.createElement('div');
        cursorLight.className = 'cursor-light';
        document.body.appendChild(cursorLight);

        const publicProfile = document.querySelector('.public-profile');
        if (!publicProfile) return;

        publicProfile.addEventListener('mousemove', (e) => {
            const rect = publicProfile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            cursorLight.style.left = `${e.clientX}px`;
            cursorLight.style.top = `${e.clientY}px`;
            
            // Add parallax effect to profile elements
            const moveX = (x - rect.width / 2) / 20;
            const moveY = (y - rect.height / 2) / 20;
            
            const avatar = publicProfile.querySelector('.profile-avatar');
            const name = publicProfile.querySelector('.profile-name');
            const role = publicProfile.querySelector('.role-badge');
            
            if (avatar) avatar.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            if (name) name.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
            if (role) role.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
        });

        publicProfile.addEventListener('mouseleave', () => {
            const avatar = publicProfile.querySelector('.profile-avatar');
            const name = publicProfile.querySelector('.profile-name');
            const role = publicProfile.querySelector('.role-badge');
            
            if (avatar) avatar.style.transform = '';
            if (name) name.style.transform = '';
            if (role) role.style.transform = '';
        });
    }

    // Initialize preview on page load
    initializePreview();
    initCursorLight();

});
