class ProfileEditor {
    constructor() {
        this.username = new URLSearchParams(window.location.search).get('username');
        if (!this.username) {
            window.location.href = 'index.html';
            return;
        }
        this.initializeElements();
        this.attachEventListeners();
        this.initializeSocialLinks();
        this.loadProfileData();
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

        // Banner adjustment elements
        this.bannerAdjustModal = document.getElementById('bannerAdjustModal');
        this.bannerCropImage = document.getElementById('bannerCropImage');
        this.rotateBannerLeft = document.getElementById('rotateBannerLeft');
        this.rotateBannerRight = document.getElementById('rotateBannerRight');
        this.flipBannerX = document.getElementById('flipBannerX');
        this.flipBannerY = document.getElementById('flipBannerY');
        this.saveBannerAdjustments = document.getElementById('saveBannerAdjustments');

        // Form inputs
        this.displayNameInput = document.getElementById('displayName');
        this.bioInput = document.getElementById('bio');
        this.bioCharCount = document.getElementById('bioCharCount');
        this.roleSelect = document.getElementById('roleSelect');
        this.socialLinksContainer = document.getElementById('socialLinksContainer');
        this.addSocialLinkBtn = document.getElementById('addSocialLink');
        this.previewSocialLinks = document.getElementById('previewSocialLinks');

        // Form element
        this.profileForm = document.getElementById('profileForm');

        // Preview elements
        this.previewBanner = document.getElementById('previewBanner');
        this.previewProfilePic = document.getElementById('previewProfilePic');
        this.previewDisplayName = document.getElementById('previewDisplayName');
        this.previewBio = document.getElementById('previewBio');
        this.previewRole = document.getElementById('previewRole');
        this.previewRoleIcon = document.getElementById('previewRoleIcon');
        this.previewRoleInfo = document.getElementById('previewRoleInfo');
        this.previewModeBtns = document.querySelectorAll('.preview-mode-btn');
        this.previewContainer = document.querySelector('.preview-container');

        // Theme color elements
        this.primaryThemeColor = document.getElementById('primaryThemeColor');
        this.secondaryThemeColor = document.getElementById('secondaryThemeColor');
        this.themePreview = document.getElementById('themePreview');

        // Role-specific fields
        this.roleSpecificFields = document.getElementById('roleSpecificFields');
    }

