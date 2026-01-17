// Socket event handlers for quiz application
import roomManager from '../managers/roomManager.js';
import { supabase } from '../supabaseClient.js';

export default function initSocketHandlers(io) {
  io.on('connection', (socket) => {
    // User is already authenticated via socketAuth middleware
    const userId = socket.userId;
    const userEmail = socket.userEmail;
    
    console.log(`User connected: ${socket.id} (User ID: ${userId})`);
    
    // If no userId, disconnect (shouldn't happen due to middleware, but safety check)
    if (!userId) {
      console.error('Socket connected without userId, disconnecting');
      socket.disconnect();
      return;
    }

    // Handle joining a room
    socket.on('join-room', async (data) => {
      const { roomId, username } = data;
      
      try {
        // Get user profile for display name
        let displayName = username;
        if (userId && supabase) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();
          
          if (profile?.username) {
            displayName = profile.username;
          }
        }

        const room = roomManager.getRoom(roomId);
        
        // Check if room exists
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Prevent joining if quiz has started
        if (room.gameState === 'playing') {
          socket.emit('error', { message: 'Cannot join room while quiz is in progress' });
          return;
        }

        // Add user to room using room manager (use userId as identifier)
        const participant = roomManager.addParticipant(roomId, socket.id, displayName, userId);
        
        // Join socket room
        socket.join(roomId);
        
        // Notify room about new user and send updated participants
        socket.to(roomId).emit('user-joined', { 
          username: displayName, 
          participantCount: room.participants.size,
          participants: roomManager.getParticipants(roomId)
        });

        // Send current room state to new user
        socket.emit('room-state', {
          participants: roomManager.getParticipants(roomId),
          leaderboard: roomManager.getLeaderboard(roomId),
          gameState: room.gameState,
          currentQuestion: room.currentQuestion,
          difficulty: room.difficulty,
          topic: room.topic
        });

        console.log(`User ${displayName} (${userId}) joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle quiz answer submission
    socket.on('submit-answer', (data) => {
      const { roomId, answer, questionIndex } = data;
      
      try {
        const room = roomManager.getRoom(roomId);
        
        // Verify user is authenticated
        if (!userId) {
          socket.emit('error', { message: 'Authentication required to submit answers' });
          return;
        }

        // Verify user is in the room
        const participant = room?.participants.get(socket.id);
        if (!participant) {
          socket.emit('error', { message: 'You are not a participant in this room' });
          return;
        }

        const result = roomManager.submitAnswer(roomId, socket.id, answer, questionIndex);
        
        // Notify room about answer submission
        socket.to(roomId).emit('answer-submitted', {
          username: participant.username,
          hasAnswered: true,
          isCorrect: result.isCorrect
        });

        // Update leaderboard
        broadcastLeaderboard(roomId, io);
        
        // Check if all participants have answered
        if (roomManager.allParticipantsAnswered(roomId)) {
          setTimeout(() => {
            nextQuestion(roomId, io);
          }, 2000); // Wait 2 seconds before next question
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle starting quiz
    socket.on('start-quiz', (data) => {
      const { roomId, topic, difficulty } = data;
      
      try {
        const room = roomManager.getRoom(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is the host
        if (room.hostId !== socket.id && room.hostUserId !== userId) {
          socket.emit('error', { message: 'Only the host can start the quiz' });
          return;
        }

        // Start quiz with topic and difficulty
        const result = roomManager.startQuiz(roomId, topic, difficulty);
        
        if (!result) {
          socket.emit('error', { message: 'Failed to start quiz. Invalid topic or difficulty.' });
          return;
        }
        
        // Notify all participants
        io.to(roomId).emit('quiz-started', {
          quiz: result.quiz,
          question: result.question,
          questionNumber: result.questionNumber,
          totalQuestions: result.totalQuestions
        });

        console.log(`Quiz started in room ${roomId} (Topic: ${topic}, Difficulty: ${difficulty})`);
      } catch (error) {
        console.error('Error starting quiz:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle ending quiz (host only)
    socket.on('end-quiz', async (data) => {
      const { roomId } = data;
      
      try {
        const room = roomManager.getRoom(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is the host
        if (room.hostId !== socket.id && room.hostUserId !== userId) {
          socket.emit('error', { message: 'Only the host can end the quiz' });
          return;
        }

        // End the quiz
        room.gameState = 'finished';
        room.finishedAt = new Date();
        const leaderboard = roomManager.getLeaderboard(roomId);
        room.finalLeaderboard = leaderboard;
        
        // Store quiz attempts in database
        await storeQuizAttempts(roomId, room, leaderboard);
        
        // Notify all participants
        io.to(roomId).emit('quiz-ended', {
          leaderboard: leaderboard
        });

        console.log(`Quiz ended in room ${roomId}`);
      } catch (error) {
        console.error('Error ending quiz:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id} (User ID: ${userId})`);
      
      // Remove user from all rooms using room manager
      const allRooms = roomManager.getAllRooms();
      for (const roomInfo of allRooms) {
        const room = roomManager.getRoom(roomInfo.id);
        if (room && room.participants.has(socket.id)) {
          // Check if this was the host
          const wasHost = room.hostId === socket.id || room.hostUserId === userId;
          
          // Handle host disconnect
          if (wasHost) {
            const result = roomManager.handleHostDisconnect(roomInfo.id, socket.id);
            
            if (result?.roomDeleted) {
              // Room was deleted, notify remaining participants
              io.to(roomInfo.id).emit('room-closed', { message: 'Host disconnected. Room closed.' });
              continue;
            } else if (result?.hostTransferred) {
              // Host was transferred
              io.to(roomInfo.id).emit('host-transferred', { 
                newHost: result.newHost,
                message: `Host transferred to ${result.newHost}`
              });
            }
          }
          
          const participant = roomManager.removeParticipant(roomInfo.id, socket.id);
          
          if (participant) {
            // Notify room about user leaving
            socket.to(roomInfo.id).emit('user-left', {
              username: participant.username,
              participantCount: room.participants.size,
              participants: roomManager.getParticipants(roomInfo.id)
            });

            // Update leaderboard if quiz is in progress
            if (room.gameState === 'playing') {
              broadcastLeaderboard(roomInfo.id, io);
            }
          }
        }
      }
    });
  });
}

