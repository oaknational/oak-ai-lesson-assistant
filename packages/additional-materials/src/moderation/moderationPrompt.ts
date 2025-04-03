const moderationCategories = [
  {
    title: "Language and discrimination",
    codePrefix: "l",
    criteria5:
      "(Fully compliant): The additional material resource does not contain any discriminatory language, behavior, or images, offensive language, or strong language.",
    criteria1:
      "(Severely non-compliant): The additional material resource contains explicit discriminatory language, behavior, or images, highly offensive language, or excessive use of strong language, which is not appropriate for the intended audience",
    note: "Even if the content is presented in a respectful, factual, and sensitive manner, handled with care, and provided with historical context, the score must be adjusted to reflect the presence of such content.",
    categories: [
      {
        code: "l/discriminatory-behaviour",
        title: "Discriminatory Behaviour",
        userDescription: "discriminatory language, behaviour or images",
        llmDescription:
          "Discriminatory language, behaviour or images, whether on the grounds of race, gender, disability, religion or belief or sexual orientation, or otherwise. Historic or outdated representations of people that may portray inequality or injustice.",
      },
      {
        code: "l/language-may-offend",
        title: "Language May Offend",
        userDescription: "language which has the power to offend",
        llmDescription:
          "Language which has the power to offend including terms of racist or ethnic abuse, sexual and sexist abuse, abuse relating to sexuality, pejorative terms aimed at illness or disabilities and derogatory or inappropriate careless use of holy names or religious terms.",
      },
      {
        code: "l/strong-language",
        title: "Strong Language",
        userDescription: "strong language",
        llmDescription:
          "Including (but isn't limited to) the occasional use of swear worse or curse words.",
      },
    ],
  },
  {
    title: "Violence and crime",
    codePrefix: "v",
    criteria5:
      "(Fully compliant): The additional material resource does not contain any depiction or discussion of conflict, violence, serious violence, or sexual violence.",
    criteria1:
      "(Severely non-compliant): The additional material resource contains graphic depiction or discussion of conflict, violence, serious violence, or sexual violence, which is not appropriate for the intended audience.",
    note: "",
    categories: [
      {
        code: "v/conflict-or-violence",
        title: "Conflict or Violence",
        userDescription:
          "depiction of war, threats of war, death or the aftermath of war or terrorism",
        llmDescription:
          "Depiction of war, threats of war, death or the aftermath of war or terrorism. Depiction or discussion of animal cruelty. Depiction or discussion of violence or fighting, including threats of violence or the aftermath of violence",
      },
      {
        code: "v/serious-conflict-or-violence",
        title: "Serious Conflict or Violence",
        userDescription: "use of weapons",
        llmDescription:
          "Use of weapons including knife crime. Murder. Gangs, peer pressure, Child criminal exploitation- county lines",
      },
      {
        code: "v/sexual-violence",
        title: "Sexual Violence",
        userDescription:
          "depiction or discussion of sexual or domestic abuse or violence",
        llmDescription:
          "Depiction or discussion of sexual or domestic abuse or violence, including threats of or the aftermath of. References to forced marriage, Violence Against Women and Girls, FGM. Grooming, exploitation, coercion, harassment, rape",
      },
    ],
  },
  {
    title: "Upsetting, disturbing and sensitive",
    codePrefix: "u",
    criteria5:
      "(Fully compliant): The additional material resource does not contain any upsetting, sensitive, or distressing content, such as depictions of criminal behavior, scary events, unsafe situations, natural disasters, substance use, bullying, mental health issues, or sensitive topics like adoption, illness, or death.",
    criteria1:
      "(Severely non-compliant): The additional material resource contains significant upsetting, sensitive, or distressing content, such as graphic depictions of criminal behavior, scary events, unsafe situations, natural disasters, substance use, bullying, mental health issues, or sensitive topics like adoption, illness, or death, which may be inappropriate for the intended audience.",
    note: "Even if the content is presented in a careful, considerate manner and does not excessively delve into sensitive or distressing topics, the score must be adjusted to reflect the presence of such content.",
    categories: [
      {
        code: "u/upsetting-content",
        title: "Upsetting Content",
        userDescription: "immoral behaviour or minor criminal offences",
        llmDescription:
          "Immoral behaviour or minor criminal offences, e.g. shoplifting, graffiti. Depiction of scary, confusing or unsettling events or characters placed in danger, including creation of a scary atmosphere through the use of music and sound. Feeling unsafe or being asked to keep secrets. Depiction or discussion of famine, disease, natural disasters. Smoking, vaping or alcohol use. Depiction or discussion of distress or humiliation e.g. bullying",
      },
      {
        code: "u/sensitive-content",
        title: "Sensitive Content",
        userDescription:
          "subjects which particular individuals may be sensitive to",
        llmDescription:
          "Subjects which particular individuals may be sensitive to, eg, adoption, migration, physical illness, mental illness, bereavement or death, divorce, organ donation",
      },
      {
        code: "u/distressing-content",
        title: "Distressing Content",
        userDescription:
          "depiction or discussion of serious mental health issues",
        llmDescription:
          "Depiction or discussion of serious mental health issues including eating disorders, self-harm, suicide or attempted suicide, or the aftermath of such an event. Drug, alcohol or substance abuse. Depiction or discussion of abortion, euthanasia. Honour based violence, extremism and radicalisation",
      },
    ],
  },
  {
    title: "Nudity and sex",
    codePrefix: "s",
    criteria5:
      "(Fully compliant): The additional material resource does not contain any depiction or discussion of nudity or sexual content, including in historic content or sex education materials.",
    criteria1:
      "(Severely non-compliant): The additional material resource contains explicit depiction or discussion of nudity or sexual content, which is not appropriate for the intended audience.",
    note: "Even if the content is presented with sensitivity and the depictions aren't explicit, the score must be adjusted to reflect the presence of such content.",
    categories: [
      {
        code: "s/nudity",
        title: "Nudity",
        userDescription: "depiction or discussion of nudity",
        llmDescription:
          "Depiction or discussion of nudity (including in historic content)",
      },
      {
        code: "s/sexual-content",
        title: "Sexual Content",
        userDescription: "depiction or discussion of sex or sexual body parts",
        llmDescription:
          "Depiction or discussion of sex or sexual body parts, including sex education and texts which include sexual content",
      },
    ],
  },
  {
    title: "Physical",
    codePrefix: "p",
    criteria5:
      "(Not involved at all): The additional material resource does not involve any exploration of objects, use of equipment requiring supervision, imitable behaviors, external content, or physical activity",
    criteria1:
      "(Heavily involved): The additional material resource heavily involves exploration of objects, use of equipment requiring supervision, imitable behaviors, external content, and physical activity",
    note: "Even if the objects are not hazardous or the exploration of objects is minimal, the score must be adjusted to reflect the presence of such content.",
    categories: [
      {
        code: "p/exploration-of-objects",
        title: "Exploration of objects",
        userDescription: "exploration of objects",
        llmDescription:
          "Activity that requires collection of items from an area (room, building, garden)",
      },
      {
        code: "p/equipment-safe-usage",
        title: "Equipment Safe Usage",
        userDescription:
          "use of equipment or ingredients that may require supervision for safety",
        llmDescription:
          "Use of equipment or ingredients that may require supervision for safety, eg. scissors, needles, paint, knives, cooking. Science experiments",
      },
      {
        code: "p/imitable-behaviour",
        title: "Imitable Behaviour",
        userDescription:
          "imitable activities requiring a “don’t try this at home” warning",
        llmDescription:
          'Imitable activities requiring a "don\'t try this at home" warning',
      },
      {
        code: "p/external-content",
        title: "External Content",
        userDescription: "external URLs and 3rd party sites",
        llmDescription:
          "External URLs and 3rd party sites. Film clips contained externally and contained in a worksheet - YouTube etc",
      },
      {
        code: "p/physical-activity",
        title: "Physical Activity",
        userDescription: "physical activity",
        llmDescription: "Physical activity e.g. PE, drama",
      },
    ],
  },
  {
    title: "Toxic",
    codePrefix: "t",
    criteria5:
      "(Fully compliant): The additional material resource does not contain any guides, instructions, or learning materials on how to harm oneself or others, create weapons or harmful substances, or encourage harmful behavior, illegal activity, or violence.",
    criteria1:
      "(Severely non-compliant): The additional material resource contains explicit guides, instructions, or learning materials on how to harm oneself or others, create weapons or harmful substances, or directly encourages harmful behavior, illegal activity, or violence.",
    note: "The Toxic group is the only one which suggests the content is not legitimate, and has no place on our platform. It is not a just a 'Content guidance' warning as the others are. Consider whether there could be potential reputational damage to the organisation by this content being publicly available on our platform.",
    categories: [
      {
        code: "t/guides-self-harm",
        title: "Guides Self Harm",
        userDescription:
          "guides, instructions or learning materials on how to harm oneself",
        llmDescription:
          "Guides, instructions or learning materials on how to harm oneself.",
      },
      {
        code: "t/guides-harming-others",
        title: "Guides Harming Others",
        userDescription:
          "guides, instructions or learning materials on how to harm others",
        llmDescription:
          "Guides, instructions or learning materials on how to harm others",
      },
      {
        code: "t/creating-chemical-weapons",
        title: "Creating Chemical Weapons",
        userDescription:
          "guides, recipes, instructions or learning materials for creating chemical weapons",
        llmDescription:
          "Guides, recipes, instructions or learning materials for creating chemical weapons",
      },
      {
        code: "t/creating-radioactive-weapons",
        title: "Creating Radioactive Weapons",
        userDescription:
          "guides, recipes, instructions or learning materials for creating radioactive weapons",
        llmDescription:
          "Guides, recipes, instructions or learning materials for creating radioactive weapons",
      },
      {
        code: "t/creating-biological-weapons",
        title: "Creating Biological Weapons",
        userDescription:
          "guides, recipes, instructions or learning materials for creating biological weapons",
        llmDescription:
          "Guides, recipes, instructions or learning materials for creating biological weapons",
      },
      {
        code: "t/creating-harmful-substances",
        title: "Creating Harmful Substances",
        userDescription:
          "guides, recipes, instructions or learning materials for harmful substances",
        llmDescription:
          "Guides, recipes, instructions or learning materials for harmful substances such as illegal drugs or explosives",
      },
      {
        code: "t/encouragement-harmful-behaviour",
        title: "Encouragement of Harmful Behaviour",
        userDescription: "encouragement of harmful behaviour",
        llmDescription: "Encouragement of harmful behaviour",
      },
      {
        code: "t/encouragement-illegal-activity",
        title: "Encouragement of Illegal Activity",
        userDescription: "encouragement of illegal activity",
        llmDescription: "Encouragement of illegal activity",
      },
      {
        code: "t/encouragement-violence",
        title: "Encouragement of Violence",
        userDescription: "encouragement of violence",
        llmDescription: "Encouragement of violence",
      },
    ],
  },
];

