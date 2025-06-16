import { PrismaClient, QuestionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Sample questions for each category
const sampleQuestions = [
  // Numerical Sequences
  {
    type: 'NUMERICAL_SEQUENCE' as QuestionType,
    category: 'logical_sequences',
    difficulty: -1.0,
    content: {
      sequence: [2, 4, 6, 8, '?'],
      question: 'What number comes next in the sequence?',
      options: ['10', '12', '14', '16'],
    },
    correctAnswer: '10',
    explanation: 'This is an arithmetic sequence with a common difference of 2.',
    discrimination: 1.2,
    guessing: 0.25,
    timeLimit: 60,
    tags: ['arithmetic', 'easy'],
  },
  {
    type: 'NUMERICAL_SEQUENCE' as QuestionType,
    category: 'logical_sequences',
    difficulty: 0.5,
    content: {
      sequence: [1, 1, 2, 3, 5, 8, '?'],
      question: 'What number comes next in the Fibonacci sequence?',
      options: ['11', '13', '15', '17'],
    },
    correctAnswer: '13',
    explanation: 'Each number is the sum of the two preceding numbers.',
    discrimination: 1.5,
    guessing: 0.25,
    timeLimit: 90,
    tags: ['fibonacci', 'medium'],
  },
  
  // Matrix Reasoning
  {
    type: 'MATRIX_REASONING' as QuestionType,
    category: 'spatial',
    difficulty: -0.5,
    content: {
      matrix: [
        ['circle', 'square', 'triangle'],
        ['square', 'triangle', 'circle'],
        ['triangle', '?', 'square'],
      ],
      question: 'Which shape completes the pattern?',
      options: ['circle', 'square', 'triangle', 'diamond'],
    },
    correctAnswer: 'circle',
    explanation: 'Each row and column contains each shape exactly once.',
    discrimination: 1.3,
    guessing: 0.25,
    timeLimit: 120,
    tags: ['pattern', 'shapes'],
  },
  
  // Spatial Rotation
  {
    type: 'SPATIAL_ROTATION' as QuestionType,
    category: 'spatial',
    difficulty: 1.0,
    content: {
      originalShape: 'cube_front_view',
      question: 'How would this cube look when rotated 90 degrees clockwise?',
      options: ['option_a', 'option_b', 'option_c', 'option_d'],
    },
    correctAnswer: 'option_b',
    explanation: 'The cube is rotated 90 degrees clockwise around the vertical axis.',
    discrimination: 1.8,
    guessing: 0.25,
    timeLimit: 150,
    tags: ['3d', 'rotation', 'hard'],
  },
  
  // Verbal Analogies
  {
    type: 'VERBAL_ANALOGY' as QuestionType,
    category: 'verbal',
    difficulty: -0.8,
    content: {
      analogy: 'Cat is to Kitten as Dog is to ?',
      question: 'Complete the analogy',
      options: ['Puppy', 'Bark', 'Tail', 'Bone'],
    },
    correctAnswer: 'Puppy',
    explanation: 'A kitten is a young cat, just as a puppy is a young dog.',
    discrimination: 1.1,
    guessing: 0.25,
    timeLimit: 45,
    tags: ['animals', 'relationships'],
  },
  
  // Working Memory
  {
    type: 'WORKING_MEMORY' as QuestionType,
    category: 'working_memory',
    difficulty: 0.0,
    content: {
      sequence: ['A', 'B', 'C', 'D', 'E'],
      question: 'Remember this sequence. What was the 3rd letter?',
      options: ['A', 'B', 'C', 'D'],
    },
    correctAnswer: 'C',
    explanation: 'The third letter in the sequence A-B-C-D-E is C.',
    discrimination: 1.4,
    guessing: 0.25,
    timeLimit: 30,
    tags: ['memory', 'sequence'],
  },
  
  // Processing Speed
  {
    type: 'PROCESSING_SPEED' as QuestionType,
    category: 'processing_speed',
    difficulty: -1.5,
    content: {
      symbols: ['★', '●', '■', '▲'],
      target: '●',
      question: 'How many ● symbols are in the grid?',
      grid: [
        ['★', '●', '■', '▲'],
        ['●', '■', '★', '●'],
        ['▲', '●', '●', '■'],
        ['■', '★', '●', '▲'],
      ],
      options: ['4', '5', '6', '7'],
    },
    correctAnswer: '6',
    explanation: 'Count all occurrences of the ● symbol in the grid.',
    discrimination: 0.9,
    guessing: 0.25,
    timeLimit: 20,
    tags: ['counting', 'speed'],
  },
];

// Sample norm groups
const sampleNormGroups = [
  {
    name: 'General Adult Population',
    description: 'General adult population aged 18-65',
    ageRange: '18-65',
    sampleSize: 2000,
    mean: 100.0,
    stdDev: 15.0,
    percentiles: {
      1: 55, 5: 70, 10: 77, 25: 90, 50: 100, 75: 110, 90: 123, 95: 130, 99: 145,
    },
    isActive: true,
  },
  {
    name: 'Young Adults (18-25)',
    description: 'Young adults aged 18-25',
    ageRange: '18-25',
    sampleSize: 500,
    mean: 102.0,
    stdDev: 14.5,
    percentiles: {
      1: 58, 5: 72, 10: 79, 25: 92, 50: 102, 75: 112, 90: 125, 95: 132, 99: 147,
    },
    isActive: true,
  },
  {
    name: 'College Educated',
    description: 'Adults with college education',
    education: 'BACHELOR' as const,
    sampleSize: 800,
    mean: 108.0,
    stdDev: 14.0,
    percentiles: {
      1: 65, 5: 78, 10: 85, 25: 98, 50: 108, 75: 118, 90: 131, 95: 138, 99: 153,
    },
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.response.deleteMany();
    await prisma.testResult.deleteMany();
    await prisma.testSession.deleteMany();
    await prisma.question.deleteMany();
    await prisma.normGroup.deleteMany();
    await prisma.user.deleteMany();

    // Create norm groups
    console.log('📊 Creating norm groups...');
    for (const normGroup of sampleNormGroups) {
      await prisma.normGroup.create({
        data: {
          id: uuidv4(),
          ...normGroup,
        },
      });
    }

    // Create questions
    console.log('❓ Creating sample questions...');
    for (const question of sampleQuestions) {
      await prisma.question.create({
        data: {
          id: uuidv4(),
          ...question,
        },
      });
    }

    // Create additional questions for each category
    console.log('📝 Creating additional questions...');
    const categories = ['logical_sequences', 'spatial', 'verbal', 'working_memory', 'processing_speed'];
    const types: QuestionType[] = ['NUMERICAL_SEQUENCE', 'MATRIX_REASONING', 'SPATIAL_ROTATION', 'VERBAL_ANALOGY', 'WORKING_MEMORY', 'PROCESSING_SPEED'];

    for (let i = 0; i < 50; i++) {
      const category = categories[i % categories.length]!;
      const type = types[i % types.length]!;
      const difficulty = (Math.random() - 0.5) * 4; // Random difficulty between -2 and 2

      await prisma.question.create({
        data: {
          id: uuidv4(),
          type,
          category,
          difficulty,
          content: {
            question: `Sample ${type.toLowerCase()} question ${i + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            description: `This is a sample question for testing purposes.`,
          },
          correctAnswer: ['Option A', 'Option B', 'Option C', 'Option D'][i % 4]!,
          explanation: `This is the explanation for question ${i + 1}.`,
          discrimination: 0.8 + Math.random() * 1.4, // Random between 0.8 and 2.2
          guessing: Math.random() * 0.3, // Random between 0 and 0.3
          timeLimit: 30 + Math.floor(Math.random() * 120), // Random between 30 and 150 seconds
          tags: [category, difficulty > 0 ? 'hard' : 'easy'],
        },
      });
    }

    // Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      {
        email: 'admin@iqtest.com',
        username: 'admin',
        age: 30,
        gender: 'OTHER' as const,
        education: 'MASTER' as const,
        country: 'CZ',
      },
      {
        email: 'test@example.com',
        username: 'testuser',
        age: 25,
        gender: 'MALE' as const,
        education: 'BACHELOR' as const,
        country: 'CZ',
      },
      {
        username: 'anonymous1',
        age: 22,
        gender: 'FEMALE' as const,
        education: 'SECONDARY' as const,
        country: 'SK',
      },
    ];

    for (const user of sampleUsers) {
      await prisma.user.create({
        data: {
          id: uuidv4(),
          ...user,
        },
      });
    }

    console.log('✅ Database seed completed successfully!');
    console.log(`📊 Created ${sampleNormGroups.length} norm groups`);
    console.log(`❓ Created ${sampleQuestions.length + 50} questions`);
    console.log(`👥 Created ${sampleUsers.length} users`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
