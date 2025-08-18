import axios from "axios";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { axiosInstancePrivate } from "./request";
import { multipleModelsTemplate } from "@/utils/aiTemplates";
import { chatWithPDFPrompt } from "@/utils/aiTemplates";
import { updateUserSubscription } from "@/apis/subscription";
const openAImodelKey = "openai/gpt-4o-mini";

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAICO_API_KEY}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

export const fetchNewApi = async (url: string, options: RequestInit = {}) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAICO_API_KEY}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
  } else {
    return response.json();
  }
};

export const insertPdfData = async (data: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/pdf/insert-data`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const manageCreditsApi = async ({
  user_id,
  credits,
  currentCredits,
}: {
  user_id: number;
  credits: number;
  currentCredits: number;
}) => {
  const supabase: SupabaseClient = createClient();

  try {
    const subscriptionData = await updateUserSubscription({ credit: currentCredits + credits }, user_id.toString())
    if (subscriptionData?.data?.isSuccess === false) {
      throw subscriptionData?.data?.message;
    }
    return subscriptionData?.data?.data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const parseContent = (content: any) => {
  const lines = content.split("\n\n");
  const title = lines[0].match(/The title of the publication is "([^"]+)"/)[1];
  const abstract = lines[1].match(
    /The abstract of the publication can be summarized as: (.+)/
  )[1];
  const keyFindings = lines[2]
    .match(/Key findings from the research publication include:\n- (.+)/)[1]
    .split("\n- ");
  const researchApproach = lines[3].match(
    /The research approach used in this publication is "([^"]+)"/
  )[1];

  return {
    title,
    abstract,
    keyFindings,
    researchApproach,
  };
};

export const createInArray = (text: string) => {
  const cleanedJSON = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanedJSON);
};

export const sendComparisonRequest = async (
  question: string,
  answer1: string,
  answer2: string,
  file_urls?: string[] | null[] | any,
  AImodelKey: string[] = [openAImodelKey]
) => {
  const modelTemplate = multipleModelsTemplate(question, answer1, answer2);
  try {
    const response = await axiosInstancePrivate.post(
      `/straico-mdel/chat-pdf-multi-model-compare`,
      {
        models: AImodelKey,
        message: modelTemplate,
        ...(file_urls?.length && { file_urls: file_urls }),
      }
    );
    if (response) {
      return response;
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
};

export const RAGidGenerateAPI = async ({ formData }: { formData: any }) => {
  try {
    const alfaApiResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/rag`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAICO_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return alfaApiResponse.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const extractRAGData = async ({
  regid,
  context,
  message,
  selectedModel,
}: {
  regid: string;
  context: string;
  message: string;
  selectedModel: string;
}) => {
  try {
    const newApiResponses = await axios.post(
      `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/rag/${regid}/prompt`,
      {
        prompt: chatWithPDFPrompt(context, message),
        model: selectedModel,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAICO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return newApiResponses;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const straicoAPI = async (
  message: string,
  chatURL?: string,
  openAImodelKey?: string[]
) => {
  const response = await fetchApi(
    `${process.env.NEXT_PUBLIC_STRAICO_API}/v1/prompt/completion`,
    {
      method: "POST",
      body: JSON.stringify({
        models: openAImodelKey,
        message,
        file_urls: [chatURL],
      }),
    }
  );
  return response;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
