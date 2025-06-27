import type { ComprehensionTask as ComprehensionTaskType } from "@oakai/additional-materials/src/documents/additionalMaterials/comprehension/schema";

import type { Meta, StoryObj } from "@storybook/react";

import { chromaticParams } from "@/storybook/chromatic";

import { ComprehensionTask } from "./ComprehensionTask";

export const comprehensionFixture: ComprehensionTaskType = {
  comprehension: {
    lessonTitle: "The End of Roman Britain",
    yearGroup: "Year 5",
    subject: "History",
    instructions:
      "Read the text carefully and use it to answer the questions below.",
    text: `The end of Roman Britain is a fascinating period that marked a significant change in the history of the British Isles. 
Roman Britain, which had been under Roman control for nearly four centuries, faced numerous challenges that eventually led to the withdrawal of Roman forces and the end of Roman rule. \n

One of the primary challenges was economic. 
The Roman Empire was vast, and maintaining control over such a large area required substantial resources. 
In Roman Britain, heavy taxation was imposed on the local population to fund the empire's needs. 
This taxation, combined with inflation, where the value of money decreased and prices increased, placed a significant burden on the people. 
As a result, the economy struggled, and dissatisfaction grew among the inhabitants. \n

In addition to economic difficulties, Roman Britain faced military challenges. 
The Roman legions, which were large units of soldiers, were stretched thin across the empire. 
Barbarian groups, a term used by the Romans to describe people outside their empire, began to invade Roman territories. 
These invasions put immense pressure on the Roman military, which was already struggling to defend its borders. 
The situation worsened when, in 410 AD, the Roman legions were withdrawn from Britain. 
The Roman Empire was under threat from various fronts, and the legions were needed elsewhere. 
This withdrawal marked the official end of Roman rule in Britain. 
Without the protection of the Roman army, Britain was left vulnerable to invasions and internal conflicts. \n

The end of Roman Britain had a profound impact on society. 
The infrastructure, such as roads and buildings, which had been maintained by the Romans, began to deteriorate. 
The absence of a centralised Roman government led to the rise of local leaders and the eventual formation of new kingdoms. 
This period of transition laid the foundation for the medieval history of Britain. \n

Understanding the end of Roman Britain involves recognising the economic and military challenges that led to the withdrawal of Roman forces. 
It also requires evaluating the impact of this withdrawal on British society, which saw the decline of Roman influence and the emergence of new social and political structures.`,
    questions: [
      {
        questionNumber: 1,
        questionText: "How long was Britain under Roman control?",
        answer: "Nearly four centuries.",
      },
      {
        questionNumber: 2,
        questionText: "What were two main challenges faced by Roman Britain?",
        answer: "Economic difficulties and military challenges.",
      },
      {
        questionNumber: 3,
        questionText:
          "Why was heavy taxation imposed on the people of Roman Britain?",
        answer: "To fund the needs of the Roman Empire.",
      },
      {
        questionNumber: 4,
        questionText: "What happened to the Roman legions in 410 AD?",
        answer: "They were withdrawn from Britain.",
      },
      {
        questionNumber: 5,
        questionText:
          "What impact did the withdrawal of Roman forces have on Britain?",
        answer:
          "Britain became vulnerable to invasions and internal conflictsBritain became vulnerable to invasions and internal conflicts.Britain became vulnerable to invasions and internal conflicts.Britain became vulnerable to invasions and internal conflicts.",
      },
      {
        questionNumber: 6,
        questionText:
          "What happened to Roman infrastructure after the end of Roman rule?",
        answer: "It began to deteriorate.",
      },
      {
        questionNumber: 7,
        questionText:
          "What new developments occurred in Britain after the Romans left?",
        answer: "Local leaders rose to power and new kingdoms were formed.",
      },
    ],
  },
};

const meta: Meta<typeof ComprehensionTask> = {
  title: "Components/AdditionalMaterials/ComprehensionTask",
  component: ComprehensionTask,
  parameters: {
    // Including custom decorators changes the layout from fullscreen
    layout: "fullscreen",
    ...chromaticParams(["mobile", "desktop"]),
  },
};
export default meta;

type Story = StoryObj<typeof ComprehensionTask>;

export const Default: Story = {
  args: {
    action: "view",
    generation: comprehensionFixture,
  },
};
