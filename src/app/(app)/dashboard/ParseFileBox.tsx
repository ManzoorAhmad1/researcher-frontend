import Uploader from "@/components/Uploader/Uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ParseFileBox() {
  const userMemoryUsed = 2;
  const userMemoryLimit = 10;
  const userParsedFiles = 50;
  const userParseLimit = 100;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card
        className="sm:col-span-2 flex flex-col justify-between h-full bg-blueTh"
        x-chunk="dashboard-05-chunk-0"
      >
        <CardHeader className="pb-3">
          <CardTitle>Upload PDF File</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Upload your PDF files to parse and extract necessary information.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="bg-black rounded-lg">
            <Uploader button={true} />
          </div>
        </CardFooter>
      </Card>
      <Card
        className="flex flex-col justify-between h-full bg-purpleTh"
        x-chunk="dashboard-05-chunk-1"
      >
        <CardHeader className="pb-2">
          <CardDescription>Memory Usage</CardDescription>
          <CardTitle className="text-3xl">
            {userMemoryUsed}GB / {userMemoryLimit}GB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Used memory for storing parsed files
          </div>
        </CardContent>
        <CardFooter>
          <Progress
            value={(userMemoryUsed / userMemoryLimit) * 100}
            aria-label={`${
              (userMemoryUsed / userMemoryLimit) * 100
            }% memory used`}
          />
        </CardFooter>
      </Card>
      <Card
        className="flex flex-col justify-between h-full bg-greenTh"
        x-chunk="dashboard-05-chunk-2"
      >
        <CardHeader className="pb-2">
          <CardDescription>Parsing Quota</CardDescription>
          <CardTitle className="text-3xl">
            {userParsedFiles} / {userParseLimit}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Parsed files this month
          </div>
        </CardContent>
        <CardFooter>
          <Progress
            value={(userParsedFiles / userParseLimit) * 100}
            aria-label={`${
              (userParsedFiles / userParseLimit) * 100
            }% quota used`}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
