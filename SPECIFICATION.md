# Aila Moderation System Restructure Specification

## Overview

This specification details the complete restructuring of the Aila moderation system from a grouped category approach to individual, independent category assessments. The changes remove the concept of "category groups" and implement each moderation category as a standalone entity with its own scoring criteria and justifications.

## Key Changes Summary

### Current System (Legacy)
- 6 category groups: Language & Discrimination, Violence & Crime, Upsetting/Disturbing/Sensitive, Nudity & Sex, Physical, Toxic
- Each group has multiple sub-categories
- Single score per group with collective justification
- Groups use prefixes (l/, v/, u/, s/, p/, t/)

### New System (Target)
- 28 individual moderation categories
- Each category has its own 1-5 Likert scale score
- Individual justifications for categories scoring < 5
- Abbreviated category codes (l1, l2, u1, u2, etc.)
- No grouping structure - each category is completely independent

## New Category Structure

The new system implements 28 independent categories organized as follows:

### Language Categories (l1-l2)
1. **l1** - Discriminatory behaviour or language
2. **l2** - Language may offend

### Upsetting/Sensitive Categories (u1-u5)
3. **u1** - Sensitive or upsetting content
4. **u2** - Violence or suffering
5. **u3** - Mental health challenges
6. **u4** - Crime or illegal activities  
7. **u5** - Sexual violence

### Sexual Content (s1)
8. **s1** - Nudity or sexual content

### Physical Categories (p2-p5)
9. **p2** - Equipment required
10. **p3** - Risk assessment required
11. **p4** - Outdoor learning
12. **p5** - Additional qualifications required

### Educational Categories (e1)
13. **e1** - RSHE content

### Recent Content Categories (r1-r2)
14. **r1** - Recent content (Post-December 2023 Events)
15. **r2** - Recent or Current Conflicts

### Not-to-be-Planned Categories (n1-n7)
16. **n1** - Self-harm and Suicide
17. **n2** - History of Homosexuality and Gender Identity
18. **n3** - Child specific advice
19. **n4** - Specific Laws
20. **n5** - Health and Safety
21. **n6** - First Aid
22. **n7** - Current Conflicts

### Toxic Categories (t1-t6)
23. **t1** - Guides self-harm or suicide
24. **t2** - Encourages harmful behaviour
25. **t3** - Encourages illegal activity
26. **t4** - Encourages violence or harm to others
27. **t5** - Using or creating weapons
28. **t6** - Using or creating harmful substances

**CRITICAL NOTE**: Categories with prefixes 'n/' and 't/' are binary (score 1 or 5 only). A score of 1-4 on these categories indicates content that should be blocked or flagged as severely non-compliant.

## Implementation Requirements

### Data Structure Changes

#### Core Configuration Structure

**Current Structure (to be removed)**:
```json
[
  {
    "title": "Language and discrimination",
    "codePrefix": "l",
    "criteria5": "(Fully compliant): ...",
    "criteria1": "(Severely non-compliant): ...",
    "note": "...",
    "categories": [
      {
        "code": "l/discriminatory-behaviour",
        "title": "Discriminatory Behaviour",
        "userDescription": "...",
        "llmDescription": "..."
      }
    ]
  }
]
```

