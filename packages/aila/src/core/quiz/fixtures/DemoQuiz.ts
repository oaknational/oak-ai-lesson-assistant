export const massiveStarterQuiz = {
  type: "patch",
  reasoning: "adding maths quiz because i need to teach the kids about this",
  value: {
    op: "add",
    path: "/starterQuiz",
    value: [
      {
        question:
          "A _________ is a straight line outside a circle that touches one point of the circumference.",
        answers: ["Tangent"],
        distractors: ["Arc", "Chord", "Radium"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question: "The sum of all the angles of a triangle is:",
        answers: ["180 degrees"],
        distractors: ["100 degrees", "360 degrees", "90 degrees"],
        hint: "",
        feedback: "",
        html: [""],
      },
      //   {
      //     question:
      //       "This circle is drawn on a centimetre square grid. State the radius and diameter. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707165545/bc4br7jzgl06dbpnkdva.png)",
      //     answers: ["R = 4cm, D = 8cm."],
      //     distractors: ["Others", "R = 4cm, D = 4cm", "R= 8cm, D = 4cm"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question: "Which is the formula for the area of a circle?",
      //     answers: ["$$A = \\pi r^2$$"],
      //     distractors: [
      //       "$$A = \\pi r$$",
      //       "$$A = 2\\pi r$$",
      //       "$$A = \\pi r2$$",
      //       "$$A = \\pi^2 r$$",
      //     ],
      //     hint: "Formulae for areas usually involve the multiplication of two lengths.",
      //     feedback:
      //       "The area of a circle can be found by using the formula $$A = \\pi r^2$$.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "A circle is a shape such that every point is {{ }} to its centre.",
      //     answers: ["equidistant"],
      //     distractors: ["horizontal", "vertical", "vertically opposite"],
      //     hint: "The radius is a line segment from the centre of the circle to its edge. The radius is the same length in every direction.",
      //     feedback:
      //       "A circle is a shape such that every point is equidistant to its centre.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "Use your knowledge of operations with equal priority to solve the equation efficiently. What is 32 + 17 - 12 + 3 - 8?",
      //     answers: ["32"],
      //     distractors: ["22", "28", "33"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "When two shapes are congruent, which property of the shapes always remain invariant?",
      //     answers: ["angles", "lengths"],
      //     distractors: ["orientation", "position"],
      //     hint: "Congruent shapes can be made by using reflection, rotation or translation.",
      //     feedback:
      //       "When shapes are congruent, the angles and lengths are invariant but the orientations may differ.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "This circle is drawn on a centimetre square grid. State the radius and diameter. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707165532/yvzoz2bnsu69nty8ywgz.jpg)",
      //     answers: ["Radius = 2cm, Diameter = 4cm."],
      //     distractors: [
      //       "Radius = 2cm, Diameter = 2cm",
      //       "Radius = 4cm, Diameter = 2cm",
      //     ],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question: "How many degrees in 2 right angles?",
      //     answers: ["180°"],
      //     distractors: ["60°", "90°"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      {
        question:
          "Two shapes are ________ if the only difference between them is their size.",
        answers: ["similar"],
        distractors: ["disimilar"],
        hint: "If two things resemble each other, they are said to be...",
        feedback:
          "Two shapes are similar if the only difference between them is their size.",
        html: [""],
      },
      //   {
      //     question:
      //       "Imagine a square - the length of a side is 5 cm.  Imagine an equilateral triangle - the length of a side is 6 cm.  Which has the longest perimeter?",
      //     answers: ["The square"],
      //     distractors: ["The triangle"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question: "If 𝑥 + 𝑦 = 100, then what is the value of 2𝑥 + 2𝑦 - 20?",
      //     answers: ["180"],
      //     distractors: ["160", "200", "220"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "Which of these formulae finds the circumference of a circle with radius $$r$$ and diameter $$d$$?",
      //     answers: [
      //       "$$circumference = 2{\\times} {\\pi} {\\times}r$$",
      //       "$$circumference = {\\pi} {\\times}d$$",
      //     ],
      //     distractors: [
      //       "$$circumference = {\\pi} {\\times}r$$",
      //       "$$circumference = {\\pi} {\\times}d^2$$",
      //       "$$circumference = 2{\\times}{\\pi} {\\times}d$$",
      //     ],
      //     hint: "2 lots of the radius is equal to the diameter.",
      //     feedback:
      //       "The circumference of a circle is equal to both $$2{\\times} {\\pi} {\\times}r$$ and $${\\pi} {\\times}d$$. Either can be used, and sometimes using a specific one is easier, depending on the information about a circle that is given.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "What does 3 this equation $$3 \\times 4 = 12$$ represent in relation to this image? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1692016545/ztbqzxdsbk6zmtfhvgbn.png)",
      //     answers: ["The number of shapes in the basic pattern"],
      //     distractors: [
      //       "The number of triangles in the image",
      //       "The number of circles in the image",
      //     ],
      //     hint: "Where can you see 3 in the image. Where does the pattern start and stop and how many shapes are there in the basic pattern?",
      //     feedback:
      //       "The 3 represents the shapes in the basic pattern so 2 triangles and 1 circle making a total of 3 shapes.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "Using this diagram, you know that the angles are supplementary so $$a$$ is {{ }}°. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1705065288/kjd8pm7adzgtyr8es5ef.png)",
      //     answers: ["60", "sixty"],
      //     distractors: [
      //       "No distractors for short answer",
      //       "No distractors for short answer",
      //     ],
      //     hint: "The two angles are supplementary so they sum to 180°.",
      //     feedback: "$$2a+a=180$$, $$3a=180$$ so $$a=60$$°.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "Imagine a square - the length of a side is 5 cm.  Imagine an equilateral triangle - the length of a side is 6 cm.  Which has the longest perimeter?",
      //     answers: ["The square"],
      //     distractors: ["The triangle"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      {
        question: "If 𝑥 + 𝑦 = 100, then what is the value of 2𝑥 + 2𝑦 - 20?",
        answers: ["180"],
        distractors: ["160", "200", "220"],
        hint: "",
        feedback: "",
        html: [""],
      },
      //   {
      //     question:
      //       "Which of these formulae finds the circumference of a circle with radius r and diameter d?",
      //     answers: [
      //       "$$circumference = 2{\\times} {\\pi} {\\times}r$$",
      //       "$$circumference = {\\pi} {\\times}d$$",
      //     ],
      //     distractors: [
      //       "$$circumference = {\\pi} {\\times}r$$",
      //       "$$circumference = {\\pi} {\\times}d^2$$",
      //       "$$circumference = 2{\\times}{\\pi} {\\times}d$$",
      //     ],
      //     hint: "2 lots of the radius is equal to the diameter.",
      //     feedback:
      //       "The circumference of a circle is equal to both $$2{\\times} {\\pi} {\\times}r$$ and $${\\pi} {\\times}d$$. Either can be used, and sometimes using a specific one is easier, depending on the information about a circle that is given.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "What does 3 this equation $$3 \\times 4 = 12$$ represent in relation to this image? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1692016545/ztbqzxdsbk6zmtfhvgbn.png)",
      //     answers: ["The number of shapes in the basic pattern"],
      //     distractors: [
      //       "The number of triangles in the image",
      //       "The number of circles in the image",
      //     ],
      //     hint: "Where can you see 3 in the image. Where does the pattern start and stop and how many shapes are there in the basic pattern?",
      //     feedback:
      //       "The 3 represents the shapes in the basic pattern so 2 triangles and 1 circle making a total of 3 shapes.",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "Using this diagram, you know that the angles are supplementary so $$a$$ is {{ }}°. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1705065288/kjd8pm7adzgtyr8es5ef.png)",
      //     answers: ["60", "sixty"],
      //     distractors: [
      //       "No distractors for short answer",
      //       "No distractors for short answer",
      //     ],
      //     hint: "The two angles are supplementary so they sum to 180°.",
      //     feedback: "$$2a+a=180$$, $$3a=180$$ so $$a=60$$°.",
      //     html: [""],
      //   },
      {
        question:
          "Label this part of the circle ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163517/a2kd48g6gefubh5wfgeq.png)",
        answers: ["Radius"],
        distractors: ["Arc", "Circumference", "Diameter"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707209153/ettrswc1mhkwv1cnbhzs.png)",
        answers: ["b", "c"],
        distractors: ["a", "d"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Which is the correct trigonometric ratio to use to calculate length y? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707209442/wj4hxura2qayhamx5ads.png)",
        answers: ["Sine"],
        distractors: ["Cosine", "Tangent"],
        hint: "",
        feedback: "",
        html: [""],
      },
      //   {
      //     question:
      //       "Which is the correct trigonometric ratio to use to calculate length y? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707209442/wj4hxura2qayhamx5ads.png)",
      //     answers: ["Sine"],
      //     distractors: ["Cosine", "Tangent"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "2. A man stands exactly 8m from a lamppost. He looks to the top of the lamppost, as shown. What is the height of the lamppost? Answer to 1 dp ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707172977/vp51k4icgvz04ulbwhnz.png)",
      //     answers: ["7.2 m"],
      //     distractors: ["11.9 m", "13.4 m", "5.4 m"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      //   {
      //     question:
      //       "2. A man stands exactly 8m from a lamppost. He looks to the top of the lamppost, as shown. What is the height of the lamppost? Answer to 1 dp ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707172977/vp51k4icgvz04ulbwhnz.png)",
      //     answers: ["7.2 m"],
      //     distractors: ["11.9 m", "13.4 m", "5.4 m"],
      //     hint: "",
      //     feedback: "",
      //     html: [""],
      //   },
      {
        question:
          "Label this part of the circle ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707168686/t3jutar7axagbhrsrfdk.png)",
        answers: ["Arc"],
        distractors: ["Diameter", "Radius", "Tangent"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Label this part of the circle ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707168694/hscoi8zfpdpd6t16dozx.png)",
        answers: ["Diameter"],
        distractors: ["Arc", "Circumference", "Radius"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question: "For sin(xᵒ) = y, which of these statements is true?",
        answers: ["cos(90 - xᵒ) = y"],
        distractors: ["tan(90 - xᵒ) = y", "cos(yᵒ) = x", "tan(yᵒ) = x"],
        hint: "Cosine means 'complementary sine'.",
        feedback: "cos(90 - xᵒ) = y",
        html: [""],
      },
      {
        question:
          "This robot standing on a box has a fly on the top of their head. How high up (h) is the fly from the ground? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1709147156/bvqqofuzywkexhzw2o2s.png)",
        answers: ["3.2 m"],
        distractors: ["3.9 m", "4.1 m"],
        hint: "Use the properties of the triangle to help you. Fill in the missing angles for a clue.",
        feedback:
          "This can be solved without trigonometry (or with it) as the triangle is isosceles. ",
        html: [""],
      },
    ],
  },
};