export const moderationPrompt = `
OBJECTIVE:

You are a content moderation supervisor examining a additional material resource document which has been generated by a user through interactions with Oak National Academy's additional material resourcening assistant. Your job is to assess and moderate the additional material resource across a variety of categories.

For each category group, you must determine the degree to which the additional material resource is compliant with the following guidelines, providing a single rating on a 1-5 Likert scale that encompasses the following categories.

CATEGORY GROUPS:

${moderationCategories
  .map(
    (categoryGroup) => `<category-group>
'${categoryGroup.title}' contains the following categories:${categoryGroup.categories
      .map(
        (category) => `
- ${category.title}: ${category.llmDescription}`,
      )
      .join("")}

${
  categoryGroup.note
    ? `Note:
${categoryGroup.note}
`
    : ""
}
Rating Criteria:
- 5 ${categoryGroup.criteria5}
- 1 ${categoryGroup.criteria1}
</category-group>

`,
  )
  .join("")}

NOTE:

Your objective is to provide content guidance to ensure that certain content can be flagged with a 'adult supervision recommended/required' label. Regardless of the educational context, the score must be adjusted to reflect the presence of such content, even if the content is presented in a careful, considerate manner.

INSTRUCTION:

Use the above to classify the resource provided, providing a justification for your scores. Your justification should be concise, precise and directly support your rating. A detailed justification is crucial, even for a score of 5.
For each group other than toxic, it's vital that you consider the key-stage (therefore age group) when scoring the content.
`;
