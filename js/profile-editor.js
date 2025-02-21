class ProfileEditor {
    constructor() {
        this.username = new URLSearchParams(window.location.search).get('username');
        this.initializeElements();
        this.attachEventListeners();
        this.initializeSocialLinks();
        this.setupLivePreview();
        this.cropper = null;
    }

    initializeElements() {
        // Get the form and save button
        this.profileForm = document.getElementById('profileForm');
        this.saveBtn = this.profileForm ? this.profileForm.querySelector('button[type="submit"]') : null;
        
        // File upload elements
        this.bannerUpload = document.getElementById('bannerUpload');
        this.bannerInput = document.getElementById('bannerInput');
        this.profilePicUpload = document.getElementById('profilePicUpload');
        this.profilePicInput = document.getElementById('profilePicInput');

        // Form inputs
        this.displayNameInput = document.getElementById('displayName');
        this.bioInput = document.getElementById('bio');
        this.bioCharCount = document.getElementById('bioCharCount');
        this.roleSelect = document.getElementById('roleSelect');
        this.socialLinksContainer = document.getElementById('socialLinksContainer');
        this.addSocialLinkBtn = document.getElementById('addSocialLink');
        this.previewSocialLinks = document.getElementById('previewSocialLinks');

        // Preview elements
        this.previewBanner = document.getElementById('previewBanner');
        this.previewProfilePic = document.getElementById('previewProfilePic');
        this.previewDisplayName = document.getElementById('previewDisplayName');
        this.previewBio = document.getElementById('previewBio');
        this.previewRole = document.getElementById('previewRole');
        
        // Initialize with empty preview
        this.initializeEmptyPreview();
    }

    initializeEmptyPreview() {
        // Set default preview content
        this.previewDisplayName.textContent = 'Your Name';
        this.previewBio.textContent = 'Your bio will appear here...';
        this.previewRole.textContent = 'Select your role';
        
        // Clear any existing social links
        this.previewSocialLinks.innerHTML = '';
        
        // Add a default social link input
        this.addSocialLinkInput();
    }

    attachEventListeners() {
        // Form submission
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // File inputs
        if (this.bannerInput) {
            this.bannerInput.addEventListener('change', (e) => this.handleImageUpload(e, 'banner'));
        }
        if (this.profilePicInput) {
            this.profilePicInput.addEventListener('change', (e) => this.handleImageUpload(e, 'profile'));
        }

        // Text inputs for live preview
        if (this.displayNameInput) {
            this.displayNameInput.addEventListener('input', () => {
                this.previewDisplayName.textContent = this.displayNameInput.value || 'Your Name';
            });
        }

        if (this.bioInput) {
            this.bioInput.addEventListener('input', () => {
                this.previewBio.textContent = this.bioInput.value || 'Your bio will appear here...';
                if (this.bioCharCount) {
                    this.bioCharCount.textContent = `${this.bioInput.value.length}/160`;
                }
            });
        }

        if (this.roleSelect) {
            this.roleSelect.addEventListener('change', () => {
                this.previewRole.textContent = this.roleSelect.value || 'Select your role';
            });
        }

        // Add social link button
        if (this.addSocialLinkBtn) {
            this.addSocialLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addSocialLinkInput();
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.username) {
            alert('Please connect your wallet first');
            return;
        }

        const formData = {
            username: this.username,
            displayName: this.displayNameInput.value,
            bio: this.bioInput.value,
            role: this.roleSelect.value,
            socialLinks: this.getSocialLinks(),
            // Add other form data as needed
        };

        try {
            const response = await fetch('/api/save-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                // Show success modal
                const modal = document.getElementById('saveModal');
                if (modal) {
                    modal.style.display = 'flex';
                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = `/public-profile?username=${this.username}`;
                    }, 2000);
                }
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    }

    addSocialLinkInput() {
        const socialLinkDiv = document.createElement('div');
        socialLinkDiv.className = 'social-link-input';
        
        const platforms = ['Twitter', 'Instagram', 'LinkedIn', 'GitHub', 'Discord', 'Telegram', 'Other'];
        
        socialLinkDiv.innerHTML = `
            <select class="platform-select">
                ${platforms.map(platform => `<option value="${platform.toLowerCase()}">${platform}</option>`).join('')}
            </select>
            <input type="text" class="username-input" placeholder="Enter username or URL">
            <button type="button" class="remove-social-link">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.socialLinksContainer.appendChild(socialLinkDiv);
        this.initializeSocialLinkEvents(socialLinkDiv);
        
        // Focus the new input
        const newInput = socialLinkDiv.querySelector('.username-input');
        if (newInput) newInput.focus();
    }

    initializeSocialLinkEvents(linkDiv) {
        // Add remove button functionality
        const removeButton = linkDiv.querySelector('.remove-social-link');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                if (this.socialLinksContainer.children.length > 1) {
                    linkDiv.remove();
                } else {
                    // If it's the last social link, just clear the inputs
                    const select = linkDiv.querySelector('.platform-select');
                    const input = linkDiv.querySelector('.username-input');
                    if (select) select.value = 'twitter';
                    if (input) input.value = '';
                }
            });
        }

        // Add change listeners for live preview
        const inputs = linkDiv.querySelectorAll('select, input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateSocialLinks());
        });
    }

    updateSocialLinks() {
        if (!this.previewSocialLinks) {
            console.error('Preview social links container not found');
            return;
        }
        
        // Clear existing preview
        this.previewSocialLinks.innerHTML = '';
        
        // Get all social link inputs
        const socialLinks = this.socialLinksContainer.querySelectorAll('.social-link-input');
        
        socialLinks.forEach(linkDiv => {
            const select = linkDiv.querySelector('.platform-select');
            const input = linkDiv.querySelector('.username-input');
            
            if (!select || !input || !input.value.trim()) return;
            
            const platform = select.value;
            const username = input.value.trim();
            
            // Define base URLs for each platform
            const baseUrls = {
                'twitter': 'https://twitter.com/',
                'instagram': 'https://instagram.com/',
                'linkedin': 'https://linkedin.com/in/',
                'github': 'https://github.com/',
                'discord': 'https://discord.com/users/',
                'telegram': 'https://t.me/',
                'other': ''
            };

            // Get the appropriate URL
            let href = username;
            if (!username.startsWith('http://') && !username.startsWith('https://')) {
                href = baseUrls[platform] + username.replace('@', '');
            }
            
            const platformIcons = {
                'twitter': 'fab fa-twitter',
                'instagram': 'fab fa-instagram',
                'linkedin': 'fab fa-linkedin',
                'github': 'fab fa-github',
                'discord': 'fab fa-discord',
                'telegram': 'fab fa-telegram',
                'other': 'fas fa-link'
            }[platform] || 'fas fa-link';
            
            const link = document.createElement('a');
            link.className = 'social-link';
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${username}`;
            link.innerHTML = `<i class="${platformIcons}"></i>`;
            
            this.previewSocialLinks.appendChild(link);
        });
    }

    getSocialLinks() {
        if (!this.socialLinksContainer) return [];

        const links = [];
        const socialLinkDivs = this.socialLinksContainer.querySelectorAll('.social-link-input');
        
        socialLinkDivs.forEach(div => {
            const platformSelect = div.querySelector('.platform-select');
            const usernameInput = div.querySelector('.username-input');
            
            if (platformSelect && usernameInput && usernameInput.value.trim()) {
                links.push({
                    platform: platformSelect.value,
                    username: usernameInput.value.trim()
                });
            }
        });
        
        return links;
    }

    setupLivePreview() {
        // Create ResizeObserver for responsive preview
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                this.previewContainer.style.height = `${width * 1.2}px`;
            }
        });

        observer.observe(this.previewContainer);
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            if (type === 'profile') {
                this.previewProfilePic.src = imageUrl;
                this.profilePicUpload.style.backgroundImage = `url(${imageUrl})`;
                this.profilePicUpload.querySelector('.upload-placeholder').style.display = 'none';
            } else if (type === 'banner') {
                this.previewBanner.src = imageUrl;
                this.bannerUpload.style.backgroundImage = `url(${imageUrl})`;
                this.bannerUpload.querySelector('.upload-placeholder').style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        new ProfileEditor();
    });
}
