import { useMemo } from "react";
import { Text } from "rizzui";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sentences = useMemo(
    () => [
      "Smart Research, Simplified — Find papers that matter to your work.",
      "Organize notes, citations and ideas in one place for faster progress.",
      "Discover collaborators and share your findings effortlessly.",
      "Curated recommendations tailored to your research interests.",
      "Track the latest publications in your field without the noise.",
      "Turn reading into action with annotatations and highlights.",
      "Create project dashboards to manage experiments and milestones.",
      "Search across papers, notes and projects from a single interface.",
      "Export references and share reading lists with your team.",
      "Save time with automated literature summarization tools.",
      "Build a private library for reproducible research workflows.",
      "Monitor citations and impact metrics on your work.",
      "Stay organized with task and deadline integration built-in.",
      "Connect your reading to code, data and notebooks seamlessly.",
      "Maintain versioned notes so your research story stays clear.",
      "Collaborative annotations to speed up peer feedback cycles.",
      "Keep sensitive research private with secure sharing controls.",
      "Smart alerts for papers that match your evolving interests.",
      "Focus on insight, not administration — let the tool organize for you.",
      "Integrate your reference manager and keep everything in sync.",
      "Find gaps in literature and plan the next experiment quickly.",
      "Capture ideas instantly with quick note creation from anywhere.",
      "Tailored feeds that respect your focus areas and filters.",
      "Centralize project assets: papers, data, and discussions.",
      "Easily revisit saved searches and curated collections.",
      "Share progress with stakeholders using concise reports.",
      "Automate repetitive literature review tasks with smart filters.",
      "Pin important findings and link them to your hypotheses.",
      "Collaborative folders to manage group reading lists and tasks.",
      "A single, distraction-free place designed for researchers.",
    ],
    []
  );

  // simple random sentence per visit
  const sentence = useMemo(() => {
    const idx = Math.floor(Math.random() * sentences.length);
    return sentences[idx];
  }, [sentences]);

  return (
    <div className="min-h-screen w-full flex flex-col-reverse lg:flex-row">
      <main className="flex-1 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <aside className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-6 h-28 lg:h-auto">
        <div className="text-center max-w-xl">
          <Text className="font-poppins text-base lg:text-xl font-semibold mb-4">
            {sentence}
          </Text>
        
        </div>
      </aside>
    </div>
  );
}
