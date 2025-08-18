/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useState } from "react";
import ExportSideBar from "../../../sidebar/ExportSideBar";
import ShareSideBar from "../../../sidebar/ShareSideBar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  filterNotesBookmarkAllData,
  getNotesBookmarkAllData,
  setPagination,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import {
  DeleteDialogInfo,
  GridViewProps,
  notesBookmarksitem,
} from "../../../utils/types";
import { useParams } from "next/navigation";
import FolderView from "./FolderView";
import NoteView from "./NoteView";
import BookmarkView from "./BookmarkView";
import { Loader } from "rizzui";
import { AddTagsButton } from "../../../dialog/AddTagsButton";
import Pagination from "@/components/coman/Pagination";
import DeleteDialog from "../../../dialog/DeleteDialog";
import {
  deleteBookmarkFile,
  deleteFolderApi,
  deleteSoftNote,
} from "@/apis/notes-bookmarks";

const GridView: React.FC<GridViewProps> = ({ selectedOption }) => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const { slug } = params;
  const [openDropdownId, setOpenDropdownId] = useState<number | null>();
  const [visible, setVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [tageId, setTageId] = useState("");
  const { notesBookmarksDatas, pagination, loading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const { perPageLimit, currentPage } = pagination;
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);
  const [deleteDialogInfo, setDeleteDialogInfo] = useState<DeleteDialogInfo>({
    id: "",
    name: "",
    type: "",
    show: false,
  });

  const [shareId, setShareId] = useState("");
  const handlePageChange = (value: number) => {
    dispatch(setPagination({ currentPage: value }));
  };

  const handlePerPageChange = (limit: number) => {
    dispatch(setPagination({ perPageLimit: limit, currentPage: 1 }));
  };

  const handleDropdownToggle = (id: number) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const deleteFunction = async () => {
    const { type, id } = deleteDialogInfo || {};
    let apiRes;

    if (type === "folder") {
      apiRes = await deleteFolderApi(id);
    } else if (type === "note") {
      apiRes = await deleteSoftNote(id);
    } else {
      apiRes = await deleteBookmarkFile(id);
    }

    if (apiRes?.success) {
      setDeleteDialogInfo((prev) => ({ ...prev, show: false }));
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getNotesBookmarkAllData({
          id: slug?.length > 0 ? slug[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
    }
  };

  useEffect(() => {
    if (perPageLimit && currentPage && workspace?.id) {
      if (selectedOption) {
        dispatch(
          filterNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            body: {
              type: selectedOption,
              workspace_id: workspace?.id,
              project_id: project?.id,
            },
            currentPage,
            perPageLimit,
          })
        );
      } else {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      }
    }
  }, [dispatch, perPageLimit, currentPage, workspace?.id]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-72 lg:col-span-3 xl:col-span-4">
          <p className="text-md text-center text-[#64748B]">
            <Loader variant="threeDot" size="lg" />
          </p>
        </div>
      ) : notesBookmarksDatas?.data?.length > 0 ? (
        <>
          <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
            {notesBookmarksDatas?.data?.map(
              (item: notesBookmarksitem, i: number) => {
                if (item?.type === "folder") {
                  return (
                    <FolderView
                      i={i}
                      key={i}
                      item={item}
                      setVisible={setVisible}
                      openDropdownId={openDropdownId}
                      setShareVisible={setShareVisible}
                      setOpenDropdownId={setOpenDropdownId}
                      setDeleteDialogInfo={setDeleteDialogInfo}
                      handleDropdownToggle={handleDropdownToggle}
                    />
                  );
                }
                if (item?.type === "note") {
                  return (
                    <NoteView
                      i={i}
                      key={i}
                      item={item}
                      setTageId={setTageId}
                      setVisible={setVisible}
                      setShareId={setShareId}
                      openDropdownId={openDropdownId}
                      setShareVisible={setShareVisible}
                      setOpenDropdownId={setOpenDropdownId}
                      setDeleteDialogInfo={setDeleteDialogInfo}
                      handleDropdownToggle={handleDropdownToggle}
                    />
                  );
                } else {
                  return (
                    <BookmarkView
                      i={i}
                      key={i}
                      item={item}
                      setTageId={setTageId}
                      setVisible={setVisible}
                      openDropdownId={openDropdownId}
                      setShareVisible={setShareVisible}
                      setOpenDropdownId={setOpenDropdownId}
                      setDeleteDialogInfo={setDeleteDialogInfo}
                      handleDropdownToggle={handleDropdownToggle}
                    />
                  );
                }
              }
            )}
          </div>
          <div className="border-tableBorder mt-6  pt-1 pb-3 rounded-lg mb-16 bg-[#F5F5F5] dark:bg-[#202D32]">
            <Pagination
              totalPages={notesBookmarksDatas?.total}
              handlePagination={handlePageChange}
              currentPage={currentPage as number}
              perPageLimit={perPageLimit as number}
              handlePerPageChange={handlePerPageChange}
            />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-72 lg:col-span-3 xl:col-span-4">
          No data found
        </div>
      )}

      {visible && (
        <ExportSideBar
          shareId={shareId}
          visible={visible}
          setVisible={setVisible}
        />
      )}

      {shareVisible && (
        <ShareSideBar
          shareId={shareId}
          shareVisible={shareVisible}
          setShareVisible={setShareVisible}
        />
      )}
      {tageId && (
        <AddTagsButton
          tageId={tageId}
          isOpen={true}
          onOpenChange={() => setTageId("")}
        />
      )}

      <DeleteDialog
        deleteDialogInfo={deleteDialogInfo}
        setDeleteDialogInfo={setDeleteDialogInfo}
        deleteFunction={deleteFunction}
      />
    </>
  );
};

export default GridView;
