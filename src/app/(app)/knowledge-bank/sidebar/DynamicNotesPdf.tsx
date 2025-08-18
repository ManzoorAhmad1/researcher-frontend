import dynamic from "next/dynamic";

// Dynamically import the NotesPdf component with SSR disabled
const DynamicNotesPdf = dynamic(() => import("./NotesPdf"), { ssr: false });

export default DynamicNotesPdf;
