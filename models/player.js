class Player {
    constructor(socketId, name) {
        this.id = socketId;
        this.name = name;
        this.score = 0;
        this.hasAnswered = false;
        this.joinedAt = new Date();
        this.isActive = true;
    }

    resetForNewQuestion() {
        this.hasAnswered = false;
    }

    addPoints(points) {
        this.score += points;
        return this.score;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            hasAnswered: this.hasAnswered,
            joinedAt: this.joinedAt
        };
    }
}

module.exports = Player;