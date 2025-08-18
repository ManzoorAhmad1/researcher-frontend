/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import ListingCommentsDialog from "../../dialog/ListingCommentsDialog";
import AddCommentsDialog from "../../dialog/AddCommentsDialog";
import toast from "react-hot-toast";
import { BsInfoCircle } from "react-icons/bs";
import { LoaderCircle } from "lucide-react";
import ListingBookmarkCommentsDialog from "../../dialog/ListingBookmarkCommentsDialog";

const BookmarhQuillEditor = ({
  show,
  setShow,
  readOnly,
  isOwner,
  myMemberInfo,
  addComment,
  description,
  setCommentsData,
  setCommentsDialogShow,
  handleDescriptionChange,
}: any) => {
  const quillRef = useRef<HTMLDivElement | null>(null);
  const [quill, setQuill] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.document) {
      const quillEditor = document.getElementById("quill-editor");
      if (quillEditor) {
        const toolbarElements = quillEditor.getElementsByClassName(
          "ql-toolbar ql-snow"
        ) as HTMLCollectionOf<HTMLElement>;

        if (toolbarElements.length > 1) {
          toolbarElements[0].style.display = "none";
        } else if (toolbarElements.length === 1) {
          toolbarElements[0].style.display = "";
        }
      }
    }
  }, [quill]);

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [{ list: "ordered" }],
    [{ list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
  ];

  const debouncedHandleChange = useCallback(
    debounce((htmlContent: string) => {
      handleDescriptionChange(htmlContent);
    }, 200),
    [handleDescriptionChange]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && quillRef.current && !quill) {
      import("quill").then((QuillModule) => {
        const Quill = QuillModule.default || QuillModule;

        if (quillRef.current) {
          const editor = new Quill(quillRef.current, {
            modules: {
              toolbar: toolbarOptions,
            },
            theme: "snow",
          });
          setQuill(editor);
        }
      });
    }
  }, [quill]);

  useEffect(() => {
    if (quill && quill.root.innerHTML !== description) {
      const formattedHTML = description || "";
      quill.clipboard.dangerouslyPasteHTML(formattedHTML);
    }
  }, [description, quill]);

  useEffect(() => {
    if (quill) {
      const handleTextChange = () => {
        const htmlContent = quill.root.innerHTML;
        debouncedHandleChange(htmlContent);
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill, debouncedHandleChange]);

  useEffect(() => {
    if (quill) {
      quill.enable(!readOnly);
    }
  }, [readOnly, quill]);

  const handleAddComments = (editor: any) => {
    if (!editor) return;

    const range = editor.getSelection();
    if (range && range.length > 0) {
      const id = new Date().getTime();
      editor.formatText(range.index, range.length, { id });
      const selectedText = editor.getText(range.index, range.length);
      setCommentsDialogShow(true);
      setCommentsData({ id, selectedText, range });
    } else {
      toast((t) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <BsInfoCircle className="text-[#17a2b8] me-[8px]" />
          <span>Please select text</span>
        </div>
      ));
    }
  };

  useEffect(() => {
    handleAddComments(quill);
  }, [addComment]);

  return (
    <div id="quill-editor">
      <div ref={quillRef} />
      <ListingBookmarkCommentsDialog
        isOwner={isOwner}
        show={show}
        quill={quill}
        setShow={setShow}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(BookmarhQuillEditor), {
  ssr: false,
});
