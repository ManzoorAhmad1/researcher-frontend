import FileCharts from "./Filechart";
import NetworkChart from "./NetworkChart";
import RcTreeFolder from "./Rctree";
export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full flex items-center justify-center mt-4">
        <p>File formating 1</p>
      </div>
      <main className="w-full flex min-h-screen flex-col items-center justify-between mt-4">
        <RcTreeFolder />
      </main>
      <div className="w-full flex items-center justify-center">
        <p>File formating 2</p>
      </div>
      <div className="w-screen h-screen">
        <NetworkChart />
      </div>
      <div className="w-full flex items-center justify-center">
        <p>File formating 3</p>
      </div>
      <FileCharts />
    </div>
  );
}