**New Structure (to implement)**:
```json
[
  {
    "code": "l/discriminatory-language",
    "title": "Discriminatory behaviour or language",
    "llmDescription": "Flag content depicting or discussing discriminatory behaviour, including historic injustice or outdated representations, based on race, gender, disability, religion, sexual orientation, or other grounds. Include the use of slurs or terms of abuse.",
    "abbreviation": "l1",
    "criteria5": "Not involved: Content contains no discussion or depiction of discriminatory behaviour or language.",
    "criteria4": "Minimally involved: Content makes a brief, passing reference to a discriminatory concept or an outdated social attitude.",
    "criteria3": "Moderately involved: Content includes isolated or historical examples of discriminatory behaviour or language, clearly contextualized for educational or analytical purposes (e.g., studying historical injustice).",
    "criteria2": "Significantly involved: Content centrally discusses or depicts specific instances of discriminatory behaviour or historical injustice as a core part of the lesson.",
    "criteria1": "Heavily involved: Content is focused on depicting or analyzing overt, strong, or frequent discriminatory behaviour or language related to race, gender, disability, religion, or sexual orientation. Includes prominent use of slurs or epithets."
  },
  {
    "code": "l/offensive-language", 
    "title": "Language may offend",
    "llmDescription": "Flag content containing offensive language. This includes swear words, curse words, and terms of racist, ethnic, sexual, or sexist abuse, as well as pejorative terms related to disability, sexuality, or religion. Exclude any language that is used to incite hatred.",
    "abbreviation": "l2",
    "criteria5": "Not involved: Content contains no swear words or otherwise offensive language.",
    "criteria4": "Minimally involved: Content contains a single, mild swear word or a term that could be considered mildly offensive.",
    "criteria3": "Moderately involved: Content contains isolated swear words or offensive terms, often for literary or characterization purposes, and not used gratuitously.",
    "criteria2": "Significantly involved: Content contains multiple instances of offensive language, or a single instance of a particularly strong swear word or abusive term.",
    "criteria1": "Heavily involved: Content contains frequent or strong use of offensive swear words, or terms of racist, sexist, or other abuse."
  },
  {
    "code": "u/sensitive-content",
    "title": "Sensitive or upsetting content",
    "llmDescription": "Flag content depicting or discussing topics that pupils may find sensitive or upsetting. This includes scary, confusing, or unsettling events or situations where individuals are placed in danger; personal safety topics like bullying, peer pressure, feeling unsafe, being asked to keep secrets, and consent; significant life events such as bereavement, death, divorce, adoption, and migration; health and medical topics like illness, injury, disease, medical procedures, references to blood, vaccinations, abortion, euthanasia, and organ donation; substance use, including smoking, vaping, alcohol use, and drug use (legal and illegal); and broader sensitive themes such as climate change, extinction, genetics and inheritance, terrorism, extremism, radicalisation, and household items which could pose a risk.",
    "abbreviation": "u1",
    "criteria5": "Not involved: Content contains no upsetting, disturbing, or sensitive material.",
    "criteria4": "Minimally involved: Content has a brief, non-graphic, or passing reference to a sensitive topic. This could be a mention of smoking, vaping, alcohol use, a reference to blood, or household items which could pose a risk.",
    "criteria3": "Moderately involved: Content mentions sensitive topics, but they are handled with care, are not graphic, and are not the sole focus. Examples include adoption, migration, peer pressure, vaccinations, organ donation, or genetics and inheritance.",
    "criteria2": "Content directly discusses or depicts sensitive topics that are central to the lesson. This includes themes like divorce, consent, substance abuse, climate change, extinction, extremism, or radicalisation.",
    "criteria1": "Heavily involved: Content includes prominent, direct, or potentially graphic depiction/discussion of highly upsetting themes. The primary focus is on a topic such as bereavement, death, serious illness or injury, abortion, euthanasia, terrorism, or significant bullying."
  },
  {
    "code": "u/violence-or-suffering",
    "title": "Violence or suffering",
    "llmDescription": "Flag content depicting or discussing violence or suffering. This includes fighting, war, genocide, death, famine, natural disasters, and animal cruelty.",
    "abbreviation": "u2",
    "criteria5": "Not involved: Content contains no depiction or discussion of violence or suffering.",
    "criteria4": "Minimally involved: Content has a brief, non-graphic, or passing reference to violence or suffering (e.g., a character in a story was in a past war).",
    "criteria3": "Moderately involved: Content mentions violence or suffering (e.g., animal cruelty, historical conflicts), but they are handled with care, are not graphic, and are not the sole focus.",
    "criteria2": "Significantly involved: Content directly discusses or depicts violence, famine, or natural disasters in a way that is central to the lesson (e.g., a history lesson on a specific war).",
    "criteria1": "Heavily involved: Content includes prominent, direct, or potentially graphic depiction/discussion of violence, war, genocide, or intense suffering."
  },
  {
    "code": "u/mental-health-challenges",
    "title": "Mental health challenges",
    "llmDescription": "Flag content depicting or discussing mental health challenges, such as depression, anxiety, eating disorders, and substance abuse. Exclude self-harm, suicide and attempted suicide.",
    "abbreviation": "u3",
    "criteria5": "Not involved: Content contains no discussion of mental health challenges.",
    "criteria4": "Minimally involved: Content has a brief, non-detailed, or passing reference to a mental health challenge.",
    "criteria3": "Moderately involved: Content mentions mental health challenges, such as anxiety or substance abuse, but they are handled with care and are not the sole focus.",
    "criteria2": "Significantly involved: Content directly discusses or depicts mental health challenges as a key theme in a text or as a central part of the lesson.",
    "criteria1": "Heavily involved: The lesson's primary focus is on a specific mental health challenge, such as depression or an eating disorder, with detailed discussion."
  },
  {
    "code": "u/crime-or-illegal-activities",
    "title": "Crime or illegal activities",
    "llmDescription": "Flag content depicting or discussing crime or illegal activities. This includes references to serious violent crimes such as murder, honour-based violence, terrorism, knife crime, and gangs; exploitation and ideological influence like child criminal or sexual exploitation, extremism, and radicalisation; substance and age-related offenses such as the sale or use of illegal drugs, underage alcohol consumption, underage use of cigarettes, and gambling; digital crimes like spreading misinformation (including fake news and deepfakes) and breaking copyright laws; and other illegal acts for minors, such as underage sexual behaviours or getting a tattoo.",
    "abbreviation": "u4",
    "criteria5": "Not involved: Content contains no depiction or discussion of crime or illegal activities.",
    "criteria4": "Minimally involved: Content has a brief, non-graphic, or passing reference to a crime or illegal act.",
    "criteria3": "Moderately involved: Content mentions crime or illegal activities (e.g., spreading misinformation like fake news or deepfakes, copyright infringement, underage use of cigarettes, gambling, or getting a tattoo under the legal age) as a secondary theme or example.",
    "criteria2": "Significantly involved: Content directly discusses or depicts serious crime or illegal activities (e.g., the sale or use of illegal drugs, extremism, radicalisation) as a central part of the lesson.",
    "criteria1": "Heavily involved: The lesson's primary focus is on a specific, serious crime or illegal activity, such as murder, terrorism, knife crime, gangs, child criminal exploitation, or honour-based violence, with direct and detailed discussion."
  },
  {
    "code": "u/sexual-violence",
    "title": "Sexual violence",
    "llmDescription": "Flag content depicting or discussing sexual violence. This includes: sexual abuse, domestic abuse, forced marriage, Female Genital Mutilation (FGM), grooming, exploitation, coercion, harassment, and rape.",
    "abbreviation": "u5",
    "criteria5": "Not involved: Content contains no depiction or discussion of sexual violence.",
    "criteria4": "Minimally involved: Content has a brief, non-graphic, or passing reference to a related topic, such as grooming.",
    "criteria3": "Moderately involved: Content mentions themes of sexual violence (e.g., coercion, harassment) in a non-graphic, contextualized way (e.g., analyzing a literary text).",
    "criteria2": "Significantly involved: Content directly discusses or depicts sexual violence (e.g., forced marriage, domestic abuse, FGM) as a central part of the lesson.",
    "criteria1": "Heavily involved: Content includes prominent, direct, or potentially graphic depiction/discussion of sexual violence, abuse, or exploitation."
  },
  {
    "code": "s/nudity-or-sexual-content",
    "title": "Nudity or sexual content",
    "llmDescription": "Flag content depicting or discussing nudity, sex, or sexual themes. This includes: images or references to nudity (including in art or history), sex, sexual body parts, contraception, sex education, anatomy, relationships, or reproduction.",
    "abbreviation": "s1",
    "criteria5": "Not involved: Content contains no references to nudity or sexual themes.",
    "criteria4": "Minimally involved: An incidental or brief mention of related topics (e.g., a single non-explicit line in a novel about a relationship).",
    "criteria3": "Moderately involved: Content includes nudity in a clear artistic or historical context (e.g., classical statues) or discusses relationships without explicit detail.",
    "criteria2": "Significantly involved: Content directly discusses sexual themes or nudity as a key part of the lesson (e.g., puberty, reproduction, anatomy).",
    "criteria1": "Heavily involved: Content contains prominent or repeated references to nudity, sex, or sexual body parts, or is explicitly focused on sex education."
  },
  {
    "code": "p/equipment-required",
    "title": "Equipment required",
    "llmDescription": "Flag content that requires equipment beyond standard classroom stationery (e.g., art materials, science apparatus, sports equipment).",
    "abbreviation": "p2",
    "criteria5": "Not involved: Involves no equipment beyond standard stationery (pen, paper).",
    "criteria4": "Minimally involved: Requires only one or two simple items beyond stationery (e.g., a ruler, glue stick).",
    "criteria3": "Moderately involved: Requires common non-standard equipment with low inherent risk (e.g., basic art supplies like paint, sports balls, calculators).",
    "criteria2": "Significantly involved: Requires several pieces of non-standard equipment that are key to the lesson's success (e.g., a range of art supplies, specific PE equipment like cones and bibs).",
    "criteria1": "Heavily involved: Requires extensive or specialist equipment beyond what is typically found in a standard classroom (e.g., full science lab apparatus, specific sports kits)."
  },
  {
    "code": "p/equipment-risk-assessment",
    "title": "Risk assessment required",
    "llmDescription": "Flag content that includes physical activities, outdoor and adventurous activities and fieldwork or equipment requiring a risk assessment. This includes use of ingredients or materials that may contain allergens, scissors, chemicals, heat sources, sharp tools, or physically demanding activities.",
    "abbreviation": "p3",
    "criteria5": "Not involved: Involves no activities or equipment that would require a risk assessment.",
    "criteria4": "Minimally involved: Suggests minor physical movement within the classroom where risk is negligible but should be supervised.",
    "criteria3": "Moderately involved: Involves low-risk equipment or activities where a brief, informal risk assessment is advisable (e.g., use of scissors, potential allergens in food tech).",
    "criteria2": "Significantly involved: Involves activities or equipment requiring a formal risk assessment due to potential hazards (e.g., science experiments with heat, use of sharp tools, outdoor fieldwork).",
    "criteria1": "Heavily involved: Involves activities or equipment with high inherent risk requiring a formal, detailed risk assessment (e.g., use of hazardous chemicals, power tools, contact sports)."
  },
  {
    "code": "p/outdoor-learning",
    "title": "Outdoor learning",
    "llmDescription": "Flag content that suggests or requires adventurous or outdoor learning activities taking place outside the classroom, including fieldwork or exploration.",
    "abbreviation": "p4",
    "criteria5": "Not involved: The lesson is designed to take place entirely within the classroom.",
    "criteria4": "Minimally involved: A brief activity is suggested that could take place just outside the classroom door or by a window.",
    "criteria3": "Moderately involved: The lesson suggests an optional or supplementary outdoor activity.",
    "criteria2": "Significantly involved: A major component of the lesson requires being outdoors or in a non-classroom environment on school grounds (e.g., a PE lesson, a science experiment in the playground).",
    "criteria1": "Heavily involved: The entire lesson is designed as an off-site or adventurous outdoor activity (e.g., a geography field trip, a nature walk in a forest)."
  },
  {
    "code": "p/additional-qualifications",
    "title": "Additional qualifications required",
    "llmDescription": "Flag content that includes activities requiring additional qualifications beyond standard teaching certifications (e.g., swimming, trampolining, contact rugby).",
    "abbreviation": "p5",
    "criteria5": "Not involved: Involves no activities that require qualifications beyond standard teaching certifications.",
    "criteria4": "Minimally involved: Involves an activity where extra experience would be beneficial but is not required.",
    "criteria3": "Moderately involved: Recommends specific experience or training but may not require formal certification (e.g., leading complex drama exercises, using specific D&T equipment).",
    "criteria2": "Significantly involved: Requires specific training or qualifications for activities with a moderate level of risk or technical skill (e.g., gymnastics vaulting, rugby tackling).",
    "criteria1": "Heavily involved: Requires specialist teacher qualifications and certifications for high-risk activities (e.g., swimming, trampolining)."
  },
  {
    "code": "e/rshe-content",
    "title": "RSHE content",
    "llmDescription": "Flag content that contains RSHE (Relationships, Sex and Health Education) topics. This includes: relationships, gender, sex education, health, mental wellbeing, bullying, and online harms.",
    "abbreviation": "e1",
    "criteria5": "Not involved: Content has no relation to RSHE topics.",
    "criteria4": "Minimally involved: A brief, passing reference to an RSHE topic (e.g., a character in a story deals with a relationship issue).",
    "criteria3": "Moderately involved: RSHE content is discussed as a secondary topic or example (e.g., discussing healthy eating in a science lesson).",
    "criteria2": "Significantly involved: RSHE content is a key component of the lesson, even if the subject is not RSHE (e.g., a drama lesson about bullying).",
    "criteria1": "Heavily involved: The lesson is primarily focused on a core RSHE topic (e.g., consent, puberty, mental wellbeing, online harms)."
  },
  {
    "code": "r/recent-content",
    "title": "Recent content (Post-December 2023 Events)",
    "llmDescription": "Flag content depicting or discussing events that occurred after December 2023. Exclude armed conflicts.",
    "abbreviation": "r1",
    "criteria5": "Not involved: The lesson contains no references to events after December 2023.",
    "criteria4": "Minimally involved: An incidental or minor reference is made to an event that occurred after December 2023.",
    "criteria3": "Moderately involved: An event after December 2023 is used as a supporting example or a point of discussion.",
    "criteria2": "Significantly involved: A significant portion of the lesson relies on information about an event from after December 2023.",
    "criteria1": "Heavily involved: The lesson's primary focus is an event that occurred after December 2023."
  },
  {
    "code": "r/recent-conflicts",
    "title": "Recent or Current Conflicts",
    "llmDescription": "Flag content depicting or discussing armed conflicts that occurred between 2009 and December 2023. Do not include conflicts ongoing after December 2023.",
    "abbreviation": "r2",
    "criteria5": "Not involved: The lesson contains no references to armed conflicts from 2009 to December 2023.",
    "criteria4": "Minimally involved: An incidental or minor reference is made to an armed conflict from this period.",
    "criteria3": "Moderately involved: An armed conflict from this period is used as a supporting example or case study.",
    "criteria2": "Significantly involved: A significant portion of the lesson is dedicated to discussing an armed conflict from this period.",
    "criteria1": "Heavily involved: The lesson's primary focus is an armed conflict from the 2009 - December 2023 period."
  },
  {
    "code": "n/self-harm-suicide",
    "title": "Self-harm and Suicide",
    "llmDescription": "Block any content that depicts, discusses, guides, or could encourage ideation of self-harm or suicide.",
    "abbreviation": "n1",
    "criteria5": "Compliant: Content does not contain any material related to self-harm or suicide.",
    "criteria1": "Blocked: Content discusses, guides, or could encourage ideation of self-harm or suicide."
  },
  {
    "code": "n/history-homosexuality-gender-identity",
    "title": "History of Homosexuality and Gender Identity",
    "llmDescription": "Block content that depicts or discusses the history of homosexuality or historical/societal views on gender identity.",
    "abbreviation": "n2",
    "criteria5": "Compliant: Content does not contain any material related to the history of homosexuality or gender identity.",
    "criteria1": "Blocked: Content that depicts or discusses the history of homosexuality or historical/societal views on gender identity."
  },
  {
    "code": "n/child-specific-advice",
    "title": "Child specific advice",
    "llmDescription": "Block content that provides guidance or advice for specific children or responds to disclosures.",
    "abbreviation": "n3",
    "criteria5": "Compliant: Content is general and does not provide child-specific advice.",
    "criteria1": "Blocked: Content provides guidance or advice for specific children or responds to disclosures."
  },
  {
    "code": "n/specific-laws",
    "title": "Specific Laws",
    "llmDescription": "Block content that discusses or provides specific legal guidance or advice.",
    "abbreviation": "n4",
    "criteria5": "Compliant: Content does not provide specific legal advice.",
    "criteria1": "Blocked: Content discusses or provides specific legal guidance or advice."
  },
  {
    "code": "n/health-and-safety",
    "title": "Health and Safety",
    "llmDescription": "Block content that provides specific health and safety guidance or instructions.",
    "abbreviation": "n5",
    "criteria5": "Compliant: Content does not provide specific health and safety instructions.",
    "criteria1": "Blocked: Content provides specific health and safety guidance or instructions."
  },
  {
    "code": "n/first-aid",
    "title": "First Aid",
    "llmDescription": "Block content that provides first aid instructions or guidance.",
    "abbreviation": "n6",
    "criteria5": "Compliant: Content does not provide first aid instructions.",
    "criteria1": "Blocked: Content provides first aid instructions or guidance."
  },
  {
    "code": "n/current-conflicts",
    "title": "Current Conflicts",
    "llmDescription": "Block content that depicts or discusses armed conflicts that started or were ongoing after December 2023.",
    "abbreviation": "n7",
    "criteria5": "Compliant: Content does not depict or discuss armed conflicts post-dating December 2023.",
    "criteria1": "Blocked: Content depicts or discusses armed conflicts that started or were ongoing after December 2023."
  },
  {
    "code": "t/guides-self-harm-suicide",
    "title": "Guides self-harm or suicide",
    "llmDescription": "Block any content that encourages, guides, promotes or provides instructions, or learning materials  on how to self-harm or commit suicide.",
    "abbreviation": "t1",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains content that encourages or promotes harming oneself, including self harm or suicide, or provides guides, instructions or learning material on how to do this."
  },
  {
    "code": "t/encourages-harmful-behaviour",
    "title": "Encourages harmful behaviour",
    "llmDescription": "Block content that encourages, guides, promotes or provides instructions, or learning materials  for harmful behaviour. This includes harming others via offesive language, using weapons, engaging in risky sexual behaviour, harassment, spreading misinformation, or using pornography.",
    "abbreviation": "t2",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains content that encourages or promotes harmful or dangerous behaviour, unwanted sexual behaviour, harassment, or misinformation or provides guides, instructions or learning material on how to do."
  },
  {
    "code": "t/encourages-illegal-activity",
    "title": "Encourages illegal activity",
    "llmDescription": "Block content that encourages, guides, promotes or provides instructions, or learning materials on illegal activities for minors (under 18). This includes drug misuse, illegal sexual behaviour, underage purchase/use of alcohol/tobacco/vapes/fireworks, gambling, carrying weapons, sexting, cybercrime, hacking, or county lines involvement.",
    "abbreviation": "t3",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains encouragement of illegal activity for minors (under 18), such as drug misuse, underage drinking, gambling, or cybercrime."
  },
  {
    "code": "t/encourages-violence-harm-others",
    "title": "Encourages violence or harm to others",
    "llmDescription": "Block content that encourages, guides, promotes or provides instructions violent behaviour including sexual violence, carrying a weapon, assault, domestic violence, hate crimes, honour-based violence, harassment, stalking, extortion, threats of violence, indecent exposure, revenge porn, gang involvement, county lines, rioting, arson, cyberbullying, doxxing, or inciting violence online.",
    "abbreviation": "t4",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains any encouragement of violent behaviour, including sexual violence, assault, hate crimes, or inciting violence."
  },
  {
    "code": "t/using-creating-weapons",
    "title": "Using or creating weapons",
    "llmDescription": "Block content that encourages, guides, promotes or provides instructions, recipes or learning materials  for creating or using weapons (including chemical, biological, explosive, or conventional weapons).",
    "abbreviation": "t5",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains any guides, recipes, or instructions for creating or using weapons."
  },
  {
    "code": "t/using-creating-harmful-substances",
    "title": "Using or creating harmful substances",
    "llmDescription": "Block content that encourages, guides, promotes or provides instructions, recipes or learning materials  for creating harmful substances like illegal drugs, poisons, or non-weaponized explosives.",
    "abbreviation": "t6",
    "criteria5": "Fully compliant: Content does not contain any such material.",
    "criteria1": "Severely non-compliant: lesson contains any guides, recipes, or instructions for creating harmful substances like illegal drugs or poisons."
  }
]
```

