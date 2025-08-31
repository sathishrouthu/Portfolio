class TicTacToeGame {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.player1Name = '';
        this.player2Name = '';
        this.player1Score = 0;
        this.player2Score = 0;
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.hideLoadingOverlay();
    }
    
    cacheElements() {
        // Setup elements
        this.setupSection = document.getElementById('setupSection');
        this.gameSection = document.getElementById('gameSection');
        this.player1Input = document.getElementById('player1Name');
        this.player2Input = document.getElementById('player2Name');
        this.startGameBtn = document.getElementById('startGameBtn');
        
        // Game elements
        this.gameBoard = document.getElementById('gameBoard');
        this.gameCells = document.querySelectorAll('.game-cell');
        this.currentPlayerName = document.getElementById('currentPlayerName');
        this.currentPlayerSymbol = document.getElementById('currentPlayerSymbol');
        this.player1ScoreLabel = document.getElementById('player1ScoreLabel');
        this.player2ScoreLabel = document.getElementById('player2ScoreLabel');
        this.player1ScoreValue = document.getElementById('player1Score');
        this.player2ScoreValue = document.getElementById('player2Score');
        
        // Control elements
        this.resetGameBtn = document.getElementById('resetGameBtn');
        this.newPlayersBtn = document.getElementById('newPlayersBtn');
        
        // Modal elements
        this.winnerModal = document.getElementById('winnerModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.winnerIcon = document.getElementById('winnerIcon');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.confettiContainer = document.getElementById('confettiContainer');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }
    
    bindEvents() {
        // Setup events
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.player1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.player2Input.focus();
        });
        this.player2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
        
        // Game events
        this.gameCells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Control events
        this.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.newPlayersBtn.addEventListener('click', () => this.newPlayers());
        
        // Modal events
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.winnerModal.addEventListener('click', (e) => {
            if (e.target === this.winnerModal) this.closeModal();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.winnerModal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }
    
    hideLoadingOverlay() {
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');
        }, 1000);
    }
    
    startGame() {
        const player1 = this.player1Input.value.trim();
        const player2 = this.player2Input.value.trim();
        
        if (!player1 || !player2) {
            this.showError('Please enter both player names!');
            return;
        }
        
        if (player1.toLowerCase() === player2.toLowerCase()) {
            this.showError('Players must have different names!');
            return;
        }
        
        this.player1Name = player1;
        this.player2Name = player2;
        
        // Update UI
        this.player1ScoreLabel.textContent = this.player1Name;
        this.player2ScoreLabel.textContent = this.player2Name;
        this.updateCurrentPlayer();
        
        // Animate transition
        this.animateTransition();
    }
    
    animateTransition() {
        this.setupSection.style.transform = 'translateX(-100%)';
        this.setupSection.style.opacity = '0';
        
        setTimeout(() => {
            this.setupSection.style.display = 'none';
            this.gameSection.style.display = 'block';
            this.gameSection.style.transform = 'translateX(100%)';
            this.gameSection.style.opacity = '0';
            
            setTimeout(() => {
                this.gameSection.style.transform = 'translateX(0)';
                this.gameSection.style.opacity = '1';
                this.gameActive = true;
                this.addBoardAnimation();
            }, 50);
        }, 300);
    }
    
    addBoardAnimation() {
        this.gameCells.forEach((cell, index) => {
            cell.style.animation = `cellSlideIn 0.4s ease ${index * 0.05}s both`;
        });
    }
    
    handleCellClick(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);
        
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        this.makeMove(cell, index);
    }
    
    makeMove(cell, index) {
        // Update board state
        this.board[index] = this.currentPlayer;
        
        // Add symbol to cell with animation
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Add click animation
        this.addCellClickAnimation(cell);
        
        // Check for win or tie
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkTie()) {
            this.handleTie();
        } else {
            this.switchPlayer();
        }
    }
    
    addCellClickAnimation(cell) {
        cell.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 200);
    }
    
    checkWin() {
        return this.winningConditions.some(condition => {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCells = condition;
                return true;
            }
            return false;
        });
    }
    
    checkTie() {
        return this.board.every(cell => cell !== '');
    }
    
    handleWin() {
        this.gameActive = false;
        
        // Highlight winning cells
        this.highlightWinningCells();
        
        // Update score
        if (this.currentPlayer === 'X') {
            this.player1Score++;
            this.player1ScoreValue.textContent = this.player1Score;
        } else {
            this.player2Score++;
            this.player2ScoreValue.textContent = this.player2Score;
        }
        
        // Show winner modal
        setTimeout(() => {
            this.showWinnerModal();
        }, 1000);
    }
    
    handleTie() {
        this.gameActive = false;
        
        // Add tie animation to all cells
        this.gameCells.forEach(cell => {
            cell.style.background = 'linear-gradient(135deg, #a0aec0, #cbd5e0)';
            cell.style.animation = 'pulse 1s ease infinite';
        });
        
        setTimeout(() => {
            this.showTieModal();
        }, 1000);
    }
    
    highlightWinningCells() {
        this.winningCells.forEach(index => {
            const cell = this.gameCells[index];
            cell.classList.add('winning');
        });
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateCurrentPlayer();
    }
    
    updateCurrentPlayer() {
        const currentName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        this.currentPlayerName.textContent = currentName;
        this.currentPlayerSymbol.textContent = this.currentPlayer;
        
        // Add animation to current player indicator
        this.currentPlayerSymbol.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            this.currentPlayerSymbol.style.animation = 'pulse 2s infinite';
        }, 500);
    }
    
    showWinnerModal() {
        const winnerName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        
        this.modalTitle.textContent = 'Congratulations! 🎉';
        this.modalMessage.textContent = `${winnerName} wins this round!`;
        this.winnerIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        this.winnerIcon.classList.remove('tie');
        
        this.showModal();
        this.createConfetti();
    }
    
    showTieModal() {
        this.modalTitle.textContent = "It's a Tie! 🤝";
        this.modalMessage.textContent = `${this.player1Name} and ${this.player2Name} tied! Great game!`;
        this.winnerIcon.innerHTML = '<i class="fas fa-handshake"></i>';
        this.winnerIcon.classList.add('tie');
        
        this.showModal();
    }
    
    showModal() {
        this.winnerModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Add entrance animation
        setTimeout(() => {
            this.winnerModal.querySelector('.modal-content').style.animation = 'modalBounce 0.6s ease';
        }, 100);
    }
    
    closeModal() {
        this.winnerModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        this.clearConfetti();
    }
    
    createConfetti() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4ecdc4', '#ffd93d'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            this.confettiContainer.appendChild(confetti);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            this.clearConfetti();
        }, 5000);
    }
    
    clearConfetti() {
        this.confettiContainer.innerHTML = '';
    }
    
    playAgain() {
        this.closeModal();
        this.resetGame();
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCells = [];
        
        // Clear board
        this.gameCells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'game-cell';
            cell.style.background = '';
            cell.style.animation = '';
        });
        
        // Reset current player
        this.updateCurrentPlayer();
        
        // Add reset animation
        this.gameBoard.style.animation = 'boardReset 0.5s ease';
        setTimeout(() => {
            this.gameBoard.style.animation = '';
            this.addBoardAnimation();
        }, 500);
    }
    
    newPlayers() {
        // Reset everything
        this.resetGame();
        this.gameActive = false;
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1ScoreValue.textContent = '0';
        this.player2ScoreValue.textContent = '0';
        
        // Clear inputs
        this.player1Input.value = '';
        this.player2Input.value = '';
        
        // Animate back to setup
        this.gameSection.style.transform = 'translateX(100%)';
        this.gameSection.style.opacity = '0';
        
        setTimeout(() => {
            this.gameSection.style.display = 'none';
            this.setupSection.style.display = 'block';
            this.setupSection.style.transform = 'translateX(-100%)';
            this.setupSection.style.opacity = '0';
            
            setTimeout(() => {
                this.setupSection.style.transform = 'translateX(0)';
                this.setupSection.style.opacity = '1';
                this.player1Input.focus();
            }, 50);
        }, 300);
    }
    
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        // Add error styles
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(255, 107, 107, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 3000);
        
        // Add shake animation to invalid inputs
        if (!this.player1Input.value.trim()) {
            this.addShakeAnimation(this.player1Input);
        }
        if (!this.player2Input.value.trim()) {
            this.addShakeAnimation(this.player2Input);
        }
    }
    
    addShakeAnimation(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Add additional CSS animations via JavaScript
const additionalStyles = `
    @keyframes cellSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes boardReset {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
    
    @keyframes modalBounce {
        0% { transform: scale(0.3) translateY(50px); }
        50% { transform: scale(1.05) translateY(-10px); }
        70% { transform: scale(0.9) translateY(0); }
        100% { transform: scale(1) translateY(0); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});

// Add some fun easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code for rainbow mode
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    if (!window.konamiSequence) window.konamiSequence = [];
    
    window.konamiSequence.push(e.code);
    if (window.konamiSequence.length > konamiCode.length) {
        window.konamiSequence.shift();
    }
    
    if (window.konamiSequence.join(',') === konamiCode.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 10000);
    }
});

// Rainbow animation for easter egg
const rainbowStyle = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;

const rainbowStyleSheet = document.createElement('style');
rainbowStyleSheet.textContent = rainbowStyle;
document.head.appendChild(rainbowStyleSheet);