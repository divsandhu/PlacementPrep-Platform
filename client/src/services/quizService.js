// Quiz Service - handles quiz-related operations on the client side
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class QuizService {
  constructor() {
    this.currentQuiz = null;
    this.currentQuestion = null;
    this.userAnswers = new Map();
    this.score = 0;
  }

  // Create a new room
  async createRoom(hostId, hostUserId, topic = 'aptitude', difficulty = 'easy', quizTitle = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/rooms`, {
        hostId,
        hostUserId,
        topic,
        difficulty,
        quizTitle
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create room: ${error.response?.data?.error || error.message}`);
    }
  }

  // Join an existing room
  async joinRoom(roomId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Room not found. Please check the room ID.');
      }
      throw new Error(`Failed to join room: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get available topics
  async getAvailableTopics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms/topics`);
      return response.data.topics;
    } catch (error) {
      throw new Error(`Failed to get topics: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get quiz questions for a specific topic and difficulty
  async getQuizQuestions(topic, difficulty, count = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/rooms/quizzes/${topic}/${difficulty}`, {
        params: { count }
      });
      return response.data.quiz;
    } catch (error) {
      throw new Error(`Failed to get quiz questions: ${error.response?.data?.error || error.message}`);
    }
  }

  // Set current quiz data
  setCurrentQuiz(quiz) {
    this.currentQuiz = quiz;
    this.userAnswers.clear();
    this.score = 0;
  }

  // Set current question
  setCurrentQuestion(question, questionNumber) {
    this.currentQuestion = {
      ...question,
      questionNumber,
      totalQuestions: this.currentQuiz?.questions?.length || 0
    };
  }

  // Submit answer for current question
  submitAnswer(answer) {
    if (!this.currentQuestion) {
      throw new Error('No current question');
    }

    const questionIndex = this.currentQuestion.questionNumber - 1;
    this.userAnswers.set(questionIndex, answer);
    
    return {
      answer,
      questionIndex,
      questionNumber: this.currentQuestion.questionNumber
    };
  }

  // Get user's answer for a question
  getUserAnswer(questionIndex) {
    return this.userAnswers.get(questionIndex);
  }

  // Get all user answers
  getAllAnswers() {
    return Array.from(this.userAnswers.entries()).map(([index, answer]) => ({
      questionIndex: index,
      answer
    }));
  }

  // Calculate score based on correct answers
  calculateScore(correctAnswers) {
    let score = 0;
    correctAnswers.forEach(({ questionIndex, isCorrect, points }) => {
      if (isCorrect) {
        score += points || 10; // Default 10 points per correct answer
      }
    });
    this.score = score;
    return score;
  }

  // Get current score
  getCurrentScore() {
    return this.score;
  }

  // Reset quiz data
  resetQuiz() {
    this.currentQuiz = null;
    this.currentQuestion = null;
    this.userAnswers.clear();
    this.score = 0;
  }

  // Get quiz statistics
  getQuizStats() {
    if (!this.currentQuiz) return null;

    const totalQuestions = this.currentQuiz.questions.length;
    const answeredQuestions = this.userAnswers.size;
    const completionPercentage = (answeredQuestions / totalQuestions) * 100;

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage: Math.round(completionPercentage),
      currentScore: this.score,
      difficulty: this.currentQuiz.difficulty,
      timePerQuestion: this.currentQuiz.timePerQuestion
    };
  }

  // Format time remaining
  formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  }

  // Check if answer is selected
  isAnswerSelected(answer) {
    return this.userAnswers.has(this.currentQuestion?.questionNumber - 1) &&
           this.userAnswers.get(this.currentQuestion.questionNumber - 1) === answer;
  }

  // Get question progress
  getQuestionProgress() {
    if (!this.currentQuestion) return { current: 0, total: 0, percentage: 0 };
    
    const current = this.currentQuestion.questionNumber;
    const total = this.currentQuestion.totalQuestions;
    const percentage = (current / total) * 100;
    
    return { current, total, percentage: Math.round(percentage) };
  }
}

// Export singleton instance
export default new QuizService();
