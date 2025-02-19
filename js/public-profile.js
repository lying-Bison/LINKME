class PublicProfile {
    constructor() {
        this.init();
    }

    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('username');
            
            console.log('Loading profile for username:', username);

            if (!username) {
                throw new Error('No username provided');
            }

            await this.loadProfile(username);
        } catch (error) {
            console.error('Failed to initialize profile:', error);
            this.showErrorMessage(error.message);
        }
    }

    async loadProfile(username) {
        try {
            // Load from backend
            const response = await fetch(`http://localhost:3002/api/profiles/${username}`);
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            
            const profileData = await response.json();
            this.renderProfile(profileData);
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showErrorMessage('Failed to load profile: ' + error.message);
        }
    }

    renderProfile(data) {
        console.log('Rendering profile with data:', data);
        
        // Update display name
        const nameElement = document.getElementById('displayName');
        if (nameElement) {
            nameElement.textContent = data.displayName || data.username;
        }

        // Update bio
        const bioElement = document.getElementById('bio');
        if (bioElement) {
            bioElement.textContent = data.bio || 'No bio provided';
        }

        // Update role badge
        const roleBadge = document.createElement('div');
        roleBadge.className = 'role-badge';
        roleBadge.innerHTML = `<i class="fas ${this.getRoleIcon(data.role)}"></i> ${data.role}`;
        nameElement?.parentNode.insertBefore(roleBadge, nameElement.nextSibling);

        // Update social links
        const socialLinksContainer = document.getElementById('socialLinks');
        if (socialLinksContainer && data.socialLinks) {
            socialLinksContainer.innerHTML = data.socialLinks.map(link => `
                <a href="${this.getSocialLink(link.platform, link.username)}" target="_blank" class="social-link ${link.platform}">
                    <i class="fab fa-${link.platform}"></i>
                    <span>${link.username}</span>
                </a>
            `).join('');
        }

        // Add role-specific information
        const roleInfoContainer = document.createElement('div');
        roleInfoContainer.className = 'role-info';
        roleInfoContainer.innerHTML = this.getRoleSpecificHTML(data);
        document.querySelector('.profile-content').appendChild(roleInfoContainer);
    }

    getRoleIcon(role) {
        const icons = {
            'individual': 'fa-user',
            'trader': 'fa-chart-line',
            'artist': 'fa-palette',
            'collector': 'fa-gem'
        };
        return icons[role] || 'fa-user';
    }

    getSocialLink(platform, username) {
        const baseUrls = {
            'twitter': 'https://twitter.com/',
            'instagram': 'https://instagram.com/',
            'github': 'https://github.com/',
            'linkedin': 'https://linkedin.com/in/',
            'discord': 'https://discord.com/users/',
            'telegram': 'https://t.me/'
        };
        return (baseUrls[platform] || '#') + username;
    }

    getRoleSpecificHTML(data) {
        switch (data.role) {
            case 'trader':
                return `
                    <div class="role-details trader">
                        <h3><i class="fas fa-chart-line"></i> Trading Profile</h3>
                        <div class="detail-item">
                            <span class="label">Experience:</span>
                            <span class="value">${data.tradingExperience || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Trading Pairs:</span>
                            <span class="value">${data.tradingPairs || 'Not specified'}</span>
                        </div>
                    </div>
                `;
            case 'artist':
                return `
                    <div class="role-details artist">
                        <h3><i class="fas fa-palette"></i> Artist Profile</h3>
                        <div class="detail-item">
                            <span class="label">Art Style:</span>
                            <span class="value">${data.artStyle || 'Not specified'}</span>
                        </div>
                        ${data.galleryLink ? `
                            <div class="detail-item">
                                <span class="label">Gallery:</span>
                                <a href="${data.galleryLink}" target="_blank" class="value link">View Gallery</a>
                            </div>
                        ` : ''}
                    </div>
                `;
            case 'collector':
                return `
                    <div class="role-details collector">
                        <h3><i class="fas fa-gem"></i> Collector Profile</h3>
                        <div class="detail-item">
                            <span class="label">Collection Focus:</span>
                            <span class="value">${data.collectionFocus || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Collection Size:</span>
                            <span class="value">${data.collectionSize || 'Not specified'}</span>
                        </div>
                    </div>
                `;
            default: // individual
                return `
                    <div class="role-details individual">
                        <h3><i class="fas fa-user"></i> Individual Profile</h3>
                        <div class="detail-item">
                            <span class="label">Interests:</span>
                            <span class="value">${data.interests || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Experience Level:</span>
                            <span class="value">${data.experienceLevel || 'Not specified'}</span>
                        </div>
                    </div>
                `;
        }
    }

    showErrorMessage(message) {
        const container = document.querySelector('.profile-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h2>Error Loading Profile</h2>
                    <p>${message}</p>
                    <a href="index.html" class="back-button">Back to Home</a>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PublicProfile();
});
