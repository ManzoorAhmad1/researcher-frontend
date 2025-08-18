export const scamperData = [
  {
    title: "Substitute",
    question: "What elements could be substituted?",
    ans: "",
    id: 1,
    icon: "substitute.png",
    interested: false,
    references: "",
  },
  {
    title: "Combine",
    question: "What ideas or components can be combined?",
    ans: "",
    id: 2,
    icon: "combine.png",
    interested: false,
    references: "",
  },
  {
    title: "Adapt",
    question: "How can this be adapted from something else?",
    ans: "",
    id: 3,
    icon: "adapt.png",
    interested: false,
    references: "",
  },
  {
    title: "Modify",
    question: "What can be modified, magnified, or minified?",
    ans: "",
    id: 4,
    icon: "modify.png",
    interested: false,
    references: "",
  },
  {
    title: "Put to other use",
    question: "How else can this be used?",
    ans: "",
    id: 5,
    icon: "put-other-use.png",
    interested: false,
    references: "",
  },
  {
    title: "Eliminate",
    question: "What can be removed or simplified?",
    ans: "",
    id: 6,
    icon: "eliminate.png",
    interested: false,
    references: "",
  },
  {
    title: "Rearrange",
    question: "What can be rearranged or reversed?",
    ans: "",
    id: 7,
    icon: "rearrange.png",
    interested: false,
    references: "",
  },
];

export const topic = [
  { label: "Topics ", value: "Topics" },
  { label: "Questions", value: "Questions" },
];

export const openAImodelKey = "openai/gpt-4o-mini";

export function createScampArray(text: string) {
  const jsonMatch = text.match(/{[\s\S]*}/);
  const cleanedJSON = jsonMatch ? jsonMatch[0] : null;

  try {
    return cleanedJSON ? JSON.parse(cleanedJSON) : null;
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return null;
  }
}
