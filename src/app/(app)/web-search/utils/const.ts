export const openAImodelKey = "openai/gpt-4o-mini";

export const exploreResearchTopicsData = [
  {
    bgLightIconColor: "#0E70FFC7",
    cardDarkBg: "#0E70FF29",
    cardLightBg: "#A5C9FF",
    aiTopic: "",
  },
  {
    bgLightIconColor: "#09B02D",
    cardDarkBg: "#079E2829",
    cardLightBg: "#ADFFBF",
    aiTopic: "",
  },
  {
    bgLightIconColor: "#F59B14",
    cardDarkBg: "#F59B1429",
    cardLightBg: "#FAD59F",
    aiTopic: "",
  },
  {
    bgLightIconColor: "#CB19B1",
    cardDarkBg: "#CB19B129",
    cardLightBg: "#FFCEF8",
    aiTopic: "",
  },
  {
    bgLightIconColor: "#A9D431",
    cardDarkBg: "#A9D43129",
    cardLightBg: "#E9FFAD",
    aiTopic: "",
  },
];

export function createExploreResearchArray(text: string) {
  const cleanedJSON = text?.replace(/```json|```/g, "").trim();
  return JSON?.parse(cleanedJSON);
}
