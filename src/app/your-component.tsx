import { MultiSelect } from "@/components/ui/multi-select";
import { useState } from "react";

const dummyEmails = [
  { value: "john@example.com", label: "John Doe" },
  { value: "jane@example.com", label: "Jane Smith" },
  { value: "bob@example.com", label: "Bob Johnson" },
  { value: "alice@example.com", label: "Alice Williams" },
  { value: "charlie@example.com", label: "Charlie Brown" },
];

export default function YourComponent() {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  return (
    <div className="w-[350px]">
      <MultiSelect
        options={dummyEmails}
        selected={selectedEmails}
        onChange={setSelectedEmails}
        placeholder="Select team members..."
      />
      
      {/* Display selected emails */}
      <div className="mt-4">
        <h3>Selected Emails:</h3>
        {selectedEmails.map((email) => (
          <div key={email}>{email}</div>
        ))}
      </div>
    </div>
  );
} 