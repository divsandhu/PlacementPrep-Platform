// Room Manager - handles all room-related operations
import { getSafeQuiz, checkAnswer, getQuizConfig, isValidTopic } from '../data/questionLoader.js';

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userScores = new Map(); // Store user scores by room
    this.answerTimes = new Map(); // Store answer submission times for tie-breaking
  }

  // Create a new room
  createRoom(hostId, hostUserId, topic = 'aptitude', difficulty = 'easy', quizTitle = null) {
    // Validate topic
    if (!isValidTopic(topic)) {
      throw new Error(`Invalid topic: ${topic}. Available topics: aptitude, dsa, cn, os, dbms`);
    }

    const roomId = this.generateRoomId();
    
    try {
      const config = getQuizConfig(topic, difficulty);
      const quizData = getSafeQuiz(topic, difficulty, 10); // Get 10 questions by default
      
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error(`No questions available for topic: ${topic}, difficulty: ${difficulty}`);
      }
      
      const room = {
        id: roomId,
        hostId, // Socket ID
        hostUserId, // User ID from database
        topic,
        difficulty,
        quizTitle: quizTitle || quizData.name,
        quiz: quizData,
        createdAt: new Date(),
        participants: new Map(),
        gameState: 'waiting', // waiting, playing, finished
        currentQuestion: 0,
        leaderboard: [],
        questionStartTimes: new Map(), // Track when each question started
        settings: {
          timePerQuestion: config.timePerQuestion,
          pointsPerQuestion: config.pointsPerQuestion,
          autoStart: false,
          showExplanations: true
        }
      };

      this.rooms.set(roomId, room);
      console.log(`Room ${roomId} created by ${hostId} (User: ${hostUserId}, Topic: ${topic}, Difficulty: ${difficulty})`);
      
      return {
        roomId,
        room: this.getRoomInfo(room)
      };
    } catch (error) {
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  // Get room by ID
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // Get room information (public data only)
  getRoomInfo(room) {
    if (!room) return null;
    
    return {
      id: room.id,
      topic: room.topic,
      difficulty: room.difficulty,
      quizTitle: room.quizTitle,
      createdAt: room.createdAt,
      gameState: room.gameState,
      participantCount: room.participants.size,
      currentQuestion: room.currentQuestion,
      totalQuestions: room.quiz ? room.quiz.questions.length : 0,
      settings: room.settings
    };
  }

  // Add participant to room
  addParticipant(roomId, socketId, username, userId = null) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.gameState === 'playing') {
      throw new Error('Cannot join room while quiz is in progress');
    }

    const participant = {
      id: socketId,
      userId, // Store user ID for database operations
      username,
      score: 0,
      currentAnswer: null,
      answered: false,
      timeTaken: 0, // Total time taken for all questions
      answerTimes: [], // Time taken for each question
      joinedAt: new Date()
    };

    room.participants.set(socketId, participant);
    
    console.log(`User ${username} (${userId || 'guest'}) joined room ${roomId}`);
    return participant;
  }

  // Remove participant from room
  removeParticipant(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const participant = room.participants.get(socketId);
    if (participant) {
      room.participants.delete(socketId);
      console.log(`User ${participant.username} left room ${roomId}`);
    }

    return participant;
  }

  // Start quiz in room
  startQuiz(roomId, topic = null, difficulty = null) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.participants.size === 0) {
      throw new Error('Cannot start quiz with no participants');
    }

    // If topic/difficulty provided, reload quiz (allows changing before start)
    if (topic && difficulty && isValidTopic(topic)) {
      const quizData = getSafeQuiz(topic, difficulty, 10);
      if (quizData && quizData.questions && quizData.questions.length > 0) {
        room.quiz = quizData;
        room.topic = topic;
        room.difficulty = difficulty;
        const config = getQuizConfig(topic, difficulty);
        room.settings.timePerQuestion = config.timePerQuestion;
        room.settings.pointsPerQuestion = config.pointsPerQuestion;
      }
    }

    room.gameState = 'playing';
    room.currentQuestion = 0;
    const questionStartTime = Date.now();
    room.questionStartTimes.set(0, questionStartTime);

    // Reset all participants
    room.participants.forEach(participant => {
      participant.score = 0;
      participant.answered = false;
      participant.currentAnswer = null;
      participant.timeTaken = 0;
      participant.answerTimes = [];
    });

    console.log(`Quiz started in room ${roomId} (Topic: ${room.topic}, Difficulty: ${room.difficulty})`);
    return {
      quiz: room.quiz,
      question: room.quiz.questions[0],
      questionNumber: 1,
      totalQuestions: room.quiz.questions.length
    };
  }

  // Submit answer for a participant
  submitAnswer(roomId, socketId, answer, questionIndex) {
    const room = this.getRoom(roomId);
    if (!room || room.gameState !== 'playing') {
      throw new Error('Room not found or quiz not active');
    }

    const participant = room.participants.get(socketId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (participant.answered) {
      throw new Error('Answer already submitted');
    }

    const question = room.quiz.questions[questionIndex];
    if (!question) {
      throw new Error('Question not found');
    }

    // Calculate time taken for this question
    const questionStartTime = room.questionStartTimes.get(questionIndex) || Date.now();
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000); // in seconds
    participant.answerTimes.push(timeTaken);
    participant.timeTaken += timeTaken;

    // Check answer using topic and question ID
    const isCorrect = checkAnswer(room.topic, question.id, answer);
    
    if (isCorrect) {
      participant.score += room.settings.pointsPerQuestion;
    }

    participant.currentAnswer = answer;
    participant.answered = true;

    console.log(`Answer submitted by ${participant.username}: ${isCorrect ? 'Correct' : 'Incorrect'} (Time: ${timeTaken}s)`);
    
    return {
      isCorrect,
      score: participant.score,
      timeTaken,
      totalTimeTaken: participant.timeTaken
    };
  }

  // Check if all participants have answered
  allParticipantsAnswered(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    return Array.from(room.participants.values()).every(p => p.answered);
  }

  // Move to next question
  nextQuestion(roomId) {
    const room = this.getRoom(roomId);
    if (!room || !room.quiz) {
      throw new Error('Room or quiz not found');
    }

    room.currentQuestion++;
    
    if (room.currentQuestion >= room.quiz.questions.length) {
      // Quiz finished
      room.gameState = 'finished';
      const leaderboard = this.getLeaderboard(roomId);
      
      // Store final leaderboard with time_taken for tie-breaking
      room.finalLeaderboard = leaderboard;
      
      return {
        finished: true,
        leaderboard: leaderboard
      };
    } else {
      // Next question - record start time
      const questionStartTime = Date.now();
      room.questionStartTimes.set(room.currentQuestion, questionStartTime);
      
      // Reset participants for next question
      room.participants.forEach(participant => {
        participant.answered = false;
        participant.currentAnswer = null;
      });

      return {
        finished: false,
        question: room.quiz.questions[room.currentQuestion],
        questionNumber: room.currentQuestion + 1,
        totalQuestions: room.quiz.questions.length
      };
    }
  }

  // Get leaderboard for room (with tie-breaking using time_taken)
  getLeaderboard(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];

    const participants = Array.from(room.participants.values());
    
    // Sort by score (descending), then by time_taken (ascending - faster is better)
    const sorted = participants.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.timeTaken - b.timeTaken; // Lower time first (tie-breaker)
    });
    
    return sorted.map((participant, index) => ({
      rank: index + 1,
      username: participant.username,
      userId: participant.userId,
      score: participant.score,
      timeTaken: participant.timeTaken,
      socketId: participant.id
    }));
  }

  // Get participants list
  getParticipants(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return [];

    return Array.from(room.participants.values());
  }

  // Delete room
  deleteRoom(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted`);
      return true;
    }
    return false;
  }

  // Generate unique room ID
  generateRoomId() {
    let roomId;
    do {
      roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(roomId));
    
    return roomId;
  }

  // Get all rooms (for admin purposes)
  getAllRooms() {
    const rooms = [];
    this.rooms.forEach((room, roomId) => {
      rooms.push(this.getRoomInfo(room));
    });
    return rooms;
  }

  // Clean up empty rooms (call periodically)
  cleanupEmptyRooms() {
    const emptyRooms = [];
    this.rooms.forEach((room, roomId) => {
      if (room.participants.size === 0) {
        emptyRooms.push(roomId);
      }
    });

    emptyRooms.forEach(roomId => {
      this.deleteRoom(roomId);
    });

    console.log(`Cleaned up ${emptyRooms.length} empty rooms`);
    return emptyRooms.length;
  }

  // Clean up rooms that have been finished for more than 1 hour
  cleanupFinishedRooms() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const finishedRooms = [];

    this.rooms.forEach((room, roomId) => {
      if (room.gameState === 'finished') {
        const finishedTime = room.finishedAt || room.createdAt;
        if (now - finishedTime.getTime() > oneHour) {
          finishedRooms.push(roomId);
        }
      }
    });

    finishedRooms.forEach(roomId => {
      this.deleteRoom(roomId);
    });

    if (finishedRooms.length > 0) {
      console.log(`Cleaned up ${finishedRooms.length} finished rooms`);
    }
    return finishedRooms.length;
  }

  // Handle host disconnect - transfer host or end room
  handleHostDisconnect(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    // Check if disconnected user was the host
    if (room.hostId === socketId) {
      const participants = Array.from(room.participants.values());
      
      if (participants.length > 0) {
        // Transfer host to first participant
        const newHost = participants[0];
        room.hostId = newHost.id;
        room.hostUserId = newHost.userId;
        console.log(`Host transferred in room ${roomId} to ${newHost.username}`);
        return { hostTransferred: true, newHost: newHost.username };
      } else {
        // No participants left, delete room
        this.deleteRoom(roomId);
        console.log(`Room ${roomId} deleted due to host disconnect`);
        return { roomDeleted: true };
      }
    }

    return null;
  }

  // Get room data for quiz attempt storage
  getRoomDataForAttempt(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    return {
      roomId: room.id,
      topic: room.topic,
      difficulty: room.difficulty,
      participants: Array.from(room.participants.values()).map(p => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        timeTaken: p.timeTaken,
        correctAnswers: p.answerTimes.length // Approximate
      })),
      leaderboard: room.finalLeaderboard || this.getLeaderboard(roomId),
      totalQuestions: room.quiz?.questions?.length || 0
    };
  }
}

// Export singleton instance
export default new RoomManager();
