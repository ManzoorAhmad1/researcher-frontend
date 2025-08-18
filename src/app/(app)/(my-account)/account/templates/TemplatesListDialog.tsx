import React, { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, shallowEqual } from "react-redux";
import { Loader, Progressbar } from "rizzui";
import toast from "react-hot-toast";
import Typewriter from "typewriter-effect";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { addSpaceBeforeCapitalWords } from "@/utils/commonUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomInput } from "@/components/ui/customInput";
import {
  createTemplates,
  duplicateTemplates,
  updateTemplates,
} from "@/apis/templates";
import { UploadTemplateFile } from "@/apis/upload";
import {
  fetchPdfMetadataAPI,
  newResearchPaperPrompt,
  toPascalCaseWithUnderscore,
  toPascalCaseWithSpaces,
  extractFileData,
  newPaperAnalysisTemplateData,
} from "@/utils/commonUtils";
import { RootState } from "@/reducer/store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { PromptDetail } from "@/types/types";
import "./index.css";

interface FormData {
  name: string;
  templates: string;
  id?: Number;
}
interface AddTemplateDialogProps {
  isOpen: string;
  onOpenChange: (open: boolean) => void;
  template: {
    status: string;
    template: string;
    template_name: string;
    id: string;
    straico_file_url: string;
    template_json_data: Object;
    paper_analysis_data: Object;
    template_title?: string;
    projects_using?: number; 
    total_files?: number;
  };
  handleGetTemplates: (restrictRefresh: boolean) => void;
}
interface MyObjectType {
  [key: string]: string[];
}

