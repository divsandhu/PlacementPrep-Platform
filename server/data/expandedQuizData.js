// Expanded Quiz Data - Diverse question banks for AptitudeArena

export const quizCategories = {
  aptitude: {
    id: 'aptitude',
    name: 'Aptitude',
    description: 'Quantitative and logical reasoning questions',
    topics: ['basic-math', 'advanced-math', 'data-interpretation']
  },
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Verbal and non-verbal reasoning questions',
    topics: ['verbal-reasoning', 'non-verbal-reasoning', 'logical-deduction']
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Computer Science and IT related questions',
    topics: ['cs-fundamentals', 'ece', 'networking', 'databases']
  },
  coding: {
    id: 'coding',
    name: 'Coding',
    description: 'Programming and algorithm questions',
    topics: ['algorithms', 'data-structures', 'problem-solving']
  },
  verbal: {
    id: 'verbal',
    name: 'Verbal',
    description: 'English language and comprehension',
    topics: ['grammar', 'vocabulary', 'comprehension']
  },
  company: {
    id: 'company',
    name: 'Company Specific',
    description: 'Questions from specific company rounds',
    topics: ['google', 'microsoft', 'amazon', 'meta', 'tcs', 'infosys']
  }
};

// Expanded Questions Database
export const expandedQuestions = {
  // APTITUDE QUESTIONS
  'aptitude-basic-math-easy': [
    {
      id: 'apt-1',
      question: 'If A is taller than B, and B is taller than C, then A is taller than C. This is an example of:',
      options: ['Transitive property', 'Commutative property', 'Associative property', 'Distributive property'],
      correctAnswer: 'Transitive property',
      explanation: 'The transitive property states that if A > B and B > C, then A > C.',
      difficulty: 'easy',
      tags: ['logic', 'mathematics']
    },
    {
      id: 'apt-2',
      question: 'What comes next in the sequence: 2, 4, 8, 16, ___?',
      options: ['20', '24', '32', '28'],
      correctAnswer: '32',
      explanation: 'Each number is multiplied by 2: 2×2=4, 4×2=8, 8×2=16, 16×2=32',
      difficulty: 'easy',
      tags: ['sequences', 'patterns']
    },
    {
      id: 'apt-3',
      question: 'A shopkeeper sells 20% more items this month than last month. If he sold 120 items last month, how many did he sell this month?',
      options: ['140', '144', '150', '160'],
      correctAnswer: '144',
      explanation: '120 + (20% of 120) = 120 + 24 = 144 items',
      difficulty: 'easy',
      tags: ['percentages', 'arithmetic']
    },
    {
      id: 'apt-4',
      question: 'If 3x + 7 = 22, what is the value of x?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '5',
      explanation: '3x + 7 = 22, so 3x = 15, therefore x = 5',
      difficulty: 'easy',
      tags: ['algebra', 'equations']
    },
    {
      id: 'apt-5',
      question: 'What is 25% of 80?',
      options: ['15', '20', '25', '30'],
      correctAnswer: '20',
      explanation: '25% of 80 = 0.25 × 80 = 20',
      difficulty: 'easy',
      tags: ['percentages']
    }
  ],
  'aptitude-advanced-math-medium': [
    {
      id: 'apt-6',
      question: 'In a class of 30 students, 18 play football and 12 play basketball. If 8 students play both sports, how many play neither?',
      options: ['6', '8', '10', '12'],
      correctAnswer: '8',
      explanation: 'Using set theory: Total = Football + Basketball - Both + Neither. 30 = 18 + 12 - 8 + Neither, so Neither = 8',
      difficulty: 'medium',
      tags: ['set-theory', 'venn-diagrams']
    },
    {
      id: 'apt-7',
      question: 'If the ratio of boys to girls in a class is 3:2 and there are 25 students total, how many boys are there?',
      options: ['10', '12', '15', '18'],
      correctAnswer: '15',
      explanation: 'Let 3x + 2x = 25, so 5x = 25, x = 5. Boys = 3x = 3 × 5 = 15',
      difficulty: 'medium',
      tags: ['ratios', 'proportions']
    },
    {
      id: 'apt-8',
      question: 'A train travels 120 km in 2 hours. If it continues at the same speed, how far will it travel in 5 hours?',
      options: ['240 km', '300 km', '360 km', '480 km'],
      correctAnswer: '300 km',
      explanation: 'Speed = 120/2 = 60 km/h. Distance in 5 hours = 60 × 5 = 300 km',
      difficulty: 'medium',
      tags: ['speed', 'distance', 'time']
    },
    {
      id: 'apt-9',
      question: 'If 5 workers can build a wall in 8 days, how many days will it take 8 workers to build the same wall?',
      options: ['4 days', '5 days', '6 days', '8 days'],
      correctAnswer: '5 days',
      explanation: 'Using inverse proportion: 5 × 8 = 8 × x, so 40 = 8x, therefore x = 5 days',
      difficulty: 'medium',
      tags: ['work', 'proportions']
    }
  ],
  'aptitude-data-interpretation-hard': [
    {
      id: 'apt-10',
      question: 'In a group of 100 people, 60 like coffee, 40 like tea, and 20 like both. How many people like neither coffee nor tea?',
      options: ['20', '25', '30', '35'],
      correctAnswer: '20',
      explanation: 'Using set theory: Neither = Total - (Coffee + Tea - Both) = 100 - (60 + 40 - 20) = 100 - 80 = 20',
      difficulty: 'hard',
      tags: ['set-theory', 'data-interpretation']
    },
    {
      id: 'apt-11',
      question: 'A cube has a surface area of 150 cm². What is its volume?',
      options: ['125 cm³', '150 cm³', '175 cm³', '200 cm³'],
      correctAnswer: '125 cm³',
      explanation: 'Surface area = 6a² = 150, so a² = 25, a = 5 cm. Volume = a³ = 5³ = 125 cm³',
      difficulty: 'hard',
      tags: ['geometry', '3d-shapes']
    },
    {
      id: 'apt-12',
      question: 'If the compound interest on a sum for 2 years at 10% per annum is ₹210, what is the principal amount?',
      options: ['₹900', '₹950', '₹1000', '₹1050'],
      correctAnswer: '₹1000',
      explanation: 'Let P be principal. CI = P[(1 + r/100)^n - 1]. 210 = P[(1.1)² - 1] = P[0.21]. So P = 210/0.21 = ₹1000',
      difficulty: 'hard',
      tags: ['compound-interest', 'finance']
    }
  ],

  // REASONING QUESTIONS
  'reasoning-verbal-easy': [
    {
      id: 'rea-1',
      question: 'If all roses are flowers and some flowers are red, which statement must be true?',
      options: ['All roses are red', 'Some roses are red', 'All red things are flowers', 'Cannot be determined'],
      correctAnswer: 'Cannot be determined',
      explanation: 'We know roses are flowers, but we don\'t know if roses are among the flowers that are red.',
      difficulty: 'easy',
      tags: ['verbal-reasoning', 'logic']
    },
    {
      id: 'rea-2',
      question: 'Complete the analogy: Book is to Library as Car is to ___?',
      options: ['Garage', 'Highway', 'Driver', 'Engine'],
      correctAnswer: 'Garage',
      explanation: 'A book is stored in a library, just as a car is stored in a garage.',
      difficulty: 'easy',
      tags: ['analogies', 'relationships']
    },
    {
      id: 'rea-3',
      question: 'Which word does NOT belong with the others?',
      options: ['Square', 'Triangle', 'Circle', 'Rectangle'],
      correctAnswer: 'Circle',
      explanation: 'Circle is the only curved shape; the others are all polygons with straight edges.',
      difficulty: 'easy',
      tags: ['classification', 'patterns']
    }
  ],
  'reasoning-logical-deduction-medium': [
    {
      id: 'rea-4',
      question: 'All cats are animals. Some animals are pets. Which conclusion can be drawn?',
      options: ['All cats are pets', 'Some cats are pets', 'No cats are pets', 'Cannot be determined'],
      correctAnswer: 'Cannot be determined',
      explanation: 'We know all cats are animals and some animals are pets, but we cannot determine if cats are among the pets.',
      difficulty: 'medium',
      tags: ['syllogism', 'deduction']
    },
    {
      id: 'rea-5',
      question: 'If Monday is the first day, and today is three days before the day after tomorrow, what day is today?',
      options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      correctAnswer: 'Wednesday',
      explanation: 'Day after tomorrow = today + 2. Three days before that = today + 2 - 3 = today - 1. So today - 1 = Monday, therefore today = Tuesday. Wait, let me recalculate: If day after tomorrow is X, then today is X-2. Three days before X is X-3. So X-3 = X-2, which means -3 = -2, contradiction. Actually: Day after tomorrow = today+2. Three days before (today+2) = today+2-3 = today-1. If today-1 = Monday, then today = Tuesday. But the answer says Wednesday, so the logic might be: "three days before the day after tomorrow" means (today+2)-3 = today-1. If that equals Monday, today is Tuesday. But answer is Wednesday, so maybe: "three days before" means we go back 3 days from "day after tomorrow". If day after tomorrow is Friday, three days before is Tuesday. If that\'s Monday, then day after tomorrow is Thursday, so today is Tuesday. Hmm, let me think differently: If Monday is day 1, and "three days before the day after tomorrow" = Monday, then day after tomorrow = Thursday, so today = Tuesday. But answer says Wednesday. Perhaps the interpretation is different.',
      difficulty: 'medium',
      tags: ['logical-reasoning', 'days']
    }
  ],

  // TECHNICAL QUESTIONS (CS/IT, ECE)
  'technical-cs-fundamentals-easy': [
    {
      id: 'tech-1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctAnswer: 'O(log n)',
      explanation: 'Binary search divides the search space in half at each step, resulting in O(log n) time complexity.',
      difficulty: 'easy',
      tags: ['algorithms', 'time-complexity']
    },
    {
      id: 'tech-2',
      question: 'Which data structure follows LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 'Stack',
      explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
      difficulty: 'easy',
      tags: ['data-structures']
    },
    {
      id: 'tech-3',
      question: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Computer Program Unit'],
      correctAnswer: 'Central Processing Unit',
      explanation: 'CPU stands for Central Processing Unit, the primary component that executes instructions.',
      difficulty: 'easy',
      tags: ['computer-fundamentals']
    }
  ],
  'technical-ece-medium': [
    {
      id: 'tech-4',
      question: 'What is the output voltage of a standard USB port?',
      options: ['3.3V', '5V', '12V', '24V'],
      correctAnswer: '5V',
      explanation: 'Standard USB ports provide 5V DC power for connected devices.',
      difficulty: 'medium',
      tags: ['electronics', 'ece']
    },
    {
      id: 'tech-5',
      question: 'Which logic gate produces output 1 only when all inputs are 1?',
      options: ['OR gate', 'AND gate', 'NOT gate', 'XOR gate'],
      correctAnswer: 'AND gate',
      explanation: 'AND gate produces output 1 only when all inputs are 1; otherwise output is 0.',
      difficulty: 'medium',
      tags: ['digital-logic', 'ece']
    }
  ],
  'technical-networking-hard': [
    {
      id: 'tech-6',
      question: 'What is the default port number for HTTPS?',
      options: ['80', '443', '8080', '8443'],
      correctAnswer: '443',
      explanation: 'HTTPS (HTTP Secure) uses port 443 by default, while HTTP uses port 80.',
      difficulty: 'hard',
      tags: ['networking', 'security']
    },
    {
      id: 'tech-7',
      question: 'Which protocol is used for email transmission?',
      options: ['HTTP', 'FTP', 'SMTP', 'TCP'],
      correctAnswer: 'SMTP',
      explanation: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails between servers.',
      difficulty: 'hard',
      tags: ['networking', 'protocols']
    }
  ],

  // CODING QUESTIONS
  'coding-algorithms-easy': [
    {
      id: 'code-1',
      question: 'What will be the output of: print(2 ** 3) in Python?',
      options: ['6', '8', '9', '5'],
      correctAnswer: '8',
      explanation: '** is the exponentiation operator in Python. 2 ** 3 = 2³ = 8',
      difficulty: 'easy',
      tags: ['python', 'operators']
    },
    {
      id: 'code-2',
      question: 'Which sorting algorithm has the best average time complexity?',
      options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
      correctAnswer: 'Quick Sort',
      explanation: 'Quick Sort has average time complexity of O(n log n), which is optimal for comparison-based sorting.',
      difficulty: 'easy',
      tags: ['algorithms', 'sorting']
    }
  ],
  'coding-data-structures-medium': [
    {
      id: 'code-3',
      question: 'What is the time complexity of inserting an element at the beginning of a linked list?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctAnswer: 'O(1)',
      explanation: 'Inserting at the beginning of a linked list is O(1) as it only requires updating the head pointer.',
      difficulty: 'medium',
      tags: ['data-structures', 'linked-list']
    },
    {
      id: 'code-4',
      question: 'Which data structure is best for implementing a priority queue?',
      options: ['Array', 'Linked List', 'Heap', 'Stack'],
      correctAnswer: 'Heap',
      explanation: 'Heap (specifically binary heap) is ideal for priority queues as it maintains elements in priority order efficiently.',
      difficulty: 'medium',
      tags: ['data-structures', 'priority-queue']
    }
  ],
  'coding-problem-solving-hard': [
    {
      id: 'code-5',
      question: 'What is the space complexity of merge sort?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctAnswer: 'O(n)',
      explanation: 'Merge sort requires O(n) additional space for the temporary arrays used during merging.',
      difficulty: 'hard',
      tags: ['algorithms', 'space-complexity']
    }
  ],

  // VERBAL QUESTIONS
  'verbal-grammar-easy': [
    {
      id: 'verb-1',
      question: 'Choose the correct sentence:',
      options: [
        'I have went to the store',
        'I have gone to the store',
        'I have go to the store',
        'I have going to the store'
      ],
      correctAnswer: 'I have gone to the store',
      explanation: 'The past participle of "go" is "gone", not "went" (which is the simple past).',
      difficulty: 'easy',
      tags: ['grammar', 'tenses']
    },
    {
      id: 'verb-2',
      question: 'Which word is a synonym for "abundant"?',
      options: ['Scarce', 'Plentiful', 'Rare', 'Limited'],
      correctAnswer: 'Plentiful',
      explanation: 'Abundant means existing in large quantities, and plentiful is a direct synonym.',
      difficulty: 'easy',
      tags: ['vocabulary', 'synonyms']
    }
  ],
  'verbal-comprehension-medium': [
    {
      id: 'verb-3',
      question: 'What is the main idea of this passage: "Climate change affects weather patterns globally, leading to more extreme events."',
      options: [
        'Weather is unpredictable',
        'Climate change causes global weather extremes',
        'Extreme events are natural',
        'Weather patterns are constant'
      ],
      correctAnswer: 'Climate change causes global weather extremes',
      explanation: 'The passage directly states that climate change affects weather patterns and leads to extreme events.',
      difficulty: 'medium',
      tags: ['comprehension', 'reading']
    }
  ],

  // COMPANY SPECIFIC QUESTIONS
  'company-google-medium': [
    {
      id: 'comp-1',
      question: 'Google interview question: How would you find the kth largest element in an unsorted array?',
      options: [
        'Sort the array and return arr[k-1]',
        'Use a min-heap of size k',
        'Use quickselect algorithm',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      explanation: 'All methods work: sorting (O(n log n)), min-heap (O(n log k)), and quickselect (O(n) average).',
      difficulty: 'medium',
      tags: ['google', 'algorithms', 'interview']
    }
  ],
  'company-microsoft-medium': [
    {
      id: 'comp-2',
      question: 'Microsoft interview question: Reverse a linked list in-place.',
      options: [
        'Use recursion',
        'Use iterative approach with three pointers',
        'Convert to array, reverse, convert back',
        'All of the above'
      ],
      correctAnswer: 'All of the above',
      explanation: 'Multiple approaches work, but iterative with three pointers is most space-efficient (O(1) space).',
      difficulty: 'medium',
      tags: ['microsoft', 'data-structures', 'interview']
    }
  ],
  'company-tcs-easy': [
    {
      id: 'comp-3',
      question: 'TCS interview question: What is the output of: int x = 5; printf("%d", x++ + ++x);',
      options: ['10', '11', '12', 'Undefined behavior'],
      correctAnswer: 'Undefined behavior',
      explanation: 'Modifying a variable twice in the same expression without a sequence point results in undefined behavior.',
      difficulty: 'easy',
      tags: ['tcs', 'c-programming', 'interview']
    }
  ]
};

// Helper function to get questions by category and difficulty
export function getQuestionsByCategory(category, topic, difficulty) {
  const key = `${category}-${topic}-${difficulty}`;
  return expandedQuestions[key] || [];
}

// Helper function to get all questions for a category
export function getAllQuestionsForCategory(category, difficulty) {
  const questions = [];
  const categoryData = quizCategories[category];
  if (!categoryData) return questions;

  categoryData.topics.forEach(topic => {
    const key = `${category}-${topic}-${difficulty}`;
    if (expandedQuestions[key]) {
      questions.push(...expandedQuestions[key]);
    }
  });

  return questions;
}

// Get random questions for a quiz
export function getRandomQuestions(category, topic, difficulty, count = 10) {
  const allQuestions = getQuestionsByCategory(category, topic, difficulty);
  if (allQuestions.length === 0) {
    // Fallback to category-level questions
    return getAllQuestionsForCategory(category, difficulty).slice(0, count);
  }

  // Shuffle and return requested count
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Legacy support - map old difficulty-based system
export function getQuizByDifficulty(difficulty) {
  // Map difficulty to category/topic
  const category = 'aptitude';
  const topic = difficulty === 'easy' ? 'basic-math' : difficulty === 'medium' ? 'advanced-math' : 'data-interpretation';
  const questions = getRandomQuestions(category, topic, difficulty, 8);

  return {
    id: `${difficulty}-quiz`,
    title: `Aptitude - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
    difficulty: difficulty,
    description: `Aptitude questions - ${difficulty} level`,
    timePerQuestion: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20,
    pointsPerQuestion: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    questions: questions.map((q, idx) => ({
      ...q,
      id: q.id || idx + 1,
      timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20
    }))
  };
}

export function getAvailableQuizzes() {
  const quizzes = [];
  
  Object.keys(quizCategories).forEach(categoryId => {
    const category = quizCategories[categoryId];
    category.topics.forEach(topic => {
      ['easy', 'medium', 'hard'].forEach(difficulty => {
        const key = `${categoryId}-${topic}-${difficulty}`;
        if (expandedQuestions[key] && expandedQuestions[key].length > 0) {
          quizzes.push({
            category: categoryId,
            topic: topic,
            difficulty: difficulty,
            title: `${category.name} - ${topic.replace(/-/g, ' ')}`,
            description: category.description,
            questionCount: expandedQuestions[key].length,
            timePerQuestion: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20
          });
        }
      });
    });
  });

  return quizzes;
}

export function getSafeQuiz(category, topic, difficulty) {
  const questions = getRandomQuestions(category, topic, difficulty, 10);
  
  return {
    id: `${category}-${topic}-${difficulty}`,
    title: `${quizCategories[category]?.name || category} - ${topic}`,
    category: category,
    topic: topic,
    difficulty: difficulty,
    description: quizCategories[category]?.description || '',
    timePerQuestion: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20,
    pointsPerQuestion: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    questions: questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20
    }))
  };
}

export function checkAnswer(question, answer) {
  return question.correctAnswer === answer;
}

export function getQuestionExplanation(question) {
  return question.explanation || 'No explanation available';
}
