import express from "express";
import roomManager from "../managers/roomManager.js";
import { getAvailableTopics, getSafeQuiz, isValidTopic } from "../data/questionLoader.js";

const router = express.Router();

// Create a new room (requires authentication)
router.post('/', async (req, res) => {
  try {
    const { hostId, hostUserId, topic = 'aptitude', difficulty = 'easy', quizTitle } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: 'Host ID is required' });
    }

    if (!hostUserId) {
      return res.status(401).json({ error: 'Authentication required. Please login to create a room.' });
    }

    // Validate topic
    if (!isValidTopic(topic)) {
      return res.status(400).json({ 
        error: `Invalid topic: ${topic}. Available topics: aptitude, dsa, cn, os, dbms` 
      });
    }

    const result = roomManager.createRoom(hostId, hostUserId, topic, difficulty, quizTitle);
    res.json(result);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/topics', (req, res) => {
  try {
    const topics = getAvailableTopics();
    res.json({ topics });
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Get room information
router.get('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = roomManager.getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(roomManager.getRoomInfo(room));
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room information' });
  }
});



// Get quiz questions for a specific topic and difficulty
router.get('/quizzes/:topic/:difficulty', (req, res) => {
  try {
    const { topic, difficulty } = req.params;
    const { count } = req.query;
    
    if (!isValidTopic(topic)) {
      return res.status(400).json({ 
        error: `Invalid topic: ${topic}. Available topics: aptitude, dsa, cn, os, dbms` 
      });
    }

    const questionCount = count ? parseInt(count) : 10;
    const safeQuiz = getSafeQuiz(topic, difficulty, questionCount);
    
    if (!safeQuiz || !safeQuiz.questions || safeQuiz.questions.length === 0) {
      return res.status(404).json({ error: `No questions found for topic: ${topic}, difficulty: ${difficulty}` });
    }
    
    res.json({ quiz: safeQuiz });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete room (cleanup)
router.delete('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const deleted = roomManager.deleteRoom(roomId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
