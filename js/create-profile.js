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
        this.roleSelection = document.querySelector('.role-selection');
        this.usernameSection = document.querySelector('.username-section');
        this.walletConnect = document.querySelector('.wallet-connect');
        this.loadingOverlay = document.querySelector('.loading-overlay');

        // Role selection elements
        this.roleCards = document.querySelectorAll('.role-card');
        
        // Username elements
        this.usernameInput = document.querySelector('#username');
        this.usernameStatus = document.querySelector('.username-status');
        this.continueBtn = document.querySelector('.continue-btn');
        
        // Wallet elements
        this.connectWalletBtn = document.querySelector('.connect-wallet-btn');
        this.walletStatus = document.querySelector('.wallet-status');

        // Step indicators
        this.steps = document.querySelectorAll('.step');
    }

    attachEventListeners() {
        // Role selection
        this.roleCards.forEach(card => {
            const button = card.querySelector('.select-role-btn');
            if (button) {
                button.addEventListener('click', () => this.handleRoleSelection(card));
            }
        });

        // Username input
        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', () => this.handleUsernameInput());
        }

        if (this.continueBtn) {
            this.continueBtn.addEventListener('click', () => this.handleUsernameSubmit());
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
        this.roleCards.forEach(c => {
            c.classList.remove('selected');
            const btn = c.querySelector('.select-role-btn');
            if (btn) btn.textContent = 'Select Role';
        });

        // Add selection to clicked card
        card.classList.add('selected');
        const selectedBtn = card.querySelector('.select-role-btn');
        if (selectedBtn) selectedBtn.textContent = 'Selected';
        
        // Store selected role
        this.selectedRole = card.dataset.role;
        
        // Update step indicator
        this.updateStepIndicator(1);

        // Show username section with animation
        this.roleSelection.classList.add('slide-out');
        setTimeout(() => {
            this.roleSelection.style.display = 'none';
            this.usernameSection.classList.remove('hidden');
            this.usernameSection.classList.add('slide-in');
            if (this.usernameInput) this.usernameInput.focus();
        }, 300);
    }

    async handleUsernameInput() {
        const username = this.usernameInput.value.toLowerCase();
        const isValid = /^[a-z0-9_]{3,30}$/.test(username);
        
        if (!isValid) {
            this.usernameStatus.textContent = username.length < 3 ? 
                'Username must be at least 3 characters' : 
                'Use only letters, numbers, and underscores';
            this.usernameStatus.className = 'username-status error';
            this.continueBtn.disabled = true;
            return;
        }

        // Simulate username availability check
        this.usernameStatus.textContent = 'Checking availability...';
        this.usernameStatus.className = 'username-status';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo, assume username is available if it ends with odd number
        const isAvailable = parseInt(username.slice(-1)) % 2 === 1 || isNaN(parseInt(username.slice(-1)));
        
        if (isAvailable) {
            this.usernameStatus.textContent = 'Username is available!';
            this.usernameStatus.className = 'username-status success';
            this.continueBtn.disabled = false;
            this.username = username;
        } else {
            this.usernameStatus.textContent = 'Username is already taken';
            this.usernameStatus.className = 'username-status error';
            this.continueBtn.disabled = true;
        }
    }

    handleUsernameSubmit() {
        if (!this.username || this.continueBtn.disabled) return;

        // Update step indicator
        this.updateStepIndicator(2);

        // Show wallet section with animation
        this.usernameSection.classList.add('slide-out');
        setTimeout(() => {
            this.usernameSection.classList.add('hidden');
            this.walletConnect.classList.remove('hidden');
            this.walletConnect.classList.add('slide-in');
        }, 300);
    }

    async connectWallet() {
        this.loadingOverlay.classList.remove('hidden');
        
        try {
            // Simulate wallet connection
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.walletAddress = '0x' + Math.random().toString(16).slice(2, 12);
            this.walletStatus.textContent = `Connected: ${this.walletAddress}`;
            this.walletStatus.className = 'wallet-status success';
            
            // Redirect to profile editor after successful connection
            setTimeout(() => {
                window.location.href = 'profile-editor.html';
            }, 1000);
        } catch (error) {
            this.walletStatus.textContent = 'Failed to connect wallet. Please try again.';
            this.walletStatus.className = 'wallet-status error';
        } finally {
            this.loadingOverlay.classList.add('hidden');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileCreator();
});
