export const generateTeachingMaterialWithAdaptsOutputId = JSON.stringify([
  {
    result: {
      data: {
        json: {
          resource: {
            lessonTitle: "Exploring animal habitats",
            glossary: [
              {
                term: "Adapt",
                definition: "a feature.",
              },
              {
                term: "Environment",
                definition:
                  "everything around us, including air, water, and land.",
              },
              {
                term: "Habitat",
                definition:
                  "a natural environment where an animal or plant lives.",
              },
              {
                term: "Temperature",
                definition: "a measure of how hot or cold something is.",
              },
              {
                term: "Vegetation",
                definition: "plants and trees that grow in a particular area.",
              },
            ],
          },
          moderation: {
            scores: {
              l: 5,
              v: 5,
              u: 5,
              s: 5,
              p: 5,
              t: 5,
            },
            categories: [],
            justification:
              "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. The content is educational and focuses on defining terms related to animal habitats, such as adaptation, environment, habitat, temperature, and vegetation. There is no use of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics. The content does not include any nudity or sexual content. There is no involvement of physical activities, exploration of objects, or use of equipment requiring supervision. Additionally, there are no guides or encouragements of harmful or illegal activities. The material is appropriate for the intended audience and does not require any content warnings or adult supervision.",
          },
          resourceId: "17b709cc-358c-48e1-9784-f3f9d01c3b13",
          rateLimit: {
            isSubjectToRateLimiting: true,
            limit: 1000,
            remaining: 982,
            reset: 1751760000000,
          },
        },
      },
      error: null,
    },
  },
]);

export const generateTeachingMaterialWithoutAdaptsOutputId = JSON.stringify([
  {
    result: {
      data: {
        json: {
          resource: {
            lessonTitle: "Exploring animal habitats",
            glossary: [
              {
                term: "Adaptation",
                definition:
                  "a special feature that helps an animal survive in its habitat.",
              },
              {
                term: "Environment",
                definition:
                  "everything around us, including air, water, and land.",
              },
              {
                term: "Habitat",
                definition:
                  "a natural environment where an animal or plant lives.",
              },
              {
                term: "Temperature",
                definition: "a measure of how hot or cold something is.",
              },
              {
                term: "Vegetation",
                definition: "plants and trees that grow in a particular area.",
              },
            ],
          },
          moderation: {
            scores: {
              l: 5,
              v: 5,
              u: 5,
              s: 5,
              p: 5,
              t: 5,
            },
            categories: [],
            justification:
              "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. The content is educational and focuses on defining terms related to animal habitats, such as adaptation, environment, habitat, temperature, and vegetation. There is no use of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics. The content does not include any nudity or sexual content. There is no involvement of physical activities, exploration of objects, or use of equipment requiring supervision. Additionally, there are no guides or encouragements of harmful or illegal activities. The material is appropriate for the intended audience and does not require any content warnings or adult supervision.",
          },
          resourceId: "17b709cc-358c-48e1-9784-f3f9d01c3b13",
          rateLimit: {
            isSubjectToRateLimiting: true,
            limit: 1000,
            remaining: 982,
            reset: 1751760000000,
          },
        },
      },
      error: null,
    },
  },
]);

export const generatePartialLessonPlanObjectResponse = JSON.stringify([
  {
    result: {
      data: {
        json: {
          threatDetection: false,
          lesson: {
            title: "Exploring animal habitats",
            keyStage: "key-stage-1",
            year: "year-1",
            subject: "Biology",
            learningOutcome:
              "I can identify different animal habitats and describe their features.",
            learningCycles: [
              "Identify and describe different types of animal habitats.",
              "Explain how animals are adapted to their habitats.",
              "Match animals to their correct habitats.",
            ],
            keyLearningPoints: [
              "A habitat is a place where an animal lives.",
              "Different habitats have different features like temperature and vegetation.",
              "Animals have adaptations that help them survive in their habitats.",
            ],
            misconceptions: [
              {
                misconception: "All animals can live in any habitat",
                description:
                  "Animals are adapted to specific habitats. For example, a polar bear cannot live in a desert because it needs cold temperatures and ice.",
              },
            ],
            keywords: [
              {
                keyword: "Habitat",
                definition:
                  "A habitat is a natural environment where an animal or plant lives.",
              },
              {
                keyword: "Adaptation",
                definition:
                  "An adaptation is a special feature that helps an animal survive in its habitat.",
              },
              {
                keyword: "Environment",
                definition:
                  "The environment is everything around us, including air, water, and land.",
              },
            ],
          },
          lessonId: "e3bb4b2c-06ce-4324-afae-6d9f227a337f",
          moderation: {
            scores: {
              l: 5,
              v: 5,
              u: 5,
              s: 5,
              p: 5,
              t: 5,
            },
            justification:
              "The additional material resource titled 'Exploring animal habitats' is fully compliant across all categories. It is designed for Key Stage 1 students, focusing on biology and the identification of animal habitats. The content is educational and age-appropriate, with no presence of discriminatory language, offensive language, or strong language. There is no depiction or discussion of violence, conflict, or sensitive topics that could be upsetting or disturbing to young learners. The material does not include any nudity or sexual content, nor does it involve any physical activities or exploration of objects that require supervision. Additionally, there are no toxic elements such as guides to harmful behavior or illegal activities. The resource is purely educational, focusing on understanding animal habitats and adaptations, making it suitable for the intended audience without any need for content warnings or adult supervision.",
            categories: [],
          },
        },
      },
    },
  },
]);

export const createMaterialSessionResponse = JSON.stringify([
  {
    result: {
      data: {
        json: {
          resourceId: "1234-test",
        },
      },
      error: null,
    },
  },
]);

export const updateMaterialSessionResponse = JSON.stringify([
  {
    result: {
      data: {
        json: {
          success: true,
        },
      },
    },
  },
]);
