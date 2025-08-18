import { ExplorerView } from "@/components/Explorer/ExplorerView";
import { mockData } from "@/mockData/mockData";

export default function Explorer() {
  return <ExplorerView data={mockData} showFolders />;
}
