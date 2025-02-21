document.addEventListener('DOMContentLoaded', () => {
    class ProfileEditor {
        constructor() {
            this.initializeElements();
            this.attachEventListeners();
            this.initializeEmptyPreview();
        }

        initializeElements() {
            // Form elements
            this.form = document.getElementById('profileForm');
            this.displayNameInput = document.getElementById('displayName');
            this.bioInput = document.getElementById('bio');
            this.bioCharCount = document.getElementById('bioCharCount');
            this.roleSelect = document.getElementById('roleSelect');
            this.primaryColorInput = document.getElementById('primaryThemeColor');
            this.secondaryColorInput = document.getElementById('secondaryThemeColor');
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

        initializeEmptyPreview() {
            // Set default preview content
            this.previewDisplayName.textContent = 'Your Name';
            this.previewBio.textContent = 'Write a brief bio about yourself...';
            this.previewRole.textContent = 'Select your role';
            this.previewSocialLinks.innerHTML = '';

            // Set default images
            this.previewBanner.src = 'images/default-banner.jpg';
            this.previewProfilePic.src = 'images/default-avatar.jpg';

            // Initialize theme colors
            this.updateThemeColors();
        }

        attachEventListeners() {
            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // File uploads
            this.bannerUpload.addEventListener('click', () => this.bannerInput.click());
            this.profilePicUpload.addEventListener('click', () => this.profilePicInput.click());

            this.bannerInput.addEventListener('change', (e) => this.handleFileUpload(e, 'previewBanner', 'banner'));
            this.profilePicInput.addEventListener('change', (e) => this.handleFileUpload(e, 'previewProfilePic', 'profile'));

            // Text inputs
            this.displayNameInput.addEventListener('input', () => {
                this.updatePreview();
            });

            this.bioInput.addEventListener('input', () => {
                this.updatePreview();
                this.bioCharCount.textContent = `${this.bioInput.value.length}/500`;
            });

            this.roleSelect.addEventListener('change', () => {
                this.updatePreview();
            });

            // Theme colors
            this.primaryColorInput.addEventListener('input', () => this.updateThemeColors());
            this.secondaryColorInput.addEventListener('input', () => this.updateThemeColors());

            // Social links
            this.addSocialLinkBtn.addEventListener('click', () => this.addSocialLink());
            this.initializeSocialLinkEvents();
        }

        updatePreview() {
            // Update display name
            const displayName = this.displayNameInput.value || 'Display Name';
            this.previewDisplayName.textContent = displayName;

            // Update role
            const role = this.roleSelect.value || 'Role';
            this.previewRole.textContent = role;

            // Update bio
            const bio = this.bioInput.value || 'Your bio will appear here...';
            this.previewBio.textContent = bio;

            // Update social links
            this.updateSocialLinksPreview();
        }

        handleFileUpload(event, previewId, type) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById(previewId);
                    preview.src = e.target.result;
                    
                    // Add active state to upload area
                    const uploadArea = type === 'banner' ? 
                        document.querySelector('.banner-upload') : 
                        document.querySelector('.profile-pic-upload');
                    
                    uploadArea.style.backgroundImage = `url(${e.target.result})`;
                    uploadArea.classList.add('has-image');
                    
                    // Store the file for later upload
                    this[type === 'banner' ? 'bannerFile' : 'profilePicFile'] = file;
                };
                reader.readAsDataURL(file);
            }
        }

        updateThemeColors() {
            const primary = this.primaryColorInput.value;
            const secondary = this.secondaryColorInput.value;

            // Update gradient preview
            this.themePreview.style.background = `linear-gradient(45deg, ${primary}, ${secondary})`;

            // Update preview section with theme colors
            document.documentElement.style.setProperty('--theme-primary', primary);
            document.documentElement.style.setProperty('--theme-secondary', secondary);

            // Update text colors based on background
            this.previewDisplayName.style.color = this.getContrastColor(primary);
            this.previewBio.style.color = this.getContrastColor(primary);
            this.previewRole.style.color = this.getContrastColor(primary);

            // Update social links colors
            const links = this.previewSocialLinks.querySelectorAll('.social-link');
            links.forEach(link => {
                link.style.color = this.getContrastColor(primary);
                link.style.borderColor = secondary;
            });
        }

        getContrastColor(hexcolor) {
            // Convert hex to RGB
            const r = parseInt(hexcolor.substr(1,2), 16);
            const g = parseInt(hexcolor.substr(3,2), 16);
            const b = parseInt(hexcolor.substr(5,2), 16);
            
            // Calculate luminance
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Return black or white based on background luminance
            return luminance > 0.5 ? '#000000' : '#FFFFFF';
        }

        updateSocialLinksPreview() {
            const socialLinksContainer = this.previewSocialLinks;
            socialLinksContainer.innerHTML = '';

            const socialInputs = this.socialLinksContainer.querySelectorAll('.social-link-input');
            socialInputs.forEach(input => {
                const platform = input.querySelector('select').value;
                const url = input.querySelector('input[type="text"]').value;

                if (url) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.className = 'social-link';
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    
                    const icon = document.createElement('i');
                    icon.className = `fab fa-${platform.toLowerCase()}`;
                    link.appendChild(icon);
                    
                    socialLinksContainer.appendChild(link);
                }
            });
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

        async handleSubmit(e) {
            e.preventDefault();
            
            const formData = {
                displayName: this.displayNameInput.value,
                bio: this.bioInput.value,
                role: this.roleSelect.value,
                theme: {
                    primary: this.primaryColorInput.value,
                    secondary: this.secondaryColorInput.value
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

    // Initialize the editor
    new ProfileEditor();
});
