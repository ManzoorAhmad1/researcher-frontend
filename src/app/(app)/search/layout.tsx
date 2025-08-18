import { ExplorerTabs } from "@/components/Explorer/ExplorerTabs";
import { HeaderTitle } from "@/components/Header/HeaderTitle";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RESEARCH COLAB",
  description: "RESEARCH COLAB",
};

export default function ExplorerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <HeaderTitle name={"Search Results"} />
      </div>
      <ExplorerTabs hideAddFolderButton>
        <div>{children}</div>
      </ExplorerTabs>
    </main>
  );
}