const TemplatesListDialog = ({
  isOpen,
  onOpenChange,
  template,
  handleGetTemplates,
}: AddTemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [generateTemplate, setGenerateTemplate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState<number>(0);
  const [showAnalyzingProgressBar, setShowAnalyzingProgressBar] =
    useState<number>(0);
  const [detailItems, setDetailItems] = useState<PromptDetail[]>([]);
  const [finalKeyPrompt, setfinalKeyPrompt] = useState<
    | PromptDetail[]
    | MyObjectType
    | {
        id: number;
        promptKey: string;
        conversionPromptKey: string;
        promptQuestion: {
          id: number;
          question: string;
        }[];
        type: string;
      }[]
  >([]);
  const [extractData, setExtractData] = useState<MyObjectType | null | any>(
    null
  );
  const [startUpload, setStartUpload] = useState<boolean>(false);
  const [loaderStatus, setLoaderStatus] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState<string>("");
  const [templatePDFUrl, settemplatePDFUrl] = useState<string>("");

  const dispatch: AppDispatch = useDispatch();
  const methods = useForm<FormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    watch,
  } = methods;
  const { back, push } = useRouter();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const pathname = usePathname();
  const currentProject = useSelector(
    (state: any) => state?.project,
    shallowEqual
  );
  const openAImodelKey = "openai/gpt-4o-mini";
  const toPascalCaseWithUnderscore = (str: string) => {
    return str.replace(/\s+/g, "_");
  };
  const { user } = useSelector(
    (state: RootState) => state.user?.user || "",
    shallowEqual
  );

  const handleEditSubmit = async (data: FormData) => {
    setLoading(true);
    if (
      newsLetterWatch === methods?.formState?.defaultValues?.name &&
      templatesDescription === methods?.formState?.defaultValues?.templates
    ) {
      setLoading(false);
      const newUrl = `${window.location.origin}/template-editor?templateId=${data.id}&templateName=${data.name}&templateStatus=${template.status}`;
      navigateTemplate(newUrl);
    } else {
      try {
        const response: any = await updateTemplates(
          {
            template_name: data?.name,
            template: data?.templates,
          },
          data?.id as number
        );
        if (response) {
          toast.success(response?.data?.message);
          handleGetTemplates(true);
          onOpenChange(false);
          const { id, template, template_name, status } =
            response.data.templates;

          const newUrl = `${window.location.origin}/template-editor?templateId=${id}&templateName=${template_name}&templateStatus=${status}`;
          navigateTemplate(newUrl);
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      const response: any = await createTemplates({
        template_title: `${data?.name} Template`,
        template_name: data?.name,
        template: data?.templates,
        status: "live",
        projects_using: 0,
        type: "Custom",
        ai_model: openAImodelKey,
        ...(finalKeyPrompt &&
          generateTemplate == "generate_template" && {
            straico_file_url: templatePDFUrl,
            template_json_data: finalKeyPrompt,
          }),
      });

      onOpenChange(false);
      document.getElementById("close-dialog")?.click();
      reset();

      if (response) {
        toast.success(response?.data?.message);
        handleGetTemplates(true);
        const { id, template, template_name, status } =
          response?.data?.template;
        const newUrl = `${window.location.origin}/template-editor?templateId=${id}&templateName=${template_name}&templateTeam=${template}&templateStatus=${status}`;
        navigateTemplate(newUrl);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateTemplate = (newUrl: string) => {
    push(newUrl);
  };

  const handleTemplateDuplication = async (data: FormData) => {
    try {
      setLoading(true);

      const response = await duplicateTemplates({
        template_title: template?.template_title,
        template_name: data?.name,
        template: template?.template,
        status: "live",
        projects_using: 0,
        type: "Custom",
        ai_model: openAImodelKey,
        ...(finalKeyPrompt && {
          straico_file_url: template.straico_file_url,
          template_json_data: template.template_json_data,
          paper_analysis_data: template.paper_analysis_data,
        }),
      });
      onOpenChange(false);
      reset();

      if (response) {
        toast.success(response?.data?.message);
        handleGetTemplates(true);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const incrementProgress = async (target: number) => {
    const current = await new Promise<number>((resolve) => {
      setShowProgressBar((prev) => {
        resolve(prev);
        return prev;
      });
    });

    for (let i: number = current; i <= target; i += 5) {
      setShowProgressBar(i);
      await delay(100);
    }
  };
  const incrementAnalyzingProgress = async (target: number) => {
    const current = await new Promise<number>((resolve) => {
      setShowAnalyzingProgressBar((prev) => {
        resolve(prev);
        return prev;
      });
    });

    for (let i: number = current; i <= target; i += 5) {
      setShowAnalyzingProgressBar(i);
      await delay(100);
    }
  };

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const keyConversion = () => {
    const keyConversionValue = newResearchPaperPrompt.map((value: any) => {
      return {
        ...value,
        conversionPromptKey: toPascalCaseWithUnderscore(value.promptKey),
      };
    });

    setDetailItems(keyConversionValue);
  };

  useEffect(() => {
    keyConversion();
  }, []);
  useEffect(() => {
    if (!!template && !!isOpen) {
      reset({
        name: template?.template_name,
        templates: template?.template,
        id: template?.id,
      });
    }
  }, [template, isOpen, reset]);
  let newsLetterWatch: string | undefined = watch("name");
  let templatesDescription: string | undefined = watch("templates");

  const uploadPaper = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf";
    input.multiple = false;
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      let files: File[] = [];
      if (target.files && target.files[0]) {
        const selectedFile = target.files[0];
        const reader = new FileReader();
        reader.onload = async () => {
          files = [selectedFile];
        };
        reader.readAsDataURL(selectedFile);
      }
      try {
        setStartUpload(true);
        setSaving(true);
        setLoaderStatus(true);
        setLoaderText("Uploading.......");
        await incrementProgress(20);
        await delay(1000);

        const formData = new FormData();
        files?.forEach((file: File) => formData?.append("files", file));
        formData?.append("templateName", newsLetterWatch)
        await incrementProgress(40);
        await delay(100);

        formData?.append("pathSegments", pathname?.replace("/explorer", ""));
        const folderId = getLastItemFromUrl(pathname);
        setLoaderText("Analyzing.......");
        await incrementProgress(55);
        await delay(500);

        const parent_id = pathname.startsWith("/explorer")
          ? typeof folderId === "number"
            ? folderId
            : ""
          : "";

        await incrementProgress(70);
        await delay(100);

        const result = await UploadTemplateFile(
          formData,
          currentProject?.project?.id,
          parent_id
        );
        if (result.error) {
          setStartUpload(false)
          setLoaderStatus(false);
          await incrementProgress(100);
          await delay(1000);
          setShowProgressBar(0);
          toast.error(result.message || "Error uploading files");
          setError("name", {
            type: "required",
            message:result.message,
          })
        } else {
          await incrementProgress(100);
          await delay(1000);
          setLoaderText("Thinking.......");
          await uploadDoc(result.fileData[0]);

          setShowProgressBar(0);
          toast.success(result?.message);
        }

      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Error uploading files");
      } finally {
        setSaving(false);
      }
    };
    input.click();
  };

  const filterNonEmptyData = (data: Record<string, string[]>): MyObjectType => {
    return Object.fromEntries(
      Object.entries(data).filter(([key, values]) => {
        return values.some((value) => value.trim() !== "");
      })
    );
  };

  

  const uploadDoc = async (pdfUrl: string) => {
    try {
      await incrementAnalyzingProgress(20);
      await delay(500);

      await incrementAnalyzingProgress(40);
      await delay(500);
      const generatedTemplate = newPaperAnalysisTemplateData();
      setLoaderText("Finalizing.......");

      await incrementAnalyzingProgress(70);
      await delay(500);
      settemplatePDFUrl(pdfUrl);
      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      if (forward) {
        const pdfMetaDataRes = await fetchPdfMetadataAPI(
          generatedTemplate,
          [pdfUrl],
          openAImodelKey
        );

        const pdfMetaData: any = pdfMetaDataRes.data.response || pdfMetaDataRes;

        pdfMetaData &&
          dispatch(
            updateCredits({
              credits: pdfMetaData?.data?.overall_price?.total,
              activity: "Generate Template Data",
              credit_type: "Analysis",
            })
          );

        await incrementAnalyzingProgress(80);
        await delay(100);

        setLoaderStatus(false);

        let pdfData;
        if (
          pdfMetaData.data.completions[openAImodelKey].completion.choices
            .length > 0
        ) {
          pdfData = extractFileData(
            pdfMetaData.data.completions[openAImodelKey].completion.choices[0]
              .message.content
          );
        }

        setfinalKeyPrompt(
          detailItems as {
            id: number;
            promptKey: string;
            conversionPromptKey: string;
            promptQuestion: {
              id: number;
              question: string;
            }[];
            type: string;
          }[]
        );
        newsLetterWatch?.trim() === "" &&
          setError("name", {
            type: "required",
            message: "Please Enter Template Name",
          });
        setExtractData(pdfData);
      }
      await incrementAnalyzingProgress(100);
      await delay(100);
    } catch (error: any) {
      console.error("Error:", error);
    }
  };

  const renderProgressOrTitle = ({
    showProgressBar,
    extractData,
  }: {
    showProgressBar: number;
    extractData: MyObjectType | null;
  }) => {
    if (extractData?.Title && extractData?.Title?.length > 0) {
      return <div className="text-sm text-muted-foreground">Ready</div>;
    }

    if (showAnalyzingProgressBar > 0) {
      return (
        <Progressbar
          labelClassName="text-black dark:text-white flex"
          value={showAnalyzingProgressBar}
          label={`${Math.round(showAnalyzingProgressBar)}%`}
        />
      );
    }

    if (showProgressBar > 0) {
      return (
        <Progressbar
          labelClassName="text-black dark:text-white"
          value={showProgressBar}
          label={`${Math.round(showProgressBar)}%`}
        />
      );
    }

    return null;
  };

  const closeModel = () => {
    onOpenChange(false);
    document.getElementById("close-dialog")?.click();
    reset();
  };

  const validateName = (value: string) => {
    if (value.trim() === "") {
      setError("name", {
        type: "required",
        message:
          "Please enter a Template Name and click Open in Template Editor",
      });
    } else {
      clearErrors("name");
    }
  };

  const currenStatus =
    isOpen === "create_template"
      ? "Create a new template"
      : isOpen === "edit_template"
      ? "Edit template"
      : "Duplicate template";


      
  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="flex justify-end">
          <Dialog open={!!isOpen} onOpenChange={onOpenChange}>
            <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
            <DialogContent className="fixed p-6 bg-secondaryBackground rounded-lg  shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:w-100 element sm:max-w-[100%] md:max-w-[50rem] max-w-[100%] dark:bg-[#1a282e]">
              <div
                style={{ display: "flex" }}
                className="gap-4 flex-col md:flex-row w-full"
              >
                <DialogTitle
                  className={
                    extractData
                      ? `md:w-[55%] sm:max-w-full max-w-full md:max-w-[400px]`
                      : `sm:max-w-full max-w-full `
                  }
                  style={{ width: "inherit" }}
                >
                  {isOpen === "create_template"
                    ? "CREATE TEMPLATE"
                    : isOpen === "edit_template"
                    ? "EDIT TEMPLATE"
                    : "EDIT NAME TO DUPLICATE"}
                </DialogTitle>
                <DialogTitle
                  className={
                    extractData
                      ? `md:w-[45%] sm:max-w-full max-w-full md:max-w-[400px]`
                      : `hidden`
                  }
                >
                  Preview
                </DialogTitle>
              </div>
              <DialogDescription>
                {/* Enter the details below to{" "}
                {isOpen === "create_template"
                  ? "create a new Template"
                  : isOpen === "edit_template"
                  ? "edit Template"
                  : "duplicate template"} */}
              </DialogDescription>
                       {isOpen === "edit_template" &&
                        (template.projects_using || template.total_files) ? (
                          <div className="bg-[#F59B1429] px-2 py-2">
                            <p className="text-[#F08000] italic">
                              {template.projects_using
                                ? `${template.projects_using} project${
                                    template.projects_using !== 1 ? "s" : ""
                                  }`
                                : ""}
                              {template.projects_using && template.total_files
                                ? " and "
                                : ""}
                              {template.total_files
                                ? `${template.total_files} paper${
                                    template.total_files !== 1 ? "s" : ""
                                  }`
                                : ""}
                              {" associated with this template"}
                            </p>
                          </div>
                        ) : null}
              <form
                onSubmit={
                  isOpen === "create_template"
                    ? handleSubmit(onSubmit)
                    : isOpen === "edit_template"
                    ? handleSubmit(handleEditSubmit)
                    : handleSubmit(handleTemplateDuplication)
                }
                className="grid gap-4"
              >
                <div className="flex gap-4 flex-col md:flex-row w-full">
                  <div
                    className={
                      extractData
                        ? `md:w-[55%] sm:max-w-full max-w-full md:max-w-[400px]`
                        : `sm:max-w-full max-w-full `
                    }
                    style={{ width: "inherit" }}
                  >
                    <div className="grid gap-2 relative">
                      <Label htmlFor="name" className=" text-[#666666] uppercase font-semibold">Template name</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CustomInput
                            id="name"
                            type="text"
                            placeholder="Template name "
                            {...register("name", {
                              required: "Templates name is required",
                              onChange: (e) => validateName(e.target.value),
                            })}
                            className="bg-inputBackground dark:bg-[#1a282e] dark:border-[#CCCCCC14] "
                     
                          />
                        </TooltipTrigger>
                        {errors.name && (
                          <TooltipContent>{errors.name.message}</TooltipContent>
                        )}
                      </Tooltip>
                      {errors.name && (
                        <span className={` mt-2 text-red-600 text-[0.70rem]`}>
                          {errors.name.message}&nbsp;
                        </span>
                      )}
                    </div>
                    <div>
                      {isOpen === "edit_template" ? (
                        <>
                          <div className="grid gap-2 relative">
                            <Label htmlFor="templates" className="pt-3 text-[#666666] uppercase font-semibold mt-2">
                              Template Description
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Textarea
                                  id="templates"
                                  placeholder="Enter template description."
                                  {...register("templates")}
                                  className="dark:bg-[#2c393e] dark:border-[#CCCCCC14] "
                                />
                              </TooltipTrigger>
                              {errors.templates && (
                                <TooltipContent>
                                  {errors.templates.message}
                                </TooltipContent>
                              )}
                              <span className="text-xs text-gray-500"></span>
                            </Tooltip>
                          </div>
                          <div className="gap-2 relative hidden">
                            <Label htmlFor="templates">Template</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Textarea id="id" />
                              </TooltipTrigger>
                              {errors.templates && (
                                <TooltipContent>
                                  {errors.templates.message}
                                </TooltipContent>
                              )}
                              <span className="text-xs text-gray-500"></span>
                            </Tooltip>
                          </div>
                        </>
                      ) : (
                        <>
                          {currenStatus !== "Duplicate template" && (
                            <div className="flex gap-5 flex-col mt-4">
                              <div className="inline-flex items-center py-1">
                                <label className="relative flex items-center cursor-pointer">
                                  <input
                                    checked={
                                      generateTemplate == "generate_template"
                                    }
                                    value="generate_template"
                                    onChange={(e) => {
                                      setGenerateTemplate("generate_template");
                                    }}
                                    name="framework"
                                    type="radio"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                                    id="html"
                                  />
                                  <span className="absolute bg-[#0E70FF] dark:bg-[#ffffff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                                </label>
                                <label className="not-italic block text-sm font-medium text-[#666666] dark:text-white">
                                  {" "}
                                  &nbsp; Generate Template from Paper
                                </label>
                              </div>

                              <div className="inline-flex items-center py-1">
                                <label className="relative flex items-center cursor-pointer">
                                  <input
                                    checked={
                                      generateTemplate == "blank_template"
                                    }
                                    value="blank_template"
                                    onChange={(e) => {
                                      setGenerateTemplate("blank_template");
                                    }}
                                    name="framework"
                                    type="radio"
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
                                    id="react"
                                  />
                                  <span className="absolute bg-[#0E70FF] dark:bg-[#ffffff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                                </label>
                                <label className="not-italic block text-sm font-medium text-[#666666] dark:text-white">
                                  {" "}
                                  &nbsp; Create from Blank Template
                                </label>
                              </div>
                            </div>
                          )}
                           <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] mx-2 w-full my-[10px] p-[0.5px] size-auto ml-0`}></div>
                            <div 
                            // className="flex justify-center"
                            >
                              
                              <div 
                              // className="flex justify-center"
                              >
                                {!loaderStatus &&
                                  generateTemplate == "generate_template" &&
                                  extractData == null &&
                                  currenStatus !== "Duplicate template" && (<>
                                  {/* {generateTemplate == "generate_template" && (
                                    <Button
                                      className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]"
                                      type="button"
                                      onClick={() => {
                                        closeModel();
                                      }}
                                      variant="outline"
                                    >
                                      Cancel
                                    </Button>
                                  )} */}
                                    <div
                                    className="ml-2"
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Button
                                      type="button"
                                      className="rounded-[26px] btn text-white hover:text-white"
                                      onClick={() => {
                                        uploadPaper();
                                      }}
                                      variant="outline"
                                    >
                                 Upload Paper
                                    </Button>
                                  </div>
                                  </>
                                )}
                              {startUpload && (
                                <>
                                <div style={{width:'100%'}}>
                                  {loaderStatus && (
                                    <Typewriter
                                      options={{
                                        strings: loaderText,
                                        autoStart: true,
                                        loop: true,
                                        delay: 30,
                                        deleteSpeed: 50,
                                        wrapperClassName:
                                          "head_tags text-blue-500 font-bold text-sm",
                                      }}
                                    />
                                  )}
                                  <div className="flex items-center py-1" style={{display: 'flex'}}>
                                    {" "}
                                    <Label htmlFor="name">
                                      Status:&nbsp;&nbsp;
                                    </Label>{" "}
                                    {renderProgressOrTitle({
                                      showProgressBar,
                                      extractData,
                                    })}
                                  </div>
                                  {extractData?.Title && (
                                    <div className="flex py-1 items-start" style={{ display: 'flex'}}>
                                      <Label htmlFor="name">
                                        Paper:&nbsp;&nbsp;
                                      </Label>
                                      <div className="text-sm text-muted-foreground">
                                        {extractData?.Title && 
                                          extractData?.Title?.length > 0 ? (
                                          extractData?.Title[0]
                                        ) : (
                                          <>Display the paper title</>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                </>
                              )}
                            </div>
                            </div>
                        </>
                      )}
                     {/* { (isOpen == "edit_template"||isOpen ==  'create_template')&&!(loaderStatus &&
                                  generateTemplate == "generate_template" &&
                                  extractData == null &&
                                  currenStatus !== "Duplicate template")&& <div className={"bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] h-[1px] w-full mt-3"} />} */}
                      <div
                        className={`hidden sm:flex mt-4 ${
                          isOpen === "edit_template" ? "flex-col" : "flex-row"
                        } justify-evenly gap-2`}
                      >
                        {/* {isOpen === "edit_template" &&
                        (template.projects_using || template.total_files) ? (
                          <div className="text-center">
                            <p className="text-[#FFCC00] mb-4">
                              {template.projects_using
                                ? `${template.projects_using} project${
                                    template.projects_using !== 1 ? "s" : ""
                                  }`
                                : ""}
                              {template.projects_using && template.total_files
                                ? " and "
                                : ""}
                              {template.total_files
                                ? `${template.total_files} paper${
                                    template.total_files !== 1 ? "s" : ""
                                  }`
                                : ""}
                              {" associated with this template"}
                            </p>
                          </div>
                        ) : null} */}
                          {/* <div className={"bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] h-[1px] w-full mt-3"} /> */}
                       
                        {generateTemplate == "generate_template" ? (<>

                          {/* <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] mx-2 w-full my-[10px] p-[0.5px] size-auto ml-0`}></div> */}
                          {extractData !== null ? (
                            <>

                           {/*  <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33] mx-2 w-full my-[10px] p-[0.5px] size-auto ml-0`}></div> */}
                            <div className="mt-4 flex">
                              <Button
                               className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-3 hover:text-[#0E70FF]"
                            type="button"
                            onClick={() => {
                              closeModel();
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                              <Button
                                type="submit"
                                 className="rounded-[26px] btn dark:text-white"
                                disabled={
                                  isOpen === "create_template"
                                    ? (generateTemplate as string) ===
                                      "blank_template"
                                      ? newsLetterWatch?.length
                                        ? false
                                        : true
                                      : generateTemplate == "generate_template"
                                      ? newsLetterWatch?.length
                                        ? !extractData
                                          ? true
                                          : false
                                        : true
                                      : true
                                    : false
                                }
                              >
                                {loading ? (
                                  <Loader variant="threeDot" size="sm" />
                                ) : (
                                  <>
                                    {isOpen === "create_template"
                                      ? (generateTemplate as string) ==
                                        "blank_template"
                                        ? "Save Changes"
                                        : "Open in Template Editor"
                                      : isOpen === "edit_template"
                                      ? "Update Template"
                                      : "Duplicate"}{" "}
                                  </>
                                )}
                              </Button>
                              </div>
                            </>
                          ) : (
                            currenStatus == "Duplicate template" && (
                              <>
                                <Button
                                 className="rounded-[26px] btn dark:text-white"
                                  type="submit"
                                  disabled={
                                    isOpen === "create_template"
                                      ? (generateTemplate as string) ===
                                        "blank_template"
                                        ? newsLetterWatch?.length > 0
                                          ? false
                                          : true
                                        : generateTemplate ==
                                          "generate_template"
                                        ? newsLetterWatch?.length > 0
                                          ? !extractData
                                            ? true
                                            : false
                                          : true
                                        : true
                                      : false
                                  }
                                >
                                  {loading ? (
                                    <Loader variant="threeDot" size="sm" />
                                  ) : (
                                    <>
                                      {isOpen === "create_template"
                                        ? (generateTemplate as string) ==
                                          "blank_template"
                                          ? "Save Changes"
                                          : "Open in Template Editor"
                                        : isOpen === "edit_template"
                                        ? "Update Template"
                                        : "Duplicate"}{" "}
                                    </>
                                  )}
                                </Button>
                              </>
                            )
                          )}
                          </> ) : (generateTemplate as string) === "blank_template" ||
                          isOpen === "edit_template" ? (
                          <>
                          <div className="flex justify-end">
                          <Button
                      className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-2 hover:text-[#0E70FF]"
                        type="button"
                        onClick={() => {
                          closeModel();
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                            <Button
                              type="submit"
                               className="rounded-[26px] btn dark:text-white w-max"
                              // className="w-min mx-auto"
                              disabled={
                                isOpen === "create_template"
                                  ? (generateTemplate as string) ===
                                    "blank_template"
                                    ? newsLetterWatch?.length
                                      ? false
                                      : true
                                    : generateTemplate == "generate_template"
                                    ? newsLetterWatch?.length
                                      ? !extractData
                                        ? true
                                        : false
                                      : true
                                    : true
                                  : false
                              }
                            >
                              {loading ? (
                                <Loader variant="threeDot" size="sm" />
                              ) : (
                                <>
                                  {isOpen === "create_template"
                                    ? (generateTemplate as string) ==
                                      "blank_template"
                                      ? "Save Changes"
                                      : "Open in Template Editor"
                                    : isOpen === "edit_template"
                                    ? "Save Changes"
                                    : "Duplicate"}{" "}
                                </>
                              )}
                            </Button>
                            </div>
                          </>
                        ) : (
                          currenStatus !== "Create a new template" && (
                            <>
                              {" "}
                              <Button
                               className="rounded-[26px] btn dark:text-white"
                                type="submit"
                                disabled={
                                  isOpen === "create_template"
                                    ? (generateTemplate as string) ===
                                      "blank_template"
                                      ? newsLetterWatch?.length
                                        ? false
                                        : true
                                      : generateTemplate == "generate_template"
                                      ? newsLetterWatch?.length
                                        ? !extractData
                                          ? true
                                          : false
                                        : true
                                      : true
                                    : false
                                }
                              >
                                {loading ? (
                                  <Loader variant="threeDot" size="sm" />
                                ) : (
                                  <>
                                    {isOpen === "create_template"
                                      ? (generateTemplate as string) ==
                                        "blank_template"
                                        ? "Save Changes"
                                        : "Open in Template Editor"
                                      : isOpen === "edit_template"
                                      ? "Update Template"
                                      : "Duplicate"}{" "}
                                  </>
                                )}
                              </Button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={
                      extractData
                        ? `md:w-[45%] sm:max-w-full max-w-full md:max-w-[400px]`
                        : `hidden`
                    }
                  >
                    <DialogTitle
                      className={extractData ? `md:hidden` : `block`}
                    >
                      Preview
                    </DialogTitle>
                    <div className="sectionScroll overflow-x-auto break-words overflow-y-auto h-[300px]">
                      {extractData &&
                        Object.entries(extractData).map(([key, values]) => {
                          const pascalCase = toPascalCaseWithSpaces(key);
                          const clearSpace =
                            addSpaceBeforeCapitalWords(pascalCase);
                          return (
                            <div key={key}>
                              <Label htmlFor="name">{clearSpace}</Label>
                              <ul className="list-disc list-inside">
                                {(values as string[])?.map(
                                  (value: string, index: number) => (
                                    <li
                                      key={index}
                                      className="text-sm text-muted-foreground"
                                    >
                                      {value}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className={`sm:hidden flex justify-around`}>
                    {generateTemplate == "generate_template" && (
                      <Button
                      className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]"
                        type="button"
                        onClick={() => {
                          closeModel();
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={
                        isOpen === "create_template"
                          ? generateTemplate == "blank_template"
                            ? newsLetterWatch?.length
                              ? false
                              : true
                            : generateTemplate == "generate_template"
                            ? newsLetterWatch?.length
                              ? !extractData
                                ? true
                                : false
                              : true
                            : true
                          : false
                      }
                    >
                      {loading ? (
                        <Loader variant="threeDot" size="sm" />
                      ) : (
                        <>
                          {isOpen === "create_template"
                            ? generateTemplate == "blank_template"
                              ? "Save Changes"
                              : "Open in Template Editor"
                            : isOpen === "edit_template"
                            ? "Update Template"
                            : "Duplicate"}{" "}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </FormProvider>
    </TooltipProvider>
  );
};

export default TemplatesListDialog;
