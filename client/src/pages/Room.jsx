import { useEffect, useState } from "react";
import { socket } from "../socket";
import quizService from "../services/quizService.js";

export default function Room({ roomId, user, isHost = false }) {
    const [participants, setParticipants] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameState, setGameState] = useState('waiting'); // waiting, playing, finished
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizData, setQuizData] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [roomDifficulty, setRoomDifficulty] = useState('easy'); // Store room difficulty
    const [roomTopic, setRoomTopic] = useState('aptitude'); // Store room topic

    useEffect(() => {
        console.log('Room component mounted with:', { roomId, user, isHost });
        
        // Connect socket with authentication
        socket.connect();
        
        // Wait for socket to connect, then join room
        socket.on('connect', () => {
            socket.emit("join-room", { roomId, username: user });
        });

        const onUserJoined = (data) => {
            console.log("User joined:", data);
            // Update participants list directly
            if (data.participants && Array.isArray(data.participants)) {
                console.log("Updating participants with:", data.participants);
                setParticipants(data.participants);
            } else {
                // Fallback: fetch fresh room state if participants not provided
                console.log("Participants not provided, fetching room state");
                socket.emit("get-room-state", { roomId });
            }
        };

        const onUserLeft = (data) => {
            console.log("User left:", data);
            // Update participants list directly
            if (data.participants && Array.isArray(data.participants)) {
                console.log("Updating participants with:", data.participants);
                setParticipants(data.participants);
            } else {
                // Fallback: fetch fresh room state if participants not provided
                console.log("Participants not provided, fetching room state");
                socket.emit("get-room-state", { roomId });
            }
        };

        const onUpdateLeaderboard = (leaderboard) => {
            setLeaderboard(leaderboard);
        };

        const onRoomState = (state) => {
            console.log('Room state received:', state);
            const participantsArray = Array.isArray(state.participants) ? state.participants : [];
            setParticipants(participantsArray);
            setLeaderboard(state.leaderboard || []);
            setGameState(state.gameState || 'waiting');
            setCurrentQuestion(state.currentQuestion || 0);
            if (state.difficulty) {
                setRoomDifficulty(state.difficulty);
            }
            if (state.topic) {
                setRoomTopic(state.topic);
            }
        };

        const onQuizStarted = (data) => {
            setQuizData(data.quiz);
            setCurrentQuestion(data.question);
            setGameState('playing');
            setQuestionNumber(data.questionNumber);
            setTotalQuestions(data.totalQuestions);
            setTimeLeft(data.question.timeLimit || 30);
            setHasAnswered(false);
            setSelectedAnswer(null);
            setShowResults(false);
            
            // Set quiz data in quiz service
            quizService.setCurrentQuiz(data.quiz);
            quizService.setCurrentQuestion(data.question, data.questionNumber);
        };

        const onNextQuestion = (data) => {
            setCurrentQuestion(data.question);
            setQuestionNumber(data.questionNumber);
            setTimeLeft(data.question.timeLimit || 30);
            setHasAnswered(false);
            setSelectedAnswer(null);
            setShowResults(false);
            
            // Update quiz service with new question
            quizService.setCurrentQuestion(data.question, data.questionNumber);
        };

        const onQuizFinished = (data) => {
            console.log('Quiz finished with data:', data);
            setGameState('finished');
            setShowResults(true);
            setLeaderboard(data.leaderboard);
        };

        const onQuizEnded = (data) => {
            console.log('Quiz ended by host:', data);
            setGameState('finished');
            setShowResults(true);
            setLeaderboard(data.leaderboard);
        };

        const onAnswerSubmitted = (data) => {
            console.log("Answer submitted by:", data.username);
        };

        const onError = (data) => {
            console.error("Socket error:", data.message);
            alert(`Error: ${data.message}`);
        };

        const onRoomClosed = (data) => {
            alert(data.message || 'Room has been closed');
            window.location.href = '/home';
        };

        const onHostTransferred = (data) => {
            alert(data.message || 'Host has been transferred');
        };

        // Socket event listeners
        socket.on("user-joined", onUserJoined);
        socket.on("user-left", onUserLeft);
        socket.on("update-leaderboard", onUpdateLeaderboard);
        socket.on("room-state", onRoomState);
        socket.on("quiz-started", onQuizStarted);
        socket.on("next-question", onNextQuestion);
        socket.on("quiz-finished", onQuizFinished);
        socket.on("quiz-ended", onQuizEnded);
        socket.on("answer-submitted", onAnswerSubmitted);
        socket.on("error", onError);
        socket.on("room-closed", onRoomClosed);
        socket.on("host-transferred", onHostTransferred);

        // Fetch initial room info
        fetchRoomInfo();

        return () => {
            socket.off("user-joined", onUserJoined);
            socket.off("user-left", onUserLeft);
            socket.off("update-leaderboard", onUpdateLeaderboard);
            socket.off("room-state", onRoomState);
            socket.off("quiz-started", onQuizStarted);
            socket.off("next-question", onNextQuestion);
            socket.off("quiz-finished", onQuizFinished);
            socket.off("quiz-ended", onQuizEnded);
            socket.off("answer-submitted", onAnswerSubmitted);
            socket.off("error", onError);
            socket.off("room-closed", onRoomClosed);
            socket.off("host-transferred", onHostTransferred);
            socket.disconnect();
        };
    }, [roomId, user]);

    // Timer effect
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !hasAnswered && gameState === 'playing') {
            // Auto-submit if time runs out
            handleSubmitAnswer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, gameState, hasAnswered]);

    const fetchRoomInfo = async () => {
        try {
            await quizService.joinRoom(roomId);
            // Room info is handled by socket events
        } catch (error) {
            console.error("Error fetching room info:", error);
        }
    };

    const handleStartQuiz = async () => {
        try {
            // Use room topic and difficulty from state
            const topic = roomTopic || 'aptitude';
            const difficulty = roomDifficulty || 'easy';
            
            console.log('Starting quiz with:', { roomId, topic, difficulty });
            
            // Emit start-quiz with topic and difficulty (server will load questions)
            socket.emit("start-quiz", {
                roomId,
                topic: topic,
                difficulty: difficulty
            });
        } catch (error) {
            console.error("Error starting quiz:", error);
            // Show error to user
            alert(`Failed to start quiz: ${error.message || 'Unknown error'}`);
        }
    };

    const handleSubmitAnswer = () => {
        if (hasAnswered || !selectedAnswer) return;

        const answerData = quizService.submitAnswer(selectedAnswer);
        socket.emit("submit-answer", {
            roomId,
            answer: answerData.answer,
            questionIndex: answerData.questionIndex
        });

        setHasAnswered(true);
        setShowResults(true);
    };

    const handleAnswerSelect = (answer) => {
        if (hasAnswered) return;
        setSelectedAnswer(answer);
    };