export const cachedQuizIds = [
  "QUES-MSTM1-51706",
  "QUES-WJYU1-65167",
  "QUES-MSTM1-51706",
  "QUES-DFGN1-65168",
  "QUES-WJYU1-65167",
  "QUES-YDRST-28050",
  "QUES-WBSG2-10289",
  "QUES-IPRQU-27826",
  "QUES-NHSX2-39261",
  "QUES-IFMV2-27176",
  "QUES-ZDYP2-39175",
  "QUES-PBNV2-10826",
  "QUES-XWVW2-39264",
  "QUES-ZDYP2-39175",
  "QUES-EEAX2-39414",
];

export const cachedExitQuiz2v = {
  type: "patch",
  reasoning: "adding maths quiz because i need to teach the kids about this",
  value: {
    op: "add",
    path: "/exitQuiz",
    value: [
      {
        question:
          "![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707209155/edxtcilmsnxmvmyutydv.png)",
        answers: ["a", "d"],
        distractors: ["b", "c"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Which circle theorem is being shown in the diagram? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163529/szlbxsyihr4oxzt5xll3.png)",
        answers: ["D"],
        distractors: ["A", "B", "C"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Which circle theorem is being shown in the diagram? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707163529/szlbxsyihr4oxzt5xll3.png)",
        answers: ["D"],
        distractors: ["A", "B", "C"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Which statement is correct about the diagram shown. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707172241/qy5rj2kngsyh2xw5h14o.png)",
        answers: ["Line AB = Line AC"],
        distractors: ["Line AB < Line AC", "Line AB > Line AC"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the size of angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707167694/m6vnzje7tfaxkrmvgrxy.png)",
        answers: ["22º"],
        distractors: ["158º", "68º", "90º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the missing angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707131028/qrcwosf2bnno22ii53x4.png)",
        answers: ["60º"],
        distractors: ["108º", "48º", "72º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the size of angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707167694/m6vnzje7tfaxkrmvgrxy.png)",
        answers: ["22º"],
        distractors: ["158º", "68º", "90º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the missing angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707131028/qrcwosf2bnno22ii53x4.png)",
        answers: ["60º"],
        distractors: ["108º", "48º", "72º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the size of angle y. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206590/lq7dxwsge6okkgtcigln.png)",
        answers: ["106º"],
        distractors: ["109º", "149º", "74º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Work out the size of angle y. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707206590/lq7dxwsge6okkgtcigln.png)",
        answers: ["106º"],
        distractors: ["109º", "149º", "74º"],
        hint: "",
        feedback: "",
        html: [""],
      },
    ],
  },
};

export const massiveExitQuiz = {
  type: "patch",
  reasoning: "adding maths quiz because i need to teach the kids about this",
  value: {
    op: "add",
    path: "/exitQuiz",
    value: [
      {
        question:
          "Work out the size of angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707167694/m6vnzje7tfaxkrmvgrxy.png)",
        answers: ["22º"],
        distractors: ["158º", "68º", "90º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "When two shapes are congruent, which property of the shapes always remain invariant?",
        answers: ["angles", "lengths"],
        distractors: ["orientation", "position"],
        hint: "Congruent shapes can be made by using reflection, rotation or translation.",
        feedback:
          "When shapes are congruent, the angles and lengths are invariant but the orientations may differ.",
        html: [""],
      },
      {
        question: "How many degrees in 2 right angles?",
        answers: ["180°"],
        distractors: ["60°", "90°"],
        hint: "",
        feedback: "",
        html: [""],
      },
      {
        question:
          "Which statement is correct about the diagram shown. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707172241/qy5rj2kngsyh2xw5h14o.png)",
        answers: ["Line AB = Line AC"],
        distractors: ["Line AB < Line AC", "Line AB > Line AC"],
        hint: "",
        feedback: "",
        html: [""],
      },
      //   {
      //     question:
      //       "Which of these four circles can help in the construction of the perpendicular to line segment WU through point Z? ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1703146665/npeh5fqghuy0ivatnbyo.png)",
      //     answers: ["b", "c"],
      //     distractors: ["a", "d"],
      //     hint: "Line segment WU can be extended if this helps intersect with an appropriate circle twice.",
      //     feedback:
      //       "Circle a is too small, and circle d has its centre at point W, when the centre should be at point Z.",
      //     html: [""],
      //   },
      {
        question:
          "Work out the size of angle x. ![image](http://oaknationalacademy-res.cloudinary.com/image/upload/v1707168503/tgsqk8mk9pebngsantme.png)",
        answers: ["43º"],
        distractors: ["21.5º", "86º", "90º"],
        hint: "",
        feedback: "",
        html: [""],
      },
      //   {
      //     question:
      //       "Two shapes are {{}} if the only difference between them is their size.",
      //     answers: ["similar"],
      //     distractors: [
      //       "No distractors for short answer",
      //       "No distractors for short answer",
      //     ],
      //     hint: "If two things resemble each other, they are said to be...",
      //     feedback:
      //       "Two shapes are similar if the only difference between them is their size.",
      //     html: [""],
      //   },
    ],
  },
};
