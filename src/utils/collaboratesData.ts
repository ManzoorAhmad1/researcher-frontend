import ActivePaper from "@/images/userProfileIcon/activePaper";
import ResearchPaper from "@/images/userProfileIcon/researchPaper";
import IdeaBank from "@/images/userProfileIcon/ideaBank";
import SharedResources from "@/images/userProfileIcon/sharedResources";

interface Bookmark {
  title: string;
  description: string;
  tag: string;
}

interface Section {
  name: string;
  bookmarks: Bookmark[];
}

interface Card {
    icon: React.ElementType;
    title: string;
  count: number;
  description: string;
  bgColor: string;
}

interface ProjectDescription {
  papers: string;
  resources: string;
  bookmarks: string;
}

interface ActiveProject {
  title: string;
  description: ProjectDescription;
  teamMembers: string[];
}

interface ResearchIdea {
  title: string;
  description: string;
  tags: string[];
}

interface SharedNote {
  title: string;
  description: string;
  sharedTo: string[];
}

interface KeyResearchQuestion {
  question: string;
  tags: string[];
  relatedPapers: number;
}

interface Favorite {
  title: string;
  type: string;
  author: string;
  addedOn: string;
}

interface AIInsight {
  insight: string;
  tags: string[];
  confidence: string;
}

export const sectionsData: Section[] = [
  {
    name: "Research Method",
    bookmarks: [
      {
        title: "Research Methodology Overview",
        description: "Comprehensive guide to research methodologies",
        tag: "Methodology",
      },
      {
        title: "Statistical Analysis Tools",
        description: "Collection of statistical analysis resources",
        tag: "Statistics",
      },
    ],
  },
  {
    name: "Literature Reviews",
    bookmarks: [],
  },
  {
    name: "Academic Writing",
    bookmarks: [],
  },
];

export const cardsData: Card[] = [
  {
    icon: ActivePaper,
    title: "ACTIVE PROJECTS",
    count: 5,
    description: "Researchers Involved",
    bgColor: "bg-[#F59B1436]",
  },
  {
    icon: ResearchPaper ,
    title: "RESEARCH PAPERS",
    count: 5,
    description: "Under Analysis",
    bgColor: "bg-[#079E2833]",
  },
  {
    icon: IdeaBank,
    title: "IDEAS BANK",
    count: 5,
    description: "Potential Projects",
    bgColor: "bg-[#AF2FEC33]",
  },
  {
    icon: SharedResources ,
    title: "SHARED COMMENTS",
    count: 5,
    description: "Across All Projects",
    bgColor: "bg-[#0E70FF33]",
  },
];

export const activeProjects: ActiveProject[] = [
  {
    title: "Energy Market Dynamics",
    description: {
      papers: "4 papers",
      resources: "3 resources",
      bookmarks: "8 bookmarks",
    },
    teamMembers: [
      "https://randomuser.me/api/portraits/women/40.jpg",
      "https://randomuser.me/api/portraits/men/41.jpg",
      "https://randomuser.me/api/portraits/women/42.jpg",
      "https://randomuser.me/api/portraits/men/43.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
    ],
  },
  {
    title: "Renewable Integration",
    description: {
      papers: "3 papers",
      resources: "5 resources",
      bookmarks: "12 bookmarks",
    },
    teamMembers: [
      "https://randomuser.me/api/portraits/women/45.jpg",
      "https://randomuser.me/api/portraits/men/46.jpg",
      "https://randomuser.me/api/portraits/women/47.jpg",
      "https://randomuser.me/api/portraits/men/48.jpg",
      "https://randomuser.me/api/portraits/women/49.jpg",
    ],
  },
];

export const researchIdeas: ResearchIdea[] = [
  {
    title: "Carbon Trading Mechanisms",
    description: "Exploring efficiency of different carbon pricing models",
    tags: ["Bookmarks"],
  },
  {
    title: "Energy Storage Economics",
    description: "Cost-benefit analysis of grid scale storage solutions",
    tags: ["Notes"],
  },
];

export const sharedNotes: SharedNote[] = [
  {
    title: "Meeting Notes",
    description: "Notes from the weekly team meeting.",
    sharedTo: [
      "https://randomuser.me/api/portraits/women/40.jpg",
      "https://randomuser.me/api/portraits/women/41.jpg",
      "https://randomuser.me/api/portraits/women/42.jpg",
      "https://randomuser.me/api/portraits/women/43.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/45.jpg",
    ],
  },
  {
    title: "Project Updates",
    description: "Summary of the recent project updates.",
    sharedTo: [
      "https://randomuser.me/api/portraits/men/46.jpg",
      "https://randomuser.me/api/portraits/women/47.jpg",
      "https://randomuser.me/api/portraits/men/48.jpg",
    ],
  },
];

export const keyResearchQuestions: KeyResearchQuestion[] = [
  {
    question: "How do regional energy market structures influence renewable energy adoption rates?",
    tags: ["Market Analysis"],
    relatedPapers: 3,
  },
  {
    question: "What is the impact of carbon pricing on energy market equilibrium?",
    tags: ["Market Analysis"],
    relatedPapers: 2,
  },
  {
    question: "What role do subsidies play in shaping renewable energy transitions?",
    tags: ["Policy Impact"],
    relatedPapers: 4,
  },
  {
    question: "How does energy policy influence innovation in renewable technologies?",
    tags: ["Policy Impact"],
    relatedPapers: 5,
  },
];

export const favorites: Favorite[] = [
  {
    title: "The Future of Battery Technology in Electric Vehicles",
    type: "Papers",
    author: "John Doe",
    addedOn: "Jan 5, 2025",
  },
  {
    title: "The Future of Battery Technology in Electric Vehicles",
    type: "Papers",
    author: "John Doe",
    addedOn: "Jan 5, 2025",
  },
  {
    title: "The Future of Battery Technology in Electric Vehicles",
    type: "Papers",
    author: "John Doe",
    addedOn: "Jan 5, 2025",
  },
  {
    title: "The Future of Battery Technology in Electric Vehicles",
    type: "Papers",
    author: "John Doe",
    addedOn: "Jan 5, 2025",
  },
];

export const aiInsights: AIInsight[] = [
  {
    insight: "Strong correlation between carbon pricing mechanisms and renewable energy investment patterns across studied markets.",
    tags: ["Energy Market Dynamics", "Carbon Trading"],
    confidence: "89.0%",
  },
  {
    insight: "Multiple research streams indicate synergies between energy storage economics and market stability.",
    tags: ["Storage Economics", "Market Dynamics"],
    confidence: "92.0%",
  },
  {
    insight: "Emerging research gap in quantifying indirect economic benefits of distributed energy resources",
    tags: ["Renewable Integration"],
    confidence: "42.0%",
  },
];

export const DummyData = [
    {
        heading: "Autonomous Cognitive Systems and Human - AI Collaborative Decision Making",
        tags: ["12 bookmarks", "8 notes", "16 images"]
    },
    {
        heading: "Responsible AI development and societal Impact Assessment",
        tags: ["12 bookmarks", "8 notes", "16 images"]
    }
];
