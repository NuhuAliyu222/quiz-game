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
app.use(express.static(path.join(__dirname, '../public')));

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
  hostSocketId: null
};

const QUESTIONS = quizQuestions;

// Helper functions
function broadcastPlayers() {
  const playersList = Array.from(gameState.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score
  }));
  io.emit('players-update', playersList);
}

function broadcastLeaderboard() {
  const leaderboard = Array.from(gameState.players.values())
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      score: p.score
    }));
  io.emit('leaderboard-update', leaderboard);
}

async function startQuiz() {
  if (gameState.isActive) return;
  
  gameState.isActive = true;
  gameState.currentQuestion = 0;
  gameState.answerLocked = false;
  
  // Reset all player scores
  for (let player of gameState.players.values()) {
    player.score = 0;
    player.hasAnswered = false;
  }
  
  io.emit('quiz-started', {
    totalQuestions: QUESTIONS.length,
    firstQuestion: QUESTIONS[0]
  });
  
  await sendQuestion();
}

async function sendQuestion() {
  if (gameState.currentQuestion >= QUESTIONS.length) {
    endQuiz();
    return;
  }
  
  gameState.answerLocked = false;
  
  // Reset player answered status
  for (let player of gameState.players.values()) {
    player.hasAnswered = false;
  }
  
  const question = QUESTIONS[gameState.currentQuestion];
  gameState.timeLeft = process.env.QUESTION_TIME || 30;
  
  io.emit('new-question', {
    index: gameState.currentQuestion,
    total: QUESTIONS.length,
    question: question.question,
    options: question.options,
    timeLimit: gameState.timeLeft
  });
  
  // Start timer
  if (gameState.timer) clearInterval(gameState.timer);
  
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    io.emit('timer-update', gameState.timeLeft);
    
    if (gameState.timeLeft <= 0 && !gameState.answerLocked) {
      clearInterval(gameState.timer);
      gameState.answerLocked = true;
      
      // Reveal correct answer
      const currentQ = QUESTIONS[gameState.currentQuestion];
      io.emit('time-up', {
        correctAnswer: currentQ.correct,
        correctText: currentQ.options[currentQ.correct]
      });
      
      // Move to next question after delay
      setTimeout(() => {
        gameState.currentQuestion++;
        sendQuestion();
      }, 3000);
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
    const { name, password } = data;
    
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
    
    // Add player
    const player = {
      id: socket.id,
      name: name,
      score: 0,
      hasAnswered: false,
      joinedAt: Date.now()
    };
    
    gameState.players.set(socket.id, player);
    socket.emit('join-success', {
      playerId: socket.id,
      playerName: name,
      gameActive: gameState.isActive
    });
    
    broadcastPlayers();
    
    // If game already active, send current state
    if (gameState.isActive && gameState.currentQuestion < QUESTIONS.length) {
      const currentQ = QUESTIONS[gameState.currentQuestion];
      socket.emit('new-question', {
        index: gameState.currentQuestion,
        total: QUESTIONS.length,
        question: currentQ.question,
        options: currentQ.options,
        timeLimit: gameState.timeLeft
      });
      socket.emit('timer-update', gameState.timeLeft);
    }
  });
  
  // Handle answer submission
  socket.on('submit-answer', (data) => {
    if (!gameState.isActive || gameState.answerLocked) return;
    
    const player = gameState.players.get(socket.id);
    if (!player || player.hasAnswered) return;
    
    const currentQ = QUESTIONS[gameState.currentQuestion];
    const isCorrect = (data.answerIndex === currentQ.correct);
    
    player.hasAnswered = true;
    
    if (isCorrect) {
      const pointsEarned = Math.max(5, Math.floor(gameState.timeLeft / 3) + 5);
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
    
    // Check if all players answered
    let allAnswered = true;
    for (let p of gameState.players.values()) {
      if (!p.hasAnswered && p.id !== gameState.hostSocketId) {
        allAnswered = false;
        break;
      }
    }
    
    if (allAnswered && !gameState.answerLocked) {
      clearInterval(gameState.timer);
      gameState.answerLocked = true;
      
      setTimeout(() => {
        gameState.currentQuestion++;
        sendQuestion();
      }, 2000);
    }
  });
  
  // Host start game
  socket.on('host-start', () => {
    if (gameState.players.size === 0) {
      socket.emit('error', 'No players to start');
      return;
    }
    gameState.hostSocketId = socket.id;
    startQuiz();
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
    score: p.score
  }));
  res.json(players);
});

app.get('/api/game-status', (req, res) => {
  res.json({
    isActive: gameState.isActive,
    playerCount: gameState.players.size,
    currentQuestion: gameState.currentQuestion,
    totalQuestions: QUESTIONS.length
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Quiz server running on http://localhost:${PORT}`);
});