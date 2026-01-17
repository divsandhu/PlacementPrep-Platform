// Question Loader - Loads questions from JSON files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for loaded questions
const questionCache = new Map();

/**
 * Load questions from a JSON file
 * @param {string} topic - Topic name (aptitude, dsa, cn, os, dbms)
 * @returns {Object|null} Question data or null if not found
 */
export function loadQuestions(topic) {
  // Check cache first
  if (questionCache.has(topic)) {
    return questionCache.get(topic);
  }

  try {
    const filePath = path.join(__dirname, `${topic}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Question file not found: ${filePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questionData = JSON.parse(fileContent);
    
    // Cache the loaded data
    questionCache.set(topic, questionData);
    
    return questionData;
  } catch (error) {
    console.error(`Error loading questions for topic ${topic}:`, error);
    return null;
  }
}

/**
 * Get questions for a specific topic and difficulty
 * @param {string} topic - Topic name
 * @param {string} difficulty - easy, medium, or hard
 * @param {number} count - Number of questions to return (default: all)
 * @returns {Array} Array of questions
 */
export function getQuestions(topic, difficulty, count = null) {
  const questionData = loadQuestions(topic);
  
  if (!questionData || !questionData.difficulties || !questionData.difficulties[difficulty]) {
    console.error(`No questions found for topic: ${topic}, difficulty: ${difficulty}`);
    return [];
  }

  let questions = questionData.difficulties[difficulty];
  
  // Shuffle questions
  questions = [...questions].sort(() => Math.random() - 0.5);
  
  // Return requested count or all
  if (count && count > 0) {
    return questions.slice(0, Math.min(count, questions.length));
  }
  
  return questions;
}

/**
 * Get quiz configuration for a topic
 * @param {string} topic - Topic name
 * @param {string} difficulty - easy, medium, or hard
 * @returns {Object} Quiz configuration
 */
export function getQuizConfig(topic, difficulty) {
  const questionData = loadQuestions(topic);
  
  if (!questionData) {
    return {
      timePerQuestion: 30,
      pointsPerQuestion: 10,
    };
  }

  return {
    timePerQuestion: questionData.timePerQuestion?.[difficulty] || 30,
    pointsPerQuestion: questionData.pointsPerQuestion?.[difficulty] || 10,
    topic: questionData.topic,
    name: questionData.name,
    description: questionData.description,
  };
}

/**
 * Get all available topics
 * @returns {Array} Array of topic objects
 */
export function getAvailableTopics() {
  const topics = ['aptitude', 'dsa', 'cn', 'os', 'dbms'];
  const availableTopics = [];

  topics.forEach(topic => {
    const data = loadQuestions(topic);
    if (data) {
      availableTopics.push({
        id: topic,
        name: data.name,
        description: data.description,
        available: true,
      });
    }
  });

  return availableTopics;
}

/**
 * Validate if a topic exists
 * @param {string} topic - Topic name
 * @returns {boolean}
 */
export function isValidTopic(topic) {
  const data = loadQuestions(topic);
  return data !== null;
}

/**
 * Get a safe quiz (without correct answers) for a topic and difficulty
 * @param {string} topic - Topic name
 * @param {string} difficulty - easy, medium, or hard
 * @param {number} count - Number of questions
 * @returns {Object} Quiz object
 */
export function getSafeQuiz(topic, difficulty, count = 10) {
  const questions = getQuestions(topic, difficulty, count);
  const config = getQuizConfig(topic, difficulty);
  const questionData = loadQuestions(topic);

  return {
    id: `${topic}-${difficulty}`,
    topic: topic,
    name: questionData?.name || topic,
    description: questionData?.description || '',
    difficulty: difficulty,
    timePerQuestion: config.timePerQuestion,
    pointsPerQuestion: config.pointsPerQuestion,
    questions: questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      timeLimit: config.timePerQuestion,
      // Don't include correctAnswer or explanation in safe quiz
    })),
  };
}

/**
 * Check if an answer is correct
 * @param {string} topic - Topic name
 * @param {string} questionId - Question ID
 * @param {string} answer - User's answer
 * @returns {boolean}
 */
export function checkAnswer(topic, questionId, answer) {
  const questionData = loadQuestions(topic);
  
  if (!questionData) return false;

  // Search through all difficulties
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const questions = questionData.difficulties?.[difficulty] || [];
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      return question.correctAnswer === answer;
    }
  }

  return false;
}

/**
 * Get question explanation
 * @param {string} topic - Topic name
 * @param {string} questionId - Question ID
 * @returns {string}
 */
export function getExplanation(topic, questionId) {
  const questionData = loadQuestions(topic);
  
  if (!questionData) return 'No explanation available';

  // Search through all difficulties
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const questions = questionData.difficulties?.[difficulty] || [];
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      return question.explanation || 'No explanation available';
    }
  }

  return 'No explanation available';
}