**Key Changes Required**:
- Remove all 6 group objects with nested categories arrays
- Create 28 individual category objects with complete structure shown above
- Each category must include all 5 criteria levels (criteria1-criteria5)
- Use exact abbreviations from notebook (l1, l2, u1, u2, etc.)
- Copy exact criteria text from notebook data source

##### `/packages/core/src/utils/ailaModeration/moderationPrompt.ts`
- **Action**: Complete rewrite
- **Description**: Replace grouped prompt generation with individual category assessment

**Current Implementation (to be replaced)**:
```typescript
export const moderationPrompt = `
OBJECTIVE:
You are a content moderation supervisor examining a lesson plan document...
For each category group, you must determine the degree to which the lesson plan is compliant...

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
...
`;
```

**New Implementation (to implement)**:
```typescript
export function generateNewModerationPrompt(categories: Array<{
  title: string;
  abbreviation: string; 
  code: string;
  llmDescription: string;
  criteria5: string;
  criteria4: string;
  criteria3: string;
  criteria2: string;
  criteria1: string;
}>): string {
  const categoryDetailsText = categories.map(cat => `
<category>
Category Title: '${cat.title}'
Output Score Code (Abbreviation): '${cat.abbreviation}'
Original Full Code (for context): '${cat.code}'
Description for Assessment: ${cat.llmDescription}
Rating Criteria:
- 5: ${cat.criteria5}
- 4: ${cat.criteria4}
- 3: ${cat.criteria3}
- 2: ${cat.criteria2}
- 1: ${cat.criteria1}
</category>`).join('\n\n');

  return `OBJECTIVE:
