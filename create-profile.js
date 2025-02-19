class ProfileCreator {
    constructor() {
        this.selectedRole = null;
        this.username = null;
        this.walletAddress = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Sections
        this.roleSection = document.getElementById('roleSection');
        this.usernameSection = document.getElementById('usernameSection');
        this.walletSection = document.getElementById('walletSection');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingMessage = document.getElementById('loadingMessage');

        // Role selection elements
        this.roleCards = document.querySelectorAll('.role-card');
        
        // Username elements
        this.usernameInput = document.getElementById('usernameInput');
        this.usernameStatus = document.getElementById('usernameStatus');
        
        // Wallet elements
        this.connectWalletBtn = document.getElementById('connectWalletBtn');

        // Step indicators
        this.steps = document.querySelectorAll('.step');
    }

    attachEventListeners() {
        // Role selection
        this.roleCards.forEach(card => {
            card.addEventListener('click', () => this.handleRoleSelection(card));
        });

        // Username input
        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', () => this.handleUsernameInput());
            this.usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.usernameInput.disabled) {
                    this.handleUsernameSubmit();
                }
            });
        }

        // Wallet connection
        if (this.connectWalletBtn) {
            this.connectWalletBtn.addEventListener('click', () => this.connectWallet());
        }
    }

    updateStepIndicator(step) {
        this.steps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (index === step) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
    }

    handleRoleSelection(card) {
        // Remove selection from all cards
        this.roleCards.forEach(c => c.classList.remove('selected'));

        // Add selection to clicked card
        card.classList.add('selected');
        
        // Store selected role
        this.selectedRole = card.dataset.role;
        
        // Update step indicator
        this.updateStepIndicator(1);

        // Show username section with animation
        setTimeout(() => {
            this.roleSection.classList.add('slide-out');
            setTimeout(() => {
                this.roleSection.classList.add('hidden');
                this.usernameSection.classList.remove('hidden');
                this.usernameSection.classList.add('slide-in');
                this.usernameInput.focus();
            }, 300);
        }, 500);
    }

    async handleUsernameInput() {
        const username = this.usernameInput.value.toLowerCase();
        const isValid = /^[a-z0-9_]{3,30}$/.test(username);
        
        if (!isValid) {
            this.usernameStatus.textContent = username.length < 3 ? 
                'Username must be at least 3 characters' : 
                'Use only letters, numbers, and underscores';
            this.usernameStatus.className = 'username-status error';
            return false;
        }

        // Check username availability
        try {
            const response = await fetch(`http://localhost:3002/api/check-username/${username}`);
            const data = await response.json();
            
            if (data.available) {
                this.usernameStatus.textContent = 'Username is available!';
                this.usernameStatus.className = 'username-status success';
                this.username = username;
                return true;
            } else {
                this.usernameStatus.textContent = 'Username is already taken';
                this.usernameStatus.className = 'username-status error';
                return false;
            }
        } catch (error) {
            console.error('Error checking username:', error);
            this.usernameStatus.textContent = 'Error checking username availability';
            this.usernameStatus.className = 'username-status error';
            return false;
        }
    }

    async handleUsernameSubmit() {
        if (await this.handleUsernameInput()) {
            // Update step indicator
            this.updateStepIndicator(2);

            // Show wallet section with animation
            this.usernameSection.classList.add('slide-out');
            setTimeout(() => {
                this.usernameSection.classList.add('hidden');
                this.walletSection.classList.remove('hidden');
                this.walletSection.classList.add('slide-in');
            }, 300);
        }
    }

    async connectWallet() {
        this.loadingOverlay.classList.remove('hidden');
        this.loadingMessage.textContent = 'Connecting wallet...';

        try {
            // Check if Phantom is installed
            if (!window.solana || !window.solana.isPhantom) {
                const installUrl = 'https://phantom.app/';
                if (confirm('Phantom wallet is not installed. Would you like to install it now?')) {
                    window.open(installUrl, '_blank');
                }
                throw new Error('Please install Phantom wallet and refresh the page');
            }

            // Connect to Phantom
            const provider = window.solana;
            
            // Request connection
            const connection = await provider.connect();
            this.walletAddress = connection.publicKey.toString();

            // Check if wallet is already used
            const response = await fetch(`http://localhost:3002/api/check-wallet/${this.walletAddress}`);
            const data = await response.json();

            if (!data.available) {
                throw new Error('This wallet already has a profile');
            }

            this.loadingMessage.textContent = 'Wallet connected! Creating profile...';

            // Create profile
            await this.createProfile();

        } catch (error) {
            console.error('Wallet connection error:', error);
            this.loadingMessage.textContent = error.message;
            setTimeout(() => {
                this.loadingOverlay.classList.add('hidden');
            }, 3000);
        }
    }

    async createProfile() {
        try {
            const profileData = {
                username: this.username,
                role: this.selectedRole,
                walletAddress: this.walletAddress
            };

            const response = await fetch('http://localhost:3002/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create profile');
            }

            // Save wallet address in localStorage
            localStorage.setItem('walletAddress', this.walletAddress);

            // Redirect to profile editor
            window.location.href = `profile-editor.html?username=${encodeURIComponent(this.username)}`;

        } catch (error) {
            console.error('Error creating profile:', error);
            this.loadingMessage.textContent = error.message;
            setTimeout(() => {
                this.loadingOverlay.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileCreator();
});