    attachEventListeners() {
        // Form submission
        if (this.profileForm) {
            this.profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Disable save button
                if (this.saveBtn) {
                    this.saveBtn.disabled = true;
                    this.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                }

                try {
                    await this.saveProfile();
                    
                    // Show success message
                    const saveModal = document.getElementById('saveModal');
                    if (saveModal) {
                        saveModal.classList.add('active');
                        setTimeout(() => {
                            saveModal.classList.remove('active');
                        }, 2000);
                    }
                } catch (error) {
                    console.error('Error saving profile:', error);
                    alert('Failed to save profile. Please try again.');
                } finally {
                    // Re-enable save button
                    if (this.saveBtn) {
                        this.saveBtn.disabled = false;
                        this.saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
                    }
                }
            });
        }

        // File uploads
        if (this.bannerUpload && this.bannerInput) {
            this.bannerUpload.addEventListener('click', () => this.bannerInput.click());
            this.bannerInput.addEventListener('change', (e) => this.handleBannerUpload(e));
        }
        
        if (this.profilePicUpload && this.profilePicInput) {
            this.profilePicUpload.addEventListener('click', () => this.profilePicInput.click());
            this.profilePicInput.addEventListener('change', (e) => this.handleImageUpload(e, 'profile'));
        }

        // Text inputs with live preview
        if (this.displayNameInput) {
            this.displayNameInput.addEventListener('input', () => this.updatePreview('displayName'));
        }
        
        if (this.bioInput) {
            this.bioInput.addEventListener('input', () => {
                this.updatePreview('bio');
                this.updateCharCount();
            });
        }

        // Add social link button
        if (this.addSocialLinkBtn) {
            this.addSocialLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addSocialLink();
            });
        }

        // Theme color changes
        if (this.primaryThemeColor && this.secondaryThemeColor) {
            this.primaryThemeColor.addEventListener('input', () => {
                this.updateThemeColors();
                this.updatePreviewContent();
            });
            this.secondaryThemeColor.addEventListener('input', () => this.updateThemeColors());
        }
    }

    addSocialLink() {
        console.log('addSocialLink method called');
        
        if (!this.socialLinksContainer) {
            console.error('Social links container not found');
            return;
        }

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
        
        console.log('New social link container added');
    }

    initializeSocialLinks() {
        // Initialize event listeners for the default social link
        const defaultLink = this.socialLinksContainer.querySelector('.social-link-input');
        if (defaultLink) {
            this.initializeSocialLinkEvents(defaultLink);
        }
        // Initial update of social links preview
        this.updateSocialLinks();
    }

    initializeSocialLinkEvents(linkDiv) {
        // Add remove button functionality
        const removeButton = linkDiv.querySelector('.remove-social-link');
        if (removeButton) {
            removeButton.addEventListener('click', () => {
                if (this.socialLinksContainer.children.length > 1) {
                    linkDiv.remove();
                    this.updateSocialLinks();
                } else {
                    // If it's the last social link, just clear the inputs
                    const select = linkDiv.querySelector('.platform-select');
                    const input = linkDiv.querySelector('.username-input');
                    if (select) select.value = 'twitter';
                    if (input) input.value = '';
                    this.updateSocialLinks();
                }
            });
        }

        // Add change listeners for live preview
        const inputs = linkDiv.querySelectorAll('select, input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateSocialLinks());
        });
    }

    loadProfileData() {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        const username = params.get('username');

        console.log('URL Role:', role);

        // Load profile data from localStorage
        const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
        console.log('LocalStorage Profile Data:', profileData);
        
        // Get role from URL params or localStorage
        const selectedRole = role || profileData.role;
        console.log('Selected Role:', selectedRole);
        
        if (selectedRole) {
            // Set role badge
            this.setRoleBadge(selectedRole);
            
            // Show role-specific fields
            this.showRoleFields(selectedRole);
        }

        // Set values if they exist
        if (profileData.displayName) this.displayNameInput.value = profileData.displayName;
        if (profileData.bio) this.bioInput.value = profileData.bio;

        // Load saved theme colors
        const savedTheme = profileData.theme || {};
        if (this.primaryThemeColor && this.secondaryThemeColor) {
            this.primaryThemeColor.value = savedTheme.primary || '#6C5CE7';
            this.secondaryThemeColor.value = savedTheme.secondary || '#A29BFE';
            this.updateThemeColors();
            this.updatePreviewContent();
        }

        // Add event listeners to existing social link inputs
        const existingSocialLinks = this.socialLinksContainer.querySelectorAll('.social-link-input');
        existingSocialLinks.forEach(linkDiv => {
            // Add remove button functionality
            const removeButton = linkDiv.querySelector('.remove-social-link');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    linkDiv.remove();
                    this.updateSocialLinks();
                });
            }

            // Add change listeners for live preview
            const inputs = linkDiv.querySelectorAll('select, input');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.updateSocialLinks());
            });
        });

        // Initialize social links preview
        this.updateSocialLinks();

        // Update preview
        this.updateAllPreviews();
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

    handleBannerUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Read the file and show the adjustment modal
        const reader = new FileReader();
        reader.onload = (e) => {
            this.bannerCropImage.src = e.target.result;
            this.bannerAdjustModal.classList.add('active');
            
            // Initialize cropper
            if (this.cropper) {
                this.cropper.destroy();
            }
            
            this.cropper = new Cropper(this.bannerCropImage, {
                aspectRatio: 3 / 1, // 1500x500 aspect ratio
                viewMode: 2,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
            });

            // Attach banner adjustment controls
            this.rotateBannerLeft.onclick = () => this.cropper.rotate(-90);
            this.rotateBannerRight.onclick = () => this.cropper.rotate(90);
            this.flipBannerX.onclick = () => this.cropper.scaleX(this.cropper.getData().scaleX * -1);
            this.flipBannerY.onclick = () => this.cropper.scaleY(this.cropper.getData().scaleY * -1);

            // Save adjustments
            this.saveBannerAdjustments.onclick = () => {
                const canvas = this.cropper.getCroppedCanvas({
                    width: 1500,
                    height: 500
                });

                // Update preview and banner upload background
                const croppedImageUrl = canvas.toDataURL('image/jpeg');
                this.previewBanner.src = croppedImageUrl;
                this.bannerUpload.style.backgroundImage = `url(${croppedImageUrl})`;
                this.bannerUpload.querySelector('.upload-placeholder').style.display = 'none';

                // Close modal and cleanup
                this.bannerAdjustModal.classList.remove('active');
                this.cropper.destroy();
                this.cropper = null;
            };
        };
        reader.readAsDataURL(file);
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
            }
        };
        reader.readAsDataURL(file);
    }

    updatePreview(field) {
        switch (field) {
            case 'displayName':
                this.previewDisplayName.textContent = this.displayNameInput.value || 'Your Name';
                break;
            case 'bio':
                const bioText = this.bioInput.value.trim();
                this.previewBio.textContent = bioText || 'Your bio will appear here...';
                break;
        }
    }

    updateCharCount() {
        const count = this.bioInput.value.length;
        this.bioCharCount.textContent = count;
        this.bioCharCount.style.color = count > 450 ? 'var(--danger-color)' : 'var(--text-secondary)';
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

    updateThemeColors() {
        const primary = this.primaryThemeColor.value;
        const secondary = this.secondaryThemeColor.value;

        // Update the small preview
        if (this.themePreview) {
            this.themePreview.style.background = `linear-gradient(45deg, ${primary}, ${secondary})`;
        }

        // Update CSS variables on the preview container and its children
        if (this.previewContainer) {
            document.documentElement.style.setProperty('--theme-primary', primary);
            document.documentElement.style.setProperty('--theme-secondary', secondary);
            document.documentElement.style.setProperty('--primary-color', primary);
            document.documentElement.style.setProperty('--primary-light', secondary);
        }
    }

    updatePreviewContent() {
        if (this.previewDisplayName && this.previewBio && this.previewSocialLinks) {
            // Get the contrast color based on primary color
            const textColor = this.getContrastColor(this.primaryThemeColor.value);
            const isPureBlack = textColor === '#000000';
            
            if (isPureBlack) {
                // For black text, use the darkest possible black and add text emphasis
                const blackStyles = {
                    color: '#000000',
                    'font-weight': '800',
                    'letter-spacing': '-0.2px',
                    'text-rendering': 'geometricPrecision',
                    '-webkit-font-smoothing': 'antialiased',
                    '-moz-osx-font-smoothing': 'grayscale'
                };
                
                // Apply ultra-sharp black to display name
                Object.entries(blackStyles).forEach(([property, value]) => {
                    this.previewDisplayName.style.setProperty(property, value, 'important');
                });
                
                // Dark black for bio with medium weight
                this.previewBio.style.setProperty('color', '#000000', 'important');
                this.previewBio.style.setProperty('font-weight', '500', 'important');
                
                // Update social links with pure black
                const socialLinks = this.previewSocialLinks.querySelectorAll('.social-link');
                const rgbColor = this.hexToRgb(this.primaryThemeColor.value);
                
                socialLinks.forEach(link => {
                    // Apply ultra-sharp black to icons
                    Object.entries(blackStyles).forEach(([property, value]) => {
                        link.style.setProperty(property, value, 'important');
                    });
                    
                    // Very subtle background for better contrast
                    link.style.setProperty('background-color', `rgba(${rgbColor}, 0.08)`, 'important');
                    
                    // Add hover effect
                    link.addEventListener('mouseenter', () => {
                        link.style.setProperty('background-color', `rgba(${rgbColor}, 0.15)`, 'important');
                        link.style.setProperty('transform', 'translateY(-1px)', 'important');
                    });
                    link.addEventListener('mouseleave', () => {
                        link.style.setProperty('background-color', `rgba(${rgbColor}, 0.08)`, 'important');
                        link.style.setProperty('transform', 'none', 'important');
                    });
                });
            } else {
                // For white text
                const whiteStyles = {
                    color: '#FFFFFF',
                    'font-weight': '600',
                    'letter-spacing': 'normal',
                    '-webkit-font-smoothing': 'antialiased',
                    '-moz-osx-font-smoothing': 'grayscale'
                };
                
                // Apply styles to display name
                Object.entries(whiteStyles).forEach(([property, value]) => {
                    this.previewDisplayName.style.setProperty(property, value, 'important');
                });
                
                this.previewBio.style.setProperty('color', 'rgba(255, 255, 255, 0.9)', 'important');
                this.previewBio.style.setProperty('font-weight', 'normal', 'important');
                
                // Update social links
                const socialLinks = this.previewSocialLinks.querySelectorAll('.social-link');
                const rgbColor = this.hexToRgb(this.primaryThemeColor.value);
                
                socialLinks.forEach(link => {
                    Object.entries(whiteStyles).forEach(([property, value]) => {
                        link.style.setProperty(property, value, 'important');
                    });
                    
                    link.style.setProperty('background-color', `rgba(${rgbColor}, 0.15)`, 'important');
                    
                    // Add hover effect
                    link.addEventListener('mouseenter', () => {
                        link.style.setProperty('background-color', `rgba(${rgbColor}, 0.25)`, 'important');
                        link.style.setProperty('transform', 'translateY(-1px)', 'important');
                    });
                    link.addEventListener('mouseleave', () => {
                        link.style.setProperty('background-color', `rgba(${rgbColor}, 0.15)`, 'important');
                        link.style.setProperty('transform', 'none', 'important');
                    });
                });
            }
        }
    }

    getContrastColor(hexcolor) {
        // Remove the # if present
        hexcolor = hexcolor.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hexcolor.substr(0, 2), 16);
        const g = parseInt(hexcolor.substr(2, 2), 16);
        const b = parseInt(hexcolor.substr(4, 2), 16);
        
        // Calculate luminance using perceived brightness formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // More aggressive threshold for black text
        return luminance > 0.7 ? '#000000' : '#FFFFFF';
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `${r}, ${g}, ${b}`;
    }

    updateRoleInfo(event) {
        const role = event.target.value;
        this.previewRole.textContent = role.charAt(0).toUpperCase() + role.slice(1);

        // Hide all role-specific fields
        this.roleSpecificFields.querySelectorAll('.trader-field, .artist-field, .collector-field').forEach(field => {
            field.style.display = 'none';
        });

        // Show selected role fields
        this.roleSpecificFields.querySelectorAll(`.${role}-field`).forEach(field => {
            field.style.display = 'block';
        });

        this.updateRoleInfoPreview(role);
    }

    updateRoleInfoPreview(role) {
        let roleInfo = '';

        switch (role) {
            case 'trader':
                const experience = document.getElementById('tradingExperience').value;
                const pairs = document.getElementById('tradingPairs').value;
                roleInfo = `
                    <h3>Trading Profile</h3>
                    <ul>
                        <li><i class="fas fa-chart-line"></i> ${experience}</li>
                        <li><i class="fas fa-exchange-alt"></i> ${pairs || 'No trading pairs specified'}</li>
                    </ul>
                `;
                break;
            case 'artist':
                const style = document.getElementById('artStyle').value;
                const gallery = document.getElementById('galleryLink').value;
                roleInfo = `
                    <h3>Artist Profile</h3>
                    <ul>
                        <li><i class="fas fa-palette"></i> ${style || 'No art style specified'}</li>
                        <li><i class="fas fa-images"></i> ${gallery || 'No gallery link specified'}</li>
                    </ul>
                `;
                break;
            case 'collector':
                const focus = document.getElementById('collectionFocus').value;
                const strategy = document.getElementById('investmentStrategy').value;
                roleInfo = `
                    <h3>Collector Profile</h3>
                    <ul>
                        <li><i class="fas fa-gem"></i> ${focus || 'No collection focus specified'}</li>
                        <li><i class="fas fa-chess"></i> ${strategy}</li>
                    </ul>
                `;
                break;
        }

        this.previewRoleInfo.innerHTML = roleInfo;
    }

    togglePreviewMode(btn) {
        this.previewModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.previewContainer.dataset.mode = btn.dataset.mode;
    }

    setRoleBadge(role) {
        if (!role) return;
        
        console.log('Setting role badge for:', role);
        
        // Update role text
        const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
        console.log('Capitalized Role:', capitalizedRole);
        this.previewRole.textContent = capitalizedRole;
        
        // Update role icon
        const iconClass = {
            'individual': 'fa-user',
            'trader': 'fa-chart-line',
            'artist': 'fa-palette',
            'collector': 'fa-gem'
        }[role] || 'fa-user';
        
        this.previewRoleIcon.className = `fas ${iconClass}`;
        console.log('Set icon class to:', `fas ${iconClass}`);
    }

    showRoleFields(role) {
        const fields = this.roleSpecificFields.querySelectorAll('.trader-field, .artist-field, .collector-field');
        fields.forEach(field => field.style.display = 'none');

        if (role) {
            const roleFields = this.roleSpecificFields.querySelectorAll(`.${role}-field`);
            roleFields.forEach(field => field.style.display = 'block');
        }
    }

    updateAllPreviews() {
        this.updatePreview('displayName');
        this.updatePreview('bio');
        this.updateSocialLinks();
        this.updateCharCount();
    }

    async saveProfile() {
        try {
            const username = new URLSearchParams(window.location.search).get('username');
            if (!username) {
                throw new Error('Username not found');
            }

            // Get values safely with defaults
            const displayName = this.displayNameInput?.value || username;
            const bio = this.bioInput?.value || '';
            const role = this.roleSelect?.value || 'individual';
            
            const profileData = {
                displayName,
                bio,
                role,
                socialLinks: this.getSocialLinks(),
                ...this.getRoleSpecificData()
            };

            const response = await fetch(`http://localhost:3002/api/profiles/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save profile');
            }

            // Show success popup
            this.showSuccessPopup(displayName);

        } catch (error) {
            console.error('Error saving profile:', error);
            alert(error.message || 'Failed to save profile. Please try again.');
        }
    }

    showSuccessPopup(displayName) {
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        
        // Get the base URL for the site
        const baseUrl = window.location.origin;
        const profileUrl = `${baseUrl}/${this.username}`;
        const tweetText = encodeURIComponent(`Check out my new crypto profile! 🚀\n\n${profileUrl}`);
        
        popup.innerHTML = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Welcome, ${displayName}! 🎉</h2>
                <p>Your profile has been created successfully.</p>
                
                <div class="share-buttons">
                    <a href="https://twitter.com/intent/tweet?text=${tweetText}" 
                       target="_blank" class="share-button twitter">
                        <i class="fab fa-twitter"></i>
                        Share on Twitter
                    </a>
                    <button class="share-button copy" onclick="navigator.clipboard.writeText('${profileUrl}')">
                        <i class="fas fa-link"></i>
                        Copy Profile Link
                    </button>
                    <a href="/${this.username}" target="_blank" class="share-button view">
                        <i class="fas fa-external-link-alt"></i>
                        View Profile
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Add copy feedback
        const copyButton = popup.querySelector('.share-button.copy');
        copyButton.addEventListener('click', () => {
            copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-link"></i> Copy Profile Link';
            }, 2000);
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

    getRoleSpecificData() {
        const data = {};
        
        // Safely get values with optional chaining
        const role = this.roleSelect?.value;
        
        if (role === 'trader') {
            data.tradingExperience = document.getElementById('tradingExperience')?.value || 'beginner';
            data.tradingPairs = document.getElementById('tradingPairs')?.value || '';
        } else if (role === 'artist') {
            data.artStyle = document.getElementById('artStyle')?.value || '';
            data.galleryLink = document.getElementById('galleryLink')?.value || '';
        } else if (role === 'collector') {
            data.collectionFocus = document.getElementById('collectionFocus')?.value || '';
            data.collectionSize = document.getElementById('collectionSize')?.value || '';
        } else {
            // Individual
            data.interests = document.getElementById('interests')?.value || '';
            data.experienceLevel = document.getElementById('individualExperience')?.value || 'beginner';
        }
        
        return data;
    }

    showSuccessMessage() {
        // Show success animation
        this.saveProfileBtn.disabled = true;
        this.saveProfileBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        this.saveProfileBtn.style.animation = 'saveSuccess 0.5s ease';

        // Show success modal
        document.getElementById('saveModal').classList.add('active');

        // Reset button after delay
        setTimeout(() => {
            this.saveProfileBtn.disabled = false;
            this.saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
            this.saveProfileBtn.style.animation = '';
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileEditor();
});