// Helper function to broadcast leaderboard updates
function broadcastLeaderboard(roomId, io) {
  const leaderboard = roomManager.getLeaderboard(roomId);
  io.to(roomId).emit('update-leaderboard', leaderboard);
}

// Helper function to move to next question
async function nextQuestion(roomId, io) {
  try {
    const result = roomManager.nextQuestion(roomId);
    
    if (result.finished) {
      // Quiz finished - store attempts in database
      const room = roomManager.getRoom(roomId);
      if (room) {
        room.finishedAt = new Date();
        await storeQuizAttempts(roomId, room, result.leaderboard);
      }
      
      // Quiz finished
      io.to(roomId).emit('quiz-finished', {
        leaderboard: result.leaderboard
      });
    } else {
      // Next question
      io.to(roomId).emit('next-question', {
        question: result.question,
        questionNumber: result.questionNumber,
        totalQuestions: result.totalQuestions
      });
    }
  } catch (error) {
    console.error('Error moving to next question:', error);
  }
}

// Helper function to store quiz attempts in database
async function storeQuizAttempts(roomId, room, leaderboard) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping quiz attempt storage');
    return;
  }

  try {
    const participants = Array.from(room.participants.values());
    const attempts = [];

    for (const participant of participants) {
      if (!participant.userId) {
        console.log(`Skipping attempt storage for guest user: ${participant.username}`);
        continue;
      }

      // Find rank from leaderboard
      const leaderboardEntry = leaderboard.find(l => l.userId === participant.userId || l.username === participant.username);
      const rank = leaderboardEntry?.rank || null;

      attempts.push({
        user_id: participant.userId,
        room_id: roomId,
        topic: room.topic,
        score: participant.score,
        total_questions: room.quiz?.questions?.length || 0,
        correct_answers: Math.floor(participant.score / room.settings.pointsPerQuestion), // Approximate
        rank: rank,
        time_taken: participant.timeTaken || 0,
        completed_at: new Date().toISOString()
      });
    }

    if (attempts.length > 0) {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert(attempts);

      if (error) {
        console.error('Error storing quiz attempts:', error);
      } else {
        console.log(`Stored ${attempts.length} quiz attempts for room ${roomId}`);
      }
    }
  } catch (error) {
    console.error('Error in storeQuizAttempts:', error);
    // Don't throw - allow quiz to complete even if DB storage fails
  }
}