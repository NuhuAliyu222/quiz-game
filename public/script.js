const socket = io();

let currentPlayer = null;
let currentQuestionIndex = 0;
let totalQuestions = 50;
let answerLocked = false;
let isHost = false;

// DOM elements
const loginScreen = document.getElementById('login-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const notification = document.getElementById('notification');

// Login elements
const playerNameInput = document.getElementById('player-name');
const passwordInput = document.getElementById('quiz-password');
const joinBtn = document.getElementById('join-btn');

// Lobby elements
const playersListDiv = document.getElementById('players-list');
const playerCountSpan = document.getElementById('player-count');
const gameStatusSpan = document.getElementById('game-status');
const hostControls = document.getElementById('host-controls');
const startGameBtn = document.getElementById('start-game-btn');

// Quiz elements
const currentPlayerSpan = document.getElementById('current-player');
const scoreDisplay = document.getElementById('score-display');
const progressFill = document.getElementById('progress-fill');
const timerDisplay = document.getElementById('timer');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const exitBtn = document.getElementById('exit-btn');

// Results
const finalScoreDiv = document.getElementById('final-score');
const leaderboardContainer = document.getElementById('leaderboard-container');
const playAgainBtn = document.getElementById('play-again-btn');

function showNotification(msg, isError = false) {
    notification.textContent = msg;
    notification.classList.add('show');
    notification.classList.toggle('error', isError);
    setTimeout(() => notification.classList.remove('show'), 2500);
}

// Socket event handlers
socket.on('join-error', (msg) => {
    showNotification(msg, true);
});

socket.on('join-success', (data) => {
    currentPlayer = {
        id: data.playerId,
        name: data.playerName
    };
    currentPlayerSpan.textContent = data.playerName;
    
    loginScreen.classList.remove('active');
    lobbyScreen.classList.add('active');
    
    showNotification(`Welcome ${data.playerName}!`);
});

socket.on('players-update', (players) => {
    playersListDiv.innerHTML = '';
    players.forEach(player => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        chip.innerHTML = `${player.name} <span style="color:#fdbb2d;">${player.score} pts</span>`;
        playersListDiv.appendChild(chip);
    });
    playerCountSpan.textContent = players.length;
    
    // Check if current player is host (first player)
    if (players.length > 0 && players[0].id === currentPlayer?.id && !isHost) {
        isHost = true;
        hostControls.style.display = 'block';
        gameStatusSpan.textContent = 'Ready to start';
    }
});

socket.on('quiz-started', (data) => {
    lobbyScreen.classList.remove('active');
    quizScreen.classList.add('active');
    totalQuestions = data.totalQuestions;
    currentQuestionIndex = 0;
    answerLocked = false;
    showNotification('Quiz started! Good luck!');
});

socket.on('new-question', (data) => {
    currentQuestionIndex = data.index;
    answerLocked = false;
    
    questionText.textContent = data.question;
    questionCounter.textContent = `Question ${data.index + 1}/${data.total}`;
    
    // Update progress
    const progress = ((data.index) / data.total) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Render options
    optionsContainer.innerHTML = '';
    data.options.forEach((opt, idx) => {
        const optDiv = document.createElement('div');
        optDiv.className = 'option';
        optDiv.textContent = opt;
        optDiv.dataset.index = idx;
        optDiv.addEventListener('click', () => submitAnswer(idx));
        optionsContainer.appendChild(optDiv);
    });
    
    timerDisplay.textContent = data.timeLimit;
    
    // Start client-side timer for independent mode
    if (data.mode === 'independent') {
        let timeRemaining = data.timeLimit;
        if (window.clientTimer) clearInterval(window.clientTimer);
        window.clientTimer = setInterval(() => {
            timeRemaining--;
            timerDisplay.textContent = timeRemaining;
            if (timeRemaining <= 10) {
                timerDisplay.classList.add('warning');
            }
            if (timeRemaining <= 0) {
                clearInterval(window.clientTimer);
                answerLocked = true;
            }
        }, 1000);
    }
});

socket.on('timer-update', (timeLeft) => {
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }
});

socket.on('answer-result', (data) => {
    if (data.correct) {
        showNotification(`✅ Correct! +${data.points} points`);
    } else {
        showNotification(`❌ Wrong! Correct answer: ${data.correctAnswer}`);
    }
});

socket.on('leaderboard-update', (leaderboard) => {
    const currentPlayerEntry = leaderboard.find(p => p.name === currentPlayer?.name);
    if (currentPlayerEntry) {
        scoreDisplay.textContent = currentPlayerEntry.score;
    }
});

socket.on('time-up', (data) => {
    if (!answerLocked) {
        answerLocked = true;
        const options = document.querySelectorAll('.option');
        options.forEach((opt, idx) => {
            opt.style.pointerEvents = 'none';
            if (idx === data.correctAnswer) {
                opt.classList.add('correct-highlight');
            }
        });
        showNotification(`⏰ Time's up! Answer: ${data.correctText}`);
        
        setTimeout(() => {
            // Wait for next question
        }, 2000);
    }
});

socket.on('quiz-ended', (results) => {
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    const playerResult = results.find(r => r.name === currentPlayer?.name);
    finalScoreDiv.textContent = `${playerResult?.score || 0} pts`;
    
    leaderboardContainer.innerHTML = '';
    results.forEach((result, idx) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <span>${idx + 1}. ${result.name} ${result.name === currentPlayer?.name ? '👑' : ''}</span>
            <span style="color:#fdbb2d; font-weight:bold;">${result.score} pts</span>
        `;
        if (idx < 3) item.classList.add(`top-${idx + 1}`);
        leaderboardContainer.appendChild(item);
    });
});

socket.on('host-disconnected', (msg) => {
    showNotification(msg, true);
    setTimeout(() => location.reload(), 2000);
});

// Functions
function submitAnswer(answerIndex) {
    if (answerLocked) return;
    answerLocked = true;
    socket.emit('submit-answer', { answerIndex });
    
    // Highlight selected option
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        opt.style.pointerEvents = 'none';
        if (idx === answerIndex) {
            opt.classList.add('selected');
        }
    });
}

function joinQuiz() {
    const name = playerNameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!name) {
        showNotification('Please enter your name', true);
        return;
    }
    if (!password) {
        showNotification('Please enter the password', true);
        return;
    }
    
    socket.emit('player-join', { name, password });
}

function startQuiz() {
    if (isHost) {
        socket.emit('host-start');
        showNotification('Starting quiz...');
    }
}

function exitQuiz() {
    if (confirm('Are you sure you want to exit the quiz?')) {
        location.reload();
    }
}

function playAgain() {
    location.reload();
}

// Event listeners
joinBtn.addEventListener('click', joinQuiz);
if (startGameBtn) startGameBtn.addEventListener('click', startQuiz);
if (exitBtn) exitBtn.addEventListener('click', exitQuiz);
playAgainBtn.addEventListener('click', playAgain);

// Enter key support
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinQuiz();
});
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinQuiz();
});
