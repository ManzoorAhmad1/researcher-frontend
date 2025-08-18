import { TagItems } from "./Tags";

export default function Tags() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Tags</h1>
      </div>
      <div
        x-chunk="An empty state showing no products with a heading, description and a call to action to add a product."
        className="flex flex-1 rounded-lg">
        <div className="flex flex-col">
          <TagItems />
        </div>
      </div>
    </main>
  );
}
