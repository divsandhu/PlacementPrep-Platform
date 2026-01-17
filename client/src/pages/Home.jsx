import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import quizService from "../services/quizService.js";

export default function Home() {
    const { user, profile } = useAuth();
    const [username, setUsername] = useState(profile?.username || user?.email?.split('@')[0] || "");
    const [roomId, setRoomId] = useState("");
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [topic, setTopic] = useState("aptitude");
    const [difficulty, setDifficulty] = useState("easy");
    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Load available topics on mount
    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        try {
            const availableTopics = await quizService.getAvailableTopics();
            setTopics(availableTopics);
        } catch (error) {
            console.error('Error loading topics:', error);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        
        // Require authentication
        if (!user) {
            setError("Please login to create a room");
            navigate('/auth');
            return;
        }

        const displayName = username.trim() || profile?.username || user?.email?.split('@')[0] || 'Guest';
        
        if (!displayName) {
            setError("Please enter your username");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Generate a temporary hostId (will be replaced by socket.id when connected)
            const tempHostId = `temp-${Date.now()}`;
            const result = await quizService.createRoom(tempHostId, user.id, topic, difficulty);
            const { roomId: newRoomId } = result;
            navigate(`/room/${newRoomId}`, { 
                state: { 
                    user: displayName, 
                    isHost: true,
                    topic: topic,
                    difficulty: difficulty
                } 
            });
        } catch (error) {
            console.error("Error creating room:", error);
            setError(error.message || "Failed to create room. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        const displayName = username.trim() || profile?.username || user?.email?.split('@')[0] || 'Guest';
        
        if (!displayName || !roomId.trim()) {
            setError("Please enter both username and room ID");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Check if room exists
            await quizService.joinRoom(roomId);
            
            navigate(`/room/${roomId}`, { 
                state: { 
                    user: displayName, 
                    isHost: false 
                } 
            });
        } catch (error) {
            console.error("Error joining room:", error);
            setError(error.message || "Failed to join room. Please check the room ID and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                                Master aptitude skills through
                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">real-time competition</span>
                            </h1>
                            <p className="mt-4 text-lg text-gray-600">Test your logical reasoning, quantitative aptitude, and analytical skills in live quiz rooms. Perfect for interview prep, academic assessment, and skill development.</p>
                            <div className="mt-8 flex items-center gap-4">
                                <a href="#get-started" className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Get Started</a>
                                <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-gray-900">Learn more →</a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl border border-gray-200 shadow-xl bg-white p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Live Room</p>
                                        <p className="text-lg font-semibold text-gray-900">AptitudeArena</p>
                                    </div>
                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Online</span>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 rounded-lg bg-gray-50">
                                        <p className="text-gray-500">Participants</p>
                                        <p className="text-2xl font-bold">8</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-gray-50">
                                        <p className="text-gray-500">Questions</p>
                                        <p className="text-2xl font-bold">10</p>
                                    </div>
                                </div>
                                <div className="mt-6 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 w-1/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "Logical Reasoning", desc: "Test deductive and inductive reasoning skills with pattern recognition.", icon: "🧠" },
                            { title: "Quantitative Aptitude", desc: "Master math problems, percentages, ratios, and data interpretation.", icon: "📊" },
                            { title: "Analytical Thinking", desc: "Solve complex problems with structured thinking and analysis.", icon: "🔍" },
                        ].map((f) => (
                            <div key={f.title} className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                                <div className="text-3xl">{f.icon}</div>
                                <h3 className="mt-3 text-lg font-semibold text-gray-900">{f.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Create / Join Card */}
            <section id="get-started" className="py-8">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Start your aptitude test</h2>
                            <p className="text-gray-600">Choose your difficulty level and begin competing</p>
                        </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={isCreatingRoom ? handleCreateRoom : handleJoinRoom}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your username"
                                required
                            />
                        </div>

                        {isCreatingRoom && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Topic
                                    </label>
                                    <select
                                        id="topic"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {topics.length > 0 ? (
                                            topics.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="aptitude">Aptitude</option>
                                                <option value="dsa">Data Structures & Algorithms</option>
                                                <option value="cn">Computer Networks</option>
                                                <option value="os">Operating Systems</option>
                                                <option value="dbms">Database Management</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty Level
                                    </label>
                                    <select
                                        id="difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {!isCreatingRoom && (
                            <div className="mb-4">
                                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room ID
                                </label>
                                <input
                                    type="text"
                                    id="roomId"
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter room ID"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            {isLoading ? "Loading..." : (isCreatingRoom ? "Create Room" : "Join Room")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsCreatingRoom(!isCreatingRoom);
                                setError("");
                                setRoomId("");
                            }}
                            className="text-blue-500 hover:text-blue-600 font-medium"
                        >
                            {isCreatingRoom ? "Join existing room instead" : "Create new room instead"}
                        </button>
                    </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
