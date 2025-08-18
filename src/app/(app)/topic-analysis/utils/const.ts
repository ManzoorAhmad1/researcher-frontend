export function convertToJson(text: string) {
  const jsonMatch = text.match(/{[\s\S]*}/);
  const cleanedJSON = jsonMatch ? jsonMatch[0] : null;

  try {
    return cleanedJSON ? JSON.parse(cleanedJSON) : null;
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return null;
  }
}

export const openAImodelKey = "openai/gpt-4o-mini";

export const expert_advice = [
  {
    title: "Summaries and Synthesis",
    opportunities: "",
    expert_insight: "",
    risks_challenges: "",
    guiding_questions: "",
    real_world_examples: "",
  },
];

export function generateHTML(data: any) {
  let markdownContent = "";

  if (data?.entry_summaries) {
    markdownContent += `### Entry Summaries\n`;
    data.entry_summaries.forEach((summary: any) => {
      markdownContent += `- ${summary}\n`;
    });
  }

  if (data?.synthesis) {
    markdownContent += `\n### Synthesis\n`;
    data.synthesis.forEach((point: any) => {
      markdownContent += `- ${point}\n`;
    });
  }

  data?.expert_advice?.forEach((item: any) => {
    markdownContent += `
### ${item.title}

**Opportunities:** ${item.opportunities}

**Expert Insight:** ${item.expert_insight}

**Risks & Challenges:** ${item.risks_challenges}

**Guiding Questions:** ${item.guiding_questions}

**Real-World Examples:** ${item.real_world_examples}
`;
  });

  return markdownContent;
}
