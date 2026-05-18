const express = require('express');
const router = express.Router();
const { quizQuestions } = require('../utils/questions');

// Get all questions (for admin/debugging)
router.get('/questions', (req, res) => {
    res.json({
        total: quizQuestions.length,
        questions: quizQuestions.map((q, idx) => ({
            id: idx,
            question: q.question,
            options: q.options,
            // Don't send correct answers in production without auth
            correct: req.query.includeAnswers === 'true' ? q.correct : undefined
        }))
    });
});

// Get question by ID
router.get('/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < quizQuestions.length) {
        const q = quizQuestions[id];
        res.json({
            id: id,
            question: q.question,
            options: q.options,
            totalQuestions: quizQuestions.length
        });
    } else {
        res.status(404).json({ error: 'Question not found' });
    }
});

// Get quiz metadata
router.get('/metadata', (req, res) => {
    res.json({
        totalQuestions: quizQuestions.length,
        categories: ['Computer Basics', 'AI', 'Cybersecurity', 'Programming', 'Software', 'Internet', 'Microsoft Office'],
        timePerQuestion: parseInt(process.env.QUESTION_TIME) || 30
    });
});

// Validate password (without connecting to socket)
router.post('/validate-password', (req, res) => {
    const { password } = req.body;
    const isValid = password === process.env.QUIZ_PASSWORD;
    res.json({ valid: isValid });
});

module.exports = router;
