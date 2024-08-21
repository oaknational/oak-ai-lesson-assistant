export type SubjectName =
  | "Art & Design"
  | "Biology"
  | "Chemistry"
  | "Citizenship"
  | "Combined Science"
  | "Computing"
  | "Computing (Non-GCSE)"
  | "Design & Technology"
  | "Drama"
  | "English"
  | "English Grammar"
  | "English Reading for Pleasure"
  | "English Spelling"
  | "Expressive Arts and Design"
  | "Literacy"
  | "French"
  | "Geography"
  | "German"
  | "History"
  | "Latin"
  | "Maths"
  | "Mathematics"
  | "Modern Foreign Languages"
  | "Music"
  | "PSED (Personal, Social and Emotional Development)"
  | "Physics"
  | "Physical Education"
  | "PSHE"
  | "Religious Education"
  | "Science"
  | "Spanish"
  | "Understanding the World";

export type KeyStageName =
  // | "Early Years Foundation Stage"
  "Key Stage 1" | "Key Stage 2" | "Key Stage 3" | "Key Stage 4";

const allSubjects: SubjectName[] = [
  "Art & Design",
  "Biology",
  "Chemistry",
  "Citizenship",
  "Combined Science",
  "Computing",
  "Computing (Non-GCSE)",
  "Design & Technology",
  "Drama",
  "English",
  "English Grammar",
  "English Reading for Pleasure",
  "English Spelling",
  //"Expressive Arts and Design",
  // "French",
  "Geography",
  // "German",
  "History",
  // "Latin",
  // "Literacy",
  // "Maths",
  // "Mathematics",
  // "Modern Foreign Languages",
  "Music",
  // "PSED (Personal, Social and Emotional Development)",
  "Physical Education",
  "PSHE",
  "Religious Education",
  "Science",
  // "Spanish",
  // "Understanding the World",
];

const allStages: KeyStageName[] = [
  //"Early Years Foundation Stage",

  "Key Stage 1",
  "Key Stage 2",
  "Key Stage 3",
  "Key Stage 4",
];

const byKeyStage: Record<KeyStageName, { subjects: SubjectName[] }> = {
  "Key Stage 1": {
    subjects: [
      "Art & Design",
      "Design & Technology",
      "Drama",
      "English",
      "Geography",
      "History",
      // "Mathematics",
      // "Modern Foreign Languages",
      "Music",
      "Physical Education",
      "Religious Education",
      "Science",
    ],
  },
  "Key Stage 2": {
    subjects: [
      "Art & Design",
      "Computing",
      "Design & Technology",
      "Drama",
      "English",
      "English Grammar",
      "English Reading for Pleasure",
      "English Spelling",
      // "French",
      "Geography",
      "History",
      // "Maths",
      "Music",
      "Physical Education",
      "PSHE",
      "Religious Education",
      "Science",
      // "Spanish",
    ],
  },
  "Key Stage 3": {
    subjects: [
      "Art & Design",
      "Citizenship",
      "Computing",
      "Design & Technology",
      "Drama",
      "English",
      // "French",
      "Geography",
      // "German",
      "History",
      // "Latin",
      // "Maths",
      "Music",
      "Physical Education",
      "PSHE",
      "Religious Education",
      "Science",
      // "Spanish",
    ],
  },
  "Key Stage 4": {
    subjects: [
      "Art & Design",
      "Biology",
      "Chemistry",
      "Citizenship",
      "Combined Science",
      "Computing",
      "Computing (Non-GCSE)",
      "English",
      // "French",
      "Geography",
      // "German",
      "History",
      // "Latin",
      // "Maths",
      "Physics",
      "PSHE",
      "Religious Education",
      "Science",
    ],
  },
};

export const subjectsAndKeyStages = {
  allSubjects,
  allStages,
  byKeyStage,
};
