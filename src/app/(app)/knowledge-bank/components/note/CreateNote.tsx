/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./textEditor.css";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { getNote, updateNote } from "@/apis/notes-bookmarks";
import { Loader } from "rizzui";
import AccessPage from "./AccessPage";
import NoteNameSetDialog from "../../dialog/NoteNameSetDialog";
import ShareNotesDialog from "../../dialog/ShareNotesDialog";
import RequestToEditorDialog from "../../dialog/RequestToEditorDialog";
import DataNotFound from "./DataNotFound";
import { NotesAndBookmarksItem, Request } from "../../utils/types";
import { CreateNoteBody } from "@/apis/notes-bookmarks/types";
import QuillEditor from "./QuillEditor";
import { useRouter } from "next-nprogress-bar";
import { IoChevronBack } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import RenameNoteTitleDialog from "../../dialog/RenameNoteTitleDialog";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { updateRecentActivity } from "@/apis/recent-activities";

const CreateNote = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug.length - 1];
  const folder_id = slug?.[slug.length - 3];
  const { socket } = useSocket();
  const supabase: SupabaseClient = createClient();
  const [description, setDescription] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [show, setShow] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [isComment, setIsComment] = useState(false);
  const [accessRequest, setAccessRequest] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [noteTitle, setNoteTitle] = useState<string | null>("");
  const [isSingleNote, setIsSingleNote] = useState<
    NotesAndBookmarksItem | undefined
  >();
  const [saveLoading, setSaveLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [myMemberInfo, setMyMemberInfo] = useState<Request>();
  const [renameNoteTitleDialogShow, setRenameNoteTitleDialogShow] =
    useState<boolean>(false);
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);

  const { setValue } = useForm({
    defaultValues: {
      title: "",
      link: "",
      description: "",
      image: null,
    },
  });

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (socket) {
      socket.emit("texteditor-description", value);
    }
  };

  const handleShare = () => {
    if (!readOnly) {
      noteTitle === null || noteTitle === "Untitled Document" || !noteTitle
        ? setShowNameDialog(true)
        : setShow(true);
    } else {
      setShowRequestDialog(true);
    }
  };

  const fetchAndSetReadOnly = async (data: NotesAndBookmarksItem) => {
    try {
      const memberSingleData = data?.members?.find(
        (item) => item?.email === userInfo?.email
      );

      if (memberSingleData?.role === "Owner") {
        setAccessRequest(false);
        setReadOnly(false);
        setIsComment(true);
      } else {
        if (data?.public) {
          if (data?.public_role === "Editor") {
            setAccessRequest(false);
            setReadOnly(false);
            setIsComment(true);
          } else if (data?.public_role === "Viewer") {
            if (memberSingleData?.role === "Editor") {
              setAccessRequest(false);
              setReadOnly(false);
              setIsComment(true);
              setIsComment(true);
            } else {
              setAccessRequest(false);
              setReadOnly(true);
              setIsComment(false);
            }
          } else {
            setAccessRequest(false);
            setReadOnly(true);
            setIsComment(true);
          }
        } else {
          if (memberSingleData?.role === "Editor") {
            setAccessRequest(false);
            setReadOnly(false);
            setIsComment(true);
          } else if (memberSingleData?.role === "Viewer") {
            setAccessRequest(false);
            setReadOnly(true);
            setIsComment(false);
          } else if (memberSingleData?.role === "Commenter") {
            setAccessRequest(false);
            setReadOnly(true);
            setIsComment(true);
          } else {
            setAccessRequest(true);
            setReadOnly(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const addDocument = async () => {
    setSaveLoading(true);
    const body: CreateNoteBody = {
      type: "note",
      title: "Untitled Document",
      document_id: id,
      folder_id: folder_id ? folder_id : 0,
      workspace_id: workspace?.id,
      project_id: project?.id,
      user_id: userInfo?.id,
      description,
      members: [
        {
          email: userInfo?.email,
          role: "Owner",
        },
      ],
    };
    if (socket) {
      socket.emit("save-document", id, body);
    }
  };

  const getNoteFunction = useCallback(async () => {
    return await getNote(id);
  }, [id, userInfo]);

  const renameTitle = async (data: { title: string }) => {
    const body = { title: data?.title };
    const activityBody = { activity: data?.title };
      const response = await updateNote(id, body);
    await updateRecentActivity(id, activityBody);
    

    if (response?.isSuccess === true) {
      setNoteTitle(data?.title);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit("document_id", id);
      socket.on("update-texteditor-description", (content) => {
        setValue("description", content);
        setDescription(content);
      });

      socket.on(
        "update-save-document",
        (content: {
          data: NotesAndBookmarksItem;
          message: string;
          success: boolean;
        }) => {
          if (content?.success) {
            const memberSingleData = content?.data?.members?.find(
              (item) => item?.email === userInfo?.email
            );
            setMyMemberInfo(memberSingleData);
            setSaveLoading(false);
            setIsSave(true);
            fetchAndSetReadOnly(content?.data);
            setNoteTitle(content?.data?.title);
          }
        }
      );

      socket.on("updateValue", (data) => {
        if (id === data?.document_id) {
          setIsSingleNote(data);
          setNoteTitle(data?.title);
          fetchAndSetReadOnly(data);
        }
      });

      return () => {
        socket.off("update-texteditor-description");
        socket.off("update-save-document");
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const apiRes: {
          data: NotesAndBookmarksItem;
          message: string;
          success: boolean;
        } = await getNoteFunction();

        if (apiRes?.success) {
          const memberSingleData = apiRes?.data?.members?.find(
            (item) => item?.email === userInfo?.email
          );
          setDescription(apiRes?.data?.description);
          setMyMemberInfo(memberSingleData);
          setNoteTitle(apiRes?.data?.title);
          setIsSingleNote(apiRes?.data);
          setIsDeleted(apiRes?.data?.soft_delete);
          fetchAndSetReadOnly(apiRes?.data);
          setIsSave(true);
        } else {
          setAccessRequest(false);
          setReadOnly(false);
          setIsSave(false);
        }
      } catch (error) {
        console.error("Error creating note:", error);
      }
      setLoading(false);
    };

    fetchNote();
  }, [id, userInfo?.id]);

  useEffect(() => {
    if (socket) {
      const timer = setTimeout(() => {
        socket.emit("auto-save", id, description);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [socket, description]);

  if (loading) {
    return (
      <div className="h-[85vh] flex justify-center items-center">
        <Loader variant="threeDot" size="lg" />
      </div>
    );
  } else if (isDeleted) {
    return <DataNotFound />;
  } else if (accessRequest) {
    return <AccessPage isSingleNote={isSingleNote} />;
  }
  return (
    <>
      <div className="flex items-center bg-headerBackground px-[24px] pb-[18px] justify-between relative top-[-1px]">
        <div className="flex items-center gap-1 mb-[2.4rem] relative left-[-6px]">
          <IoChevronBack
            className="text-3xl cursor-pointer"
            onClick={() => router.back()}
          />

          <h2 className="font-size-bold font-poppins text-black dark:text-white flex items-center">
            Note
            {noteTitle && (
              <>
                <span className="mx-2">/</span>
                <span className="max-w-[23rem] whitespace-nowrap overflow-hidden text-ellipsis">
                  {noteTitle}
                </span>
                <CiEdit
                  className="ms-2 text-2xl"
                  onClick={() => setRenameNoteTitleDialogShow(true)}
                />
              </>
            )}
          </h2>
        </div>
      </div>
      <div>
        <div className="relative m-[24px] quill-editor">
          <QuillEditor
            saveLoading={saveLoading}
            isSave={isSave}
            myMemberInfo={myMemberInfo}
            isComment={isComment}
            readOnly={readOnly}
            description={description}
            addDocument={addDocument}
            handleShare={handleShare}
            setShowRequestDialog={setShowRequestDialog}
            handleDescriptionChange={handleDescriptionChange}
          />

          {showNameDialog && (
            <NoteNameSetDialog
              showNameDialog={showNameDialog}
              setShowNameDialog={setShowNameDialog}
              setShow={setShow}
              setNoteTitle={setNoteTitle}
            />
          )}

          {show && (
            <ShareNotesDialog
              show={show}
              setShow={setShow}
              noteTitle={noteTitle}
              setNoteTitle={setNoteTitle}
              isSingleNote={isSingleNote}
              getSingleNote={() => id}
            />
          )}

          {showRequestDialog && (
            <RequestToEditorDialog
              noteName={noteTitle}
              showRequestDialog={showRequestDialog}
              setShowRequestDialog={setShowRequestDialog}
            />
          )}

          <RenameNoteTitleDialog
            renameNoteTitleDialogShow={renameNoteTitleDialogShow}
            setRenameNoteTitleDialogShow={setRenameNoteTitleDialogShow}
            renameTitle={renameTitle}
            noteTitle={noteTitle}
          />
        </div>
      </div>
    </>
  );
};

export default CreateNote;
