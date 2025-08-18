import { getWordCloudData, saveWordCloudData } from "@/apis/files";
// import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { PDFData as PDFDataType } from "@/types/types";
import { LoaderCircle, LoaderCircleIcon, X } from "lucide-react";
import jsPDF from "jspdf";
import ReactWordcloud from "react-wordcloud";
import { Dialog, Transition } from "@headlessui/react";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoundBtn from "@/components/ui/RoundBtn";
import { setNewResearchKeywords } from "@/apis/workspaces";
import { addKeywords } from "@/reducer/global-search/globalSearchSlice";
import toast from "react-hot-toast";
import WordCloudListInfo from "./WordCloudListInfo";

interface WordCloudDialogProps {
  showWordCloud: boolean;
  setShowWordCloud: (showWordCloud: boolean) => void;
  id: string | undefined;
  PDFData: PDFDataType | any;
}

const WordCloudDialog: React.FC<WordCloudDialogProps> = ({
  PDFData,
  showWordCloud,
  setShowWordCloud,
  id,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [wordCloudGen, setWordCloudGen] = useState<any>([]);
  const [newWords, setNewWords] = useState<any>([]);
  const [updatingNewWords, setupdatingNewWords] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user.user);
  const { keywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const handleDialogClose = () => {
    if (!visible) {
      setShowWordCloud(false);
    }
  };

  useEffect(() => {
    if (showWordCloud) {
      setLoading(true);
      const fetchPdf = async () => {
        try {
          const response = (await getWordCloudData(id)) as any;
          if (response?.data?.isSuccess) {
            setError(false);
            const topWords = response?.data?.data?.top_words || [];
            setWordCloudGen(topWords);
          } else {
            setError(true);
          }
        } catch (error) {
          console.error("Failed to fetch relative PDF:", error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPdf();
      if (PDFData?.pdf_search_data?.wordcloudData) {
        setNewWords(PDFData?.pdf_search_data?.wordcloudData);
      } else {
        setNewWords([]);
      }
    }
  }, [showWordCloud, id]);

  const options: any = {
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
    enableTooltip: true,
    deterministic: true,
    fontFamily: "impact",
    fontSizes: [20, 60],
    fontStyle: "normal",
    fontWeight: "normal",
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: "log",
    spiral: "archimedean",
    transitionDuration: 1000,
  };

  const handleWordClick = async (word: any, event: MouseEvent) => {
    const alreadyExists = keywords.some(
      (kw: string) => kw.toLowerCase() === word.text.toLowerCase()
    );
    const alreadyInNewWords = newWords.some(
      (w: string) => w.toLowerCase() === word.text.toLowerCase()
    );

    if (alreadyExists) {
      toast.error(`“${word.text}” already have in list.`);
    } else {
      // setNewWords((prev: string[]) => {
      //   if (!prev.includes(word.text)) {
      //     return [...prev, word.text];
      //   }
      //   return prev;
      // });
      // toast.success(`“${word.text}” selected. Don’t forget to click ‘Save’ to confirm your changes.`);
      const updatedWords = [...newWords, word.text];
      setNewWords(updatedWords);
      
      const addAndSave = async () => {
        await dispatch(
          addKeywords({ userId: user?.id, newWords: updatedWords }) as any
        );
        await saveWordCloudData(id, updatedWords);
      };

      try {
        // await dispatch(
        //   addKeywords({ userId: user?.id, newWords: updatedWords }) as any
        // );
        // await saveWordCloudData(id, updatedWords);
        // toast.success(`“${word.text}” added and saved successfully.`);
        await toast.promise(addAndSave(), {
          loading: `Adding "${word.text}"...`,
          success: `“${word.text}” added and saved successfully.`,
          error: `Failed to add “${word.text}”.`,
        });
      } catch (error) {
        toast.error("Failed to save keyword.");
        console.error(error);
      }
    }
  };

  const handleRemoveWordClick = (word: any) => {
    setNewWords((prev: string[]) => prev.filter((w) => w !== word));

    toast.error(`"${word}" is removed from the list`);
  };

  const handleSaveKeywords = async () => {
    try {
      setupdatingNewWords(true);
      await dispatch(addKeywords({ userId: user?.id, newWords }) as any);
      await saveWordCloudData(id, newWords);
      // console.log(response, "the responseresponse");
    } catch (error) {
      console.log(error);
    } finally {
      setupdatingNewWords(false);
      // setNewWords([])
    }
  };

  const callbacks: any = {
    onWordClick: handleWordClick,
  };

  const handleDownload = (item: string) => {
    const svgElement = chartContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const svgSize = svgElement.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const jpegUrl = canvas.toDataURL("image/jpeg", 1.0);

      const downloadLink = document.createElement("a");
      if (item === "PNG") {
        downloadLink.href = pngUrl;
      } else {
        downloadLink.href = jpegUrl;
      }
      downloadLink.download = `wordcloud.${item.toLowerCase()}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
  };

  const handleDownloadPDF = () => {
    const svgElement = chartContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as any;

    const svgSize = svgElement.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff"; // white background
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save("wordcloud.pdf");
    };

    img.src = url;
  };

  return (
    <>
      <Transition appear show={showWordCloud} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleDialogClose}
          initialFocus={dialogContentRef}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  ref={dialogContentRef}
                  className="w-full max-w-[70rem] h-[95vh] transform overflow-auto rounded-2xl bg-white dark:bg-[#152428] p-6 text-left align-middle shadow-xl transition-all"
                  id="chart-container"
                >
                  <div className="flex items-center mb-4 gap-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold dark:text-[#BEBFBF]"
                    >
                      Word Cloud
                    </Dialog.Title>
                    <div className="flex gap-4 items-center">
                      {!loading && !error && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleDownload("PNG")}
                            className="button-full w-[145px] cursor-pointer select-none text-nowrap"
                          >
                            Download as PNG
                          </button>
                          <button
                            onClick={() => handleDownload("JPG")}
                            className="button-full w-[145px] cursor-pointer select-none text-nowrap"
                          >
                            Download as JPG
                          </button>
                          <button
                            onClick={handleDownloadPDF}
                            className="button-full w-[145px] cursor-pointer select-none text-nowrap"
                          >
                            Download as PDF
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => setVisible(true)}
                        className="button-full w-[145px] cursor-pointer select-none text-nowrap"
                      >
                        Saved Keywords
                      </button>
                    </div>
                    <button
                      onClick={() => setShowWordCloud(false)}
                      className="absolute right-4 !focus:outline-none rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                      aria-label="Close dialog"
                    >
                      <X className="h-8 w-8" />
                    </button>
                  </div>
                  {/* <button
                    onClick={() => setShowWordCloud(false)}
                    className="absolute right-4 top-4 !focus:outline-none rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    aria-label="Close dialog"
                  >
                    <X className="h-8 w-8" />
                  </button> */}

                  {loading ? (
                    <div className="flex items-center justify-center h-[80vh]">
                      <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-[80vh]">
                      No data available
                    </div>
                  ) : (
                    <div className="h-[80vh] relative" ref={chartContainerRef}>
                      <ReactWordcloud
                        options={options}
                        words={wordCloudGen}
                        callbacks={callbacks}
                      />
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {visible && (
        <WordCloudListInfo
          visible={visible}
          setVisible={setVisible}
          singleData={{}}
        />
      )}
    </>
  );
};

export default WordCloudDialog;