You are a content moderation supervisor examining a lesson plan document. Your job is to:
1. Assess the lesson plan against a list of specific content categories detailed below.
2. Provide a 1-5 Likert score for EACH category. A score of 5 means the content is not present or not involved at all.
3. For ANY category that scores less than 5, provide a concise justification explaining why it received that score.

CATEGORIES FOR ASSESSMENT:
${categoryDetailsText}

IMPORTANT NOTES ON SCORING AND JUSTIFICATION:

*   Your primary goal is to provide content guidance. The score for each category must reflect the presence and significance of relevant content.
*   Pay close attention to the 'Original Full Code' provided for each category, especially for those starting with 'n/' (Not to be planned by Aila) or 't/' (Toxic). A score of 1-4 on these indicates serious issues and requires careful justification.
*   For all other categories, when determining a score, consider the Key Stage (age group) of the pupils if Key Stage is specified within the lesson plan.

INSTRUCTION:

Your response MUST be a valid JSON object.
Use the 'Output Score Code (Abbreviation)' provided for each category as the key in your JSON response. All categories listed above MUST be included in your response, even if they score 5. Any category that scores less than 5 must have a justification provided in the 'justifications' object, using the same 'Output Score Code (Abbreviation)' as the key. If all categories score 5, the 'justifications' object must be empty: {}.