const handleEndQuiz = () => {
socket.emit("end-quiz", { roomId });
};

return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
<div className="max-w-6xl mx-auto">
{/* Header */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
<div className="flex justify-between items-center">
<div>
<h1 className="text-3xl font-bold text-gray-800 dark:text-white">Room {roomId}</h1>
<p className="text-gray-600 dark:text-gray-300">Welcome, {user}!</p>
</div>
<div className="text-right">
<div className="text-sm text-gray-500 dark:text-gray-400">Participants</div>
<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{participants.length}</div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Main Content */}
<div className="lg:col-span-2">
{gameState === 'waiting' && (
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
<h2 className="text-2xl font-bold mb-4">Waiting for Quiz to Start</h2>
<p className="text-gray-600 dark:text-gray-300 mb-4">
{isHost ? "You are the host. Start the quiz when everyone is ready!" : "Waiting for the host to start the quiz..."}
</p>
{isHost && (
<button
onClick={handleStartQuiz}
className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
>
Start Quiz
</button>
)}
</div>
)}

                        {gameState === 'playing' && currentQuestion && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Question {questionNumber} of {totalQuestions}</h2>
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{timeLeft}s</div>
                                </div>
                                
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{currentQuestion.question}</h3>
                                    <div className="space-y-2">
                                        {currentQuestion.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswerSelect(option)}
                                                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                                                    selectedAnswer === option
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                                } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'} text-gray-800 dark:text-white`}
                                                disabled={hasAnswered}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {!hasAnswered && (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={!selectedAnswer}
                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:bg-green-600 dark:hover:bg-green-700 dark:disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Submit Answer
                                    </button>
                                )}

                                {showResults && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Answer submitted! Waiting for other participants...
                                        </p>
                                    </div>
                                )}

                                {/* End Quiz Button for Host */}
                                {isHost && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={handleEndQuiz}
                                            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                                        >
                                            End Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {gameState === 'finished' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Quiz Finished!</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Final Results:</p>
                                
                                {/* Final Leaderboard */}
                                <div className="space-y-3">
                                    {leaderboard.map((entry, index) => (
                                        <div key={index} className={`flex justify-between items-center p-4 rounded-lg ${
                                            index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-600' :
                                            index === 1 ? 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600' :
                                            index === 2 ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-600' :
                                            'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                        }`}>
                                            <div className="flex items-center">
                                                <span className={`text-lg font-bold mr-3 ${
                                                    index === 0 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    index === 1 ? 'text-gray-600 dark:text-gray-400' :
                                                    index === 2 ? 'text-orange-600 dark:text-orange-400' :
                                                    'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="font-medium text-gray-800 dark:text-white">{entry.username}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400">{entry.score} pts</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{entry.correctAnswers}/{entry.totalQuestions} correct</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Play Again Button for Host */}
                                {isHost && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => {
                                                // Reset quiz state
                                                setGameState('waiting');
                                                setCurrentQuestion(null);
                                                setQuestionNumber(0);
                                                setTotalQuestions(0);
                                                setSelectedAnswer(null);
                                                setTimeLeft(0);
                                                setHasAnswered(false);
                                                setShowResults(false);
                                                quizService.resetQuiz();
                                                
                                                // Reset all participants
                                                participants.forEach(participant => {
                                                    participant.score = 0;
                                                    participant.answered = false;
                                                    participant.currentAnswer = null;
                                                });
                                                
                                                console.log('Quiz reset for new game');
                                            }}
                                            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
                                        >
                                            Play Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Participants */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Participants ({participants.length})</h3>
                            <div className="space-y-2">
                                {participants.map((participant, index) => (
                                    <div key={participant.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <span className="font-medium text-gray-800 dark:text-white">{participant.username}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{participant.score} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Leaderboard</h3>
                            <div className="space-y-2">
                                {leaderboard.map((entry, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold mr-2 text-gray-600 dark:text-gray-400">#{entry.rank}</span>
                                            <span className="font-medium text-gray-800 dark:text-white">{entry.username}</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{entry.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}