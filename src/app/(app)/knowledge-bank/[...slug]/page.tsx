"use client";

import { useParams } from "next/navigation";
import React from "react";
import CreateNote from "../components/note/CreateNote";
import { NotesAndBookmarksView } from "../components/notesAndBookmarkList/NotesAndBookmarksView";
import CreateBookmark from "../components/bookmark/CreateBookmark";

const Page = () => {
  const params = useParams();
  const { slug } = params;
  const slugName = slug?.[slug?.length - 2];

  return (
    <div>
      {slugName === "note" ? (
        <CreateNote />
      ) : slugName === "bookmark" ? (
        <CreateBookmark />
      ) : (
        <NotesAndBookmarksView />
      )}
    </div>
  );
};

export default Page;