Provide a JSON response with the following top-level keys:

1.  'scores': An object.
    *   Keys: The 'Output Score Code (Abbreviation)' (e.g., 'l1, 'u2') for EACH category listed above.
    *   Values: The 1-5 Likert scale rating for that category. EVERY category detailed above MUST have a score in this object using its 'Output Score Code (Abbreviation)'.

2.  'justifications': An object (dictionary).
    *   Keys: The 'Output Score Code (Abbreviation)' of a category ONLY IF its score in the 'scores' object is less than 5.
    *   Values: A string containing a concise, precise justification.
    *   If all categories score 5, this field MUST be an empty object: {}.

3.  'flagged_categories': A list of strings.
    *   Each string must be the 'Output Score Code (Abbreviation)' of a category ONLY IF its score in the 'scores' object is less than 5.
    *   If all categories score 5, this field MUST be an empty list: [].
`;
}

export const moderationPrompt = generateNewModerationPrompt(moderationCategories);
```

##### `/packages/core/src/utils/ailaModeration/moderationSchema.ts`
- **Action**: Major restructure
- **Description**: Update all schemas to support individual category scoring

**Current Schema (to be replaced)**:
```typescript
const moderationScoresSchema = z.object({
  l: likertScale.describe("Language and discrimination score"),
  v: likertScale.describe("Violence and crime score"),
  u: likertScale.describe("Upsetting, disturbing and sensitive score"),
  s: likertScale.describe("Nudity and sex score"),
  p: likertScale.describe("Physical activity and safety score"),
  t: likertScale.describe("Toxic score"),
});

export const moderationCategoriesSchema = z.array(
  z.union([
    z.literal("l/discriminatory-behaviour"),
    z.literal("l/language-may-offend"),
    // ... existing category codes
  ])
);
```

**New Schema (to implement)**:
```typescript
// Dynamic schema generation based on categories
const likertScale = z.number().int().min(1).max(5);

// Generate individual score fields dynamically (28 total categories)
// Generate dynamic score fields from all 28 categories
const scoreFields = {
  l1: likertScale.describe("Discriminatory behaviour or language score"),
  l2: likertScale.describe("Language may offend score"),
  u1: likertScale.describe("Sensitive or upsetting content score"),
  u2: likertScale.describe("Violence or suffering score"),
  u3: likertScale.describe("Mental health challenges score"),
  u4: likertScale.describe("Crime or illegal activities score"),
  u5: likertScale.describe("Sexual violence score"),
  s1: likertScale.describe("Nudity or sexual content score"),
  p2: likertScale.describe("Equipment required score"),
  p3: likertScale.describe("Risk assessment required score"),
  p4: likertScale.describe("Outdoor learning score"),
  p5: likertScale.describe("Additional qualifications required score"),
  e1: likertScale.describe("RSHE content score"),
  r1: likertScale.describe("Recent content score"),
  r2: likertScale.describe("Recent or Current Conflicts score"),
  n1: likertScale.describe("Self-harm and Suicide score"),
  n2: likertScale.describe("History of Homosexuality and Gender Identity score"),
  n3: likertScale.describe("Child specific advice score"),
  n4: likertScale.describe("Specific Laws score"),
  n5: likertScale.describe("Health and Safety score"),
  n6: likertScale.describe("First Aid score"),
  n7: likertScale.describe("Current Conflicts score"),
  t1: likertScale.describe("Guides self-harm or suicide score"),
  t2: likertScale.describe("Encourages harmful behaviour score"),
  t3: likertScale.describe("Encourages illegal activity score"),
  t4: likertScale.describe("Encourages violence or harm to others score"),
  t5: likertScale.describe("Using or creating weapons score"),
  t6: likertScale.describe("Using or creating harmful substances score")
};

const moderationScoresSchema = z.object(scoreFields);

// Create union type for all 28 category abbreviations
export const moderationCategoriesSchema = z.array(
  z.union([
    z.literal("l1"), z.literal("l2"),
    z.literal("u1"), z.literal("u2"), z.literal("u3"), z.literal("u4"), z.literal("u5"),
    z.literal("s1"),
    z.literal("p2"), z.literal("p3"), z.literal("p4"), z.literal("p5"),
    z.literal("e1"),
    z.literal("r1"), z.literal("r2"),
    z.literal("n1"), z.literal("n2"), z.literal("n3"), z.literal("n4"),
    z.literal("n5"), z.literal("n6"), z.literal("n7"),
    z.literal("t1"), z.literal("t2"), z.literal("t3"), z.literal("t4"),
    z.literal("t5"), z.literal("t6")
  ])
);

export const moderationResponseSchema = z.object({
  scores: moderationScoresSchema,
  justifications: z.record(z.string(), z.string()).describe("Justifications for scores < 5"),
  flagged_categories: moderationCategoriesSchema,
});
```

#### 2. Frontend Components

##### `/apps/nextjs/src/components/AppComponents/Chat/toxic-moderation-view.tsx`
- **Action**: Update to handle new category structure
- **Description**: Modify component to work with individual categories instead of groups
- **Changes**:
  - Update props to accept individual category data
  - Modify display logic for new category structure
  - Handle abbreviated codes in UI

##### `/apps/nextjs/src/components/AppComponents/FeedbackForms/ModerationFeedbackForm.tsx`
- **Action**: Update form fields and validation
- **Description**: Adapt form to work with new category structure
- **Changes**:
  - Update form fields for individual categories
  - Modify validation logic
  - Handle new API response format

##### `/apps/nextjs/src/components/AppComponents/FeedbackForms/ModerationFeedbackModal.tsx`
- **Action**: Update modal content structure
- **Description**: Adapt modal to display individual category results
- **Changes**:
  - Update display components for new data structure
  - Modify modal layout for individual categories

##### `/apps/nextjs/src/components/ContextProviders/ChatModerationContext.tsx`
- **Action**: Update context to handle new data structure
- **Description**: Modify context provider for individual categories
- **Changes**:
  - Update context type definitions
  - Modify state management for new structure
  - Update context methods

#### 3. Store Management

##### `/apps/nextjs/src/stores/moderationStore/types.ts`
- **Action**: Complete type definition overhaul
- **Description**: Update all types for individual category structure
- **Changes**:
  - Define new interfaces for individual categories
  - Update moderation result types
  - Remove group-based type definitions
  - Add types for abbreviated codes

##### `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleFetchModeration.tsx`
- **Action**: Update API integration
- **Description**: Modify to handle new API response format
- **Changes**:
  - Update API call expectations
  - Modify response parsing logic
  - Handle new category structure in state updates

##### `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleToxicModeration.tsx`
- **Action**: Update toxic content handling
- **Description**: Adapt to new toxic category structure (t1-t6)
- **Changes**:
  - Update logic to check individual toxic categories
  - Modify toxic content detection
  - Handle new abbreviated codes

##### `/apps/nextjs/src/stores/moderationStore/actionFunctions/handleUpdateModerationState.tsx`
- **Action**: Update state management
- **Description**: Modify state updates for new structure
- **Changes**:
  - Update state update logic
  - Handle individual category results
  - Modify state shape for new data structure

#### 4. API Integration

##### `/packages/aila/src/features/moderation/AilaModeration.ts`
- **Action**: Major refactor
- **Description**: Update core moderation logic for individual categories
- **Changes**:
  - Modify prompt generation for new structure
  - Update LLM response parsing
  - Handle new schema validation
  - Update error handling for new format

##### `/packages/api/src/router/moderations.ts`
- **Action**: Update API endpoints
- **Description**: Modify tRPC endpoints for new data structure
- **Changes**:
  - Update input/output schemas
  - Modify endpoint logic for individual categories
  - Update database interactions
  - Handle new response format

#### 5. Database Integration

##### `/packages/core/src/models/moderations.ts`
- **Action**: Update database models
- **Description**: Modify models to support new category structure
- **Changes**:
  - Update Prisma model interactions
  - Modify database query logic
  - Handle new data structure in persistence
  - Update model type definitions

##### `/packages/db/prisma/zod-schemas/moderation.ts`
- **Action**: Update Zod schemas
- **Description**: Modify schemas for new database structure
- **Changes**:
  - Update Zod validation schemas
  - Modify field definitions
  - Handle new category structure
  - Update type generation

#### 6. Additional Materials Integration

##### `/packages/additional-materials/src/moderation/moderationPrompt.ts`
- **Action**: Update additional materials moderation
- **Description**: Align with new moderation structure
- **Changes**:
  - Update prompt generation
  - Modify category assessment logic
  - Handle new response format
  - Update integration with core moderation

##### `/packages/additional-materials/src/moderation/generateAdditionalMaterialModeration.ts`
- **Action**: Update generation logic
- **Description**: Modify to work with new category structure
- **Changes**:
  - Update moderation generation
  - Handle new API responses
  - Modify result processing
  - Update error handling

#### 7. Testing Infrastructure

##### Test Files to Update:
- All E2E test recordings in `/apps/nextjs/tests-e2e/recordings/`
- Unit tests in store action functions
- API integration tests
- Component tests that interact with moderation data

### API Response Changes

**Current API Response Format**:
```json
{
  "scores": {
    "l": 5,
    "v": 3,
    "u": 4,
    "s": 5,
    "p": 5,
    "t": 5
  },
  "justifications": {
    "v": "Content discusses historical violence in educational context"
  },
  "flagged_categories": ["v"]
}
```

**New API Response Format**:
```json
{
  "scores": {
    "l1": 5, "l2": 5,
    "u1": 4, "u2": 3, "u3": 5, "u4": 5, "u5": 5,
    "s1": 5,
    "p2": 5, "p3": 5, "p4": 5, "p5": 5,
    "e1": 5,
    "r1": 5, "r2": 5,
    "n1": 5, "n2": 5, "n3": 5, "n4": 5, "n5": 5, "n6": 5, "n7": 5,
    "t1": 5, "t2": 5, "t3": 5, "t4": 5, "t5": 5, "t6": 5
  },
  "justifications": {
    "u1": "Content discusses sensitive topic in educational context",
    "u2": "Historical violence discussed as core lesson content"
  },
  "flagged_categories": ["u1", "u2"]
}
```

## Implementation Scope

This restructure affects multiple layers of the application:

### Core Data Layer
- Configuration files (JSON category definitions)
- Schema definitions (Zod validation schemas)
- TypeScript type definitions

### AI Integration Layer  
- Prompt generation for LLM assessment
- Response parsing and validation
- Error handling for new format

### Database Layer
- Database model interactions
- Data persistence and retrieval

### Frontend Layer
- State management (Zustand stores)
- UI components displaying moderation results
- Form validation and user feedback

### Testing Layer
- Unit tests for new schemas and logic
- Integration tests for API changes
- E2E test recordings with new format

## Implementation Tasks

Detailed implementation tasks, dependencies, testing requirements, and validation criteria are provided in `TODO.md`. The implementation must be completed in the specified sequence due to critical dependencies between components.

**Critical Dependency Discovered**: Additional materials moderation system must be updated before database layer completion due to schema format incompatibility (`moderationResponseSchema` vs `ModerationResult`).

## Success Criteria

The implementation will be considered successful when:
1. All 28 categories are assessed independently with individual scores
2. LLM generates proper justifications for categories scoring < 5
3. API responses use abbreviated codes (l1, l2, etc.)
4. Frontend displays individual category results clearly
5. All existing functionality continues to work
6. Performance remains acceptable
7. All tests pass with new implementation
8. No regression in moderation accuracy or user experience

This specification defines the requirements for transitioning from the grouped moderation system to 28 individual category assessments while maintaining system reliability and user experience. Implementation details and task breakdown are available in `TODO.md`.