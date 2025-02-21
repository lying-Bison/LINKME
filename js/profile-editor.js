class ProfileEditor {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.setupLivePreview();
    }

    initializeElements() {
        // Form elements
        this.profileForm = document.getElementById('profileForm');
        this.displayNameInput = document.getElementById('displayName');
        this.bioInput = document.getElementById('bio');
        this.bioCharCount = document.getElementById('bioCharCount');
        this.roleSelect = document.getElementById('roleSelect');
        this.primaryThemeColor = document.getElementById('primaryThemeColor');
        this.secondaryThemeColor = document.getElementById('secondaryThemeColor');
        this.themePreview = document.getElementById('themePreview');

        // File upload elements
        this.bannerUpload = document.getElementById('bannerUpload');
        this.bannerInput = document.getElementById('bannerInput');
        this.profilePicUpload = document.getElementById('profilePicUpload');
        this.profilePicInput = document.getElementById('profilePicInput');

        // Preview elements
        this.previewBanner = document.getElementById('previewBanner');
        this.previewProfilePic = document.getElementById('previewProfilePic');
        this.previewDisplayName = document.getElementById('previewDisplayName');
        this.previewBio = document.getElementById('previewBio');
        this.previewRole = document.getElementById('previewRole');
        this.previewSocialLinks = document.getElementById('previewSocialLinks');

        // Social links
        this.socialLinksContainer = document.getElementById('socialLinksContainer');
        this.addSocialLinkBtn = document.getElementById('addSocialLink');
    }

    attachEventListeners() {
        // Form submission
        this.profileForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // File uploads
        this.bannerUpload.addEventListener('click', () => this.bannerInput.click());
        this.bannerInput.addEventListener('change', (e) => this.handleImageUpload(e, 'banner'));
        
        this.profilePicUpload.addEventListener('click', () => this.profilePicInput.click());
        this.profilePicInput.addEventListener('change', (e) => this.handleImageUpload(e, 'profile'));

        // Text inputs for live preview
        this.displayNameInput.addEventListener('input', () => {
            this.previewDisplayName.textContent = this.displayNameInput.value || 'Your Name';
        });

        this.bioInput.addEventListener('input', () => {
            this.previewBio.textContent = this.bioInput.value || 'Write a brief bio about yourself...';
            this.bioCharCount.textContent = `${this.bioInput.value.length}/500`;
        });

        this.roleSelect.addEventListener('change', () => {
            this.previewRole.textContent = this.roleSelect.options[this.roleSelect.selectedIndex].text;
        });

        // Theme colors
        this.primaryThemeColor.addEventListener('input', () => this.updateThemePreview());
        this.secondaryThemeColor.addEventListener('input', () => this.updateThemePreview());

        // Social links
        this.addSocialLinkBtn.addEventListener('click', () => this.addSocialLink());
        this.initializeSocialLinkEvents();
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            if (type === 'banner') {
                this.previewBanner.src = imageUrl;
                this.bannerUpload.style.backgroundImage = `url(${imageUrl})`;
                this.bannerUpload.querySelector('.upload-placeholder').style.display = 'none';
            } else if (type === 'profile') {
                this.previewProfilePic.src = imageUrl;
                this.profilePicUpload.style.backgroundImage = `url(${imageUrl})`;
                this.profilePicUpload.querySelector('.upload-placeholder').style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    updateThemePreview() {
        const primary = this.primaryThemeColor.value;
        const secondary = this.secondaryThemeColor.value;
        this.themePreview.style.background = `linear-gradient(45deg, ${primary}, ${secondary})`;
        
        // Update preview section colors
        document.documentElement.style.setProperty('--theme-primary', primary);
        document.documentElement.style.setProperty('--theme-secondary', secondary);
    }

    addSocialLink() {
        const socialLinkDiv = document.createElement('div');
        socialLinkDiv.className = 'social-link-input';
        
        socialLinkDiv.innerHTML = `
            <select class="platform-select">
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="discord">Discord</option>
                <option value="telegram">Telegram</option>
                <option value="other">Other</option>
            </select>
            <input type="text" class="username-input" placeholder="Enter username or URL">
            <button type="button" class="remove-social-link">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.socialLinksContainer.appendChild(socialLinkDiv);
        this.initializeSocialLinkEvents(socialLinkDiv);
        this.updateSocialLinksPreview();
    }

    initializeSocialLinkEvents(container = null) {
        const containers = container ? [container] : this.socialLinksContainer.querySelectorAll('.social-link-input');
        
        containers.forEach(div => {
            const removeBtn = div.querySelector('.remove-social-link');
            const select = div.querySelector('.platform-select');
            const input = div.querySelector('.username-input');

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    if (this.socialLinksContainer.children.length > 1) {
                        div.remove();
                    } else {
                        select.value = 'twitter';
                        input.value = '';
                    }
                    this.updateSocialLinksPreview();
                });
            }

            if (select && input) {
                select.addEventListener('change', () => this.updateSocialLinksPreview());
                input.addEventListener('input', () => this.updateSocialLinksPreview());
            }
        });
    }

    updateSocialLinksPreview() {
        this.previewSocialLinks.innerHTML = '';
        
        const socialLinks = this.socialLinksContainer.querySelectorAll('.social-link-input');
        socialLinks.forEach(link => {
            const platform = link.querySelector('.platform-select').value;
            const username = link.querySelector('.username-input').value;
            
            if (username) {
                const iconClass = {
                    'twitter': 'fa-twitter',
                    'instagram': 'fa-instagram',
                    'linkedin': 'fa-linkedin',
                    'github': 'fa-github',
                    'discord': 'fa-discord',
                    'telegram': 'fa-telegram',
                    'other': 'fa-link'
                }[platform] || 'fa-link';

                const socialLink = document.createElement('a');
                socialLink.href = '#';
                socialLink.className = 'social-link';
                socialLink.innerHTML = `<i class="fab ${iconClass}"></i>`;
                this.previewSocialLinks.appendChild(socialLink);
            }
        });
    }

    setupLivePreview() {
        // Create ResizeObserver for responsive preview
        const previewContainer = document.querySelector('.preview-container');
        if (previewContainer) {
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const width = entry.contentRect.width;
                    entry.target.style.height = `${width * 1.2}px`;
                }
            });
            observer.observe(previewContainer);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            displayName: this.displayNameInput.value,
            bio: this.bioInput.value,
            role: this.roleSelect.value,
            theme: {
                primary: this.primaryThemeColor.value,
                secondary: this.secondaryThemeColor.value
            },
            socialLinks: Array.from(this.socialLinksContainer.querySelectorAll('.social-link-input')).map(link => ({
                platform: link.querySelector('.platform-select').value,
                username: link.querySelector('.username-input').value
            })).filter(link => link.username)
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
                const modal = document.getElementById('saveModal');
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.display = 'none';
                    window.location.href = `/public-profile?username=${formData.displayName}`;
                }, 2000);
            } else {
                throw new Error('Failed to save profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileEditor();
});
