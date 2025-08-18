export const dropdown1 = [
  { label: "Academic", value: "Academic" },
  { label: "Formal", value: "Formal" },
  { label: "Consulting", value: "Consulting" },
  { label: "Content Creator", value: "Content Creator" },
];

export const Academic = [
  { label: "High School", value: "High School", complexity: 2 },
  { label: "Undergraduate", value: "Undergraduate", complexity: 3 },
  { label: "Postgraduate", value: "Postgraduate", complexity: 4 },
  { label: "Doctoral", value: "Doctoral", complexity: 5 },
];
export const Formal = [
  { label: "Entry Level", value: "Entry Level", complexity: 2 },
  { label: "Intermediate", value: "Intermediate", complexity: 3 },
  { label: "Advanced", value: "Advanced", complexity: 4 },
  { label: "Expert", value: "Expert", complexity: 5 },
];
export const Consulting = [
  { label: "Business", value: "Business", complexity: 2 },
  { label: "Enterprise", value: "Enterprise", complexity: 3 },
  { label: "Executive", value: "Executive", complexity: 4 },
  { label: "Strategic", value: "Strategic", complexity: 5 },
];
export const ContentCreator=[
  { label: "Blog", value: "Blog", complexity: 2 },
  { label: "eBook", value: "eBook", complexity: 3 },
]
export const openAImodelKey = "openai/gpt-4o-mini";

export function createScampArray(text: string) {
  // Use a regex to capture only the JSON object part
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) {
    throw new Error("Invalid JSON format");
  }

  const cleanedJSON = jsonMatch[0];
  return JSON.parse(cleanedJSON);
}

export const dropdownOptions: any = {
  Academic,
  Formal,
  Consulting,
  ContentCreator
};
