import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 font-semibold text-white"
    >
      <span>ResearchCollab.ai</span>
    </Link>
  );
}
