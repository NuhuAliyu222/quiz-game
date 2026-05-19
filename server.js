const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { quizQuestions } = require('./utils/questions');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);
// Add this with other route handlers
const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);


// Game state
let gameState = {
  isActive: false,
  players: new Map(), // socketId -> player object
  currentQuestion: 0,
  scores: new Map(),
  timer: null,
  timeLeft: 30,
  answerLocked: false,
  hostSocketId: null,
  questionStartTime: null,
  multiplayerMode: 'independent' // 'independent' or 'synchronized'
};

const QUESTIONS = quizQuestions;

// Helper functions
function broadcastPlayers() {
  const playersList = Array.from(gameState.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    currentQuestion: p.currentQuestion,
    hasAnswered: p.hasAnswered
  }));
  io.emit('players-update', playersList);
}

function broadcastLeaderboard() {
  const leaderboard = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      score: p.score,
      currentQuestion: p.currentQuestion
    }));
  io.emit('leaderboard-update', leaderboard);
}

// Check if all players have answered (for synchronized mode)
function checkAllPlayersAnswered() {
  for (let p of gameState.players.values()) {
    if (!p.hasAnswered && p.currentQuestion === gameState.currentQuestion) {
      return false;
    }
  }
  return true;
}

// Proceed to next question (synchronized mode)
function proceedToNextQuestion() {
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.answerLocked = true;
  
  gameState.currentQuestion++;
  sendQuestion();
}

// Send next question to individual player (independent mode)
function sendNextQuestionToPlayer(socket) {
  const player = gameState.players.get(socket.id);
  if (!player) return;
  
  player.currentQuestion++;
  player.hasAnswered = false;
  
  // Check if player completed all questions
  if (player.currentQuestion >= QUESTIONS.length) {
    socket.emit('player-quiz-complete', {
      finalScore: player.score,
      totalQuestions: QUESTIONS.length
    });
    
    // Broadcast updated leaderboard
    broadcastLeaderboard();
    
    // Check if all players finished
    checkAllPlayersCompleted();
    return;
  }
  
  // Send next question to player
  const question = QUESTIONS[player.currentQuestion];
  const timeLimit = process.env.QUESTION_TIME || 30;
  
  socket.emit('new-question', {
    index: player.currentQuestion,
    total: QUESTIONS.length,
    question: question.question,
    options: question.options,
    timeLimit: timeLimit,
    mode: 'independent'
  });
  
  socket.emit('timer-update', timeLimit);
}

// Check if all players completed quiz
function checkAllPlayersCompleted() {
  for (let player of gameState.players.values()) {
    if (player.currentQuestion < QUESTIONS.length) {
      return false;
    }
  }
  return true;
}

async function startQuiz() {
  if (gameState.isActive) return;
  
  gameState.isActive = true;
  gameState.currentQuestion = 0;
  gameState.answerLocked = false;
  gameState.questionStartTime = Date.now();
  
  // Reset all player scores and progress
  for (let player of gameState.players.values()) {
    player.score = 0;
    player.hasAnswered = false;
    player.currentQuestion = 0;
  }
  
  const mode = gameState.multiplayerMode;
  
  io.emit('quiz-started', {
    totalQuestions: QUESTIONS.length,
    mode: mode,
    firstQuestion: QUESTIONS[0]
  });
  
  if (mode === 'synchronized') {
    await sendQuestion();
  } else if (mode === 'independent') {
    // Send first question to all players
    for (let [socketId, player] of gameState.players.entries()) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        sendNextQuestionToPlayer(socket);
      }
    }
  }
}

async function sendQuestion() {
  if (gameState.currentQuestion >= QUESTIONS.length) {
    endQuiz();
    return;
  }
  
  gameState.answerLocked = false;
  gameState.questionStartTime = Date.now();
  
  // Reset player answered status for synchronized mode
  for (let player of gameState.players.values()) {
    if (player.currentQuestion === gameState.currentQuestion) {
      player.hasAnswered = false;
    }
  }
  
  const question = QUESTIONS[gameState.currentQuestion];
  gameState.timeLeft = process.env.QUESTION_TIME || 30;
  
  io.emit('new-question', {
    index: gameState.currentQuestion,
    total: QUESTIONS.length,
    question: question.question,
    options: question.options,
    timeLimit: gameState.timeLeft,
    mode: 'synchronized'
  });
  
  // Start timer
  if (gameState.timer) clearInterval(gameState.timer);
  
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    io.emit('timer-update', gameState.timeLeft);
    
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timer);
      gameState.answerLocked = true;
      
      // Reveal correct answer
      const currentQ = QUESTIONS[gameState.currentQuestion];
      io.emit('time-up', {
        correctAnswer: currentQ.correct,
        correctText: currentQ.options[currentQ.correct]
      });
      
      // Move to next question immediately
      proceedToNextQuestion();
    }
  }, 1000);
}

function endQuiz() {
  if (gameState.timer) clearInterval(gameState.timer);
  gameState.isActive = false;
  
  const finalResults = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      score: p.score,
      id: p.id
    }));
  
  io.emit('quiz-ended', finalResults);
}

// Socket.IO events
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // Handle player join
  socket.on('player-join', (data) => {
    const { name, password, mode } = data;
    
    // Check password
    if (password !== process.env.QUIZ_PASSWORD) {
      socket.emit('join-error', 'Invalid password');
      return;
    }
    
    // Check if name exists
    let nameExists = false;
    for (let player of gameState.players.values()) {
      if (player.name.toLowerCase() === name.toLowerCase()) {
        nameExists = true;
        break;
      }
    }
    
    if (nameExists) {
      socket.emit('join-error', 'Username already taken');
      return;
    }
    
    // Check max players
    if (gameState.players.size >= (process.env.MAX_PLAYERS || 50)) {
      socket.emit('join-error', 'Game is full');
      return;
    }
    
    // Set multiplayer mode on first player join
    if (gameState.players.size === 0 && mode) {
      gameState.multiplayerMode = mode;
    }
    
    // Add player
    const player = {
      id: socket.id,
      name: name,
      score: 0,
      hasAnswered: false,
      currentQuestion: 0,
      joinedAt: Date.now()
    };
    
    gameState.players.set(socket.id, player);
    socket.emit('join-success', {
      playerId: socket.id,
      playerName: name,
      gameActive: gameState.isActive,
      mode: gameState.multiplayerMode
    });
    
    broadcastPlayers();
    
    // If game already active, send current state
    if (gameState.isActive) {
      if (gameState.multiplayerMode === 'synchronized' && gameState.currentQuestion < QUESTIONS.length) {
        const currentQ = QUESTIONS[gameState.currentQuestion];
        socket.emit('new-question', {
          index: gameState.currentQuestion,
          total: QUESTIONS.length,
          question: currentQ.question,
          options: currentQ.options,
          timeLimit: gameState.timeLeft,
          mode: 'synchronized'
        });
        socket.emit('timer-update', gameState.timeLeft);
      } else if (gameState.multiplayerMode === 'independent' && player.currentQuestion < QUESTIONS.length) {
        sendNextQuestionToPlayer(socket);
      }
    }
  });
  
  // Handle answer submission
  socket.on('submit-answer', (data) => {
    if (!gameState.isActive) return;
    
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    const mode = gameState.multiplayerMode;
    const questionIndex = player.currentQuestion;
    
    // Security: check if player already answered this question
    if (player.hasAnswered && mode === 'synchronized') return;
    if (questionIndex >= QUESTIONS.length) return;
    
    const currentQ = QUESTIONS[questionIndex];
    const isCorrect = (data.answerIndex === currentQ.correct);
    
    player.hasAnswered = true;
    
    if (isCorrect) {
      const pointsEarned = 2;
      player.score += pointsEarned;
      
      socket.emit('answer-result', {
        correct: true,
        points: pointsEarned,
        correctAnswer: currentQ.options[currentQ.correct]
      });
    } else {
      socket.emit('answer-result', {
        correct: false,
        points: 0,
        correctAnswer: currentQ.options[currentQ.correct]
      });
    }
    
    // Update scores for everyone
    broadcastLeaderboard();
    
    // Handle mode-specific logic
    if (mode === 'independent') {
      // Show answer feedback, then move to next question
      setTimeout(() => {
        sendNextQuestionToPlayer(socket);
      }, 1500);
    } else if (mode === 'synchronized') {
      // Check if all players have answered
      if (checkAllPlayersAnswered()) {
        proceedToNextQuestion();
      }
    }
  });
  
  // Host start game
  socket.on('host-start', (data) => {
    if (gameState.players.size === 0) {
      socket.emit('error', 'No players to start');
      return;
    }
    
    // Set mode if provided
    if (data && data.mode) {
      gameState.multiplayerMode = data.mode;
    }
    
    gameState.hostSocketId = socket.id;
    startQuiz();
  });
  
  // Set game mode (before game starts)
  socket.on('set-game-mode', (data) => {
    if (!gameState.isActive && gameState.players.size > 0) {
      gameState.multiplayerMode = data.mode;
      io.emit('game-mode-updated', { mode: gameState.multiplayerMode });
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    const player = gameState.players.get(socket.id);
    if (player) {
      gameState.players.delete(socket.id);
      broadcastPlayers();
      broadcastLeaderboard();
    }
    
    if (socket.id === gameState.hostSocketId && gameState.isActive) {
      // Host left, end game
      io.emit('host-disconnected', 'Host has left the game');
      gameState.isActive = false;
      if (gameState.timer) clearInterval(gameState.timer);
    }
  });
});

// API Routes
app.get('/api/players', (req, res) => {
  const players = Array.from(gameState.players.values()).map(p => ({
    name: p.name,
    score: p.score,
    currentQuestion: p.currentQuestion
  }));
  res.json(players);
});

app.get('/api/game-status', (req, res) => {
  res.json({
    isActive: gameState.isActive,
    playerCount: gameState.players.size,
    currentQuestion: gameState.currentQuestion,
    totalQuestions: QUESTIONS.length,
    mode: gameState.multiplayerMode
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Quiz server running on http://localhost:${PORT}`);
});
