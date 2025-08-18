"use client";
import { Loader } from "rizzui";
import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useSelector, shallowEqual } from "react-redux";
import toast from "react-hot-toast";
import {
  connectZotero,
  disconnectMendeley,
  fetchAccessData,
  findById,
} from "@/apis/user";
import { disconnectZotero } from "@/apis/files";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

export default function Integrations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showDisconnectMendeleyModal, setShowDisconnectMendeleyModal] =
    useState(false);

  const [userId, setUserId] = useState("");

  const [platForm, setPlatForm] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [showDesign, setShowDesign] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disConnectLoading, setDisConnectLoading] = useState(false);
  const [loadingMendeley, setLoadingMendeley] = useState(false);
  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );

  const [zoteroApiKey, setZoteroApikey] = useState("");
  const [zoteroConnected, setZoteroConnected] = useState(false);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [userData?.id]);

  useEffect(() => {
    const checkApiKey = async () => {
      const response = await findById(userData?.id);
      const zoteroApiKey = response?.data?.data?.zotero_api_key;
      const mendeleyAccessToken = response?.data?.data?.mendeley_access_token;

      if (mendeleyAccessToken) {
        setAccessToken(mendeleyAccessToken);
      }
      if (zoteroApiKey) {
        setApiKey(zoteroApiKey);
        setZoteroApikey(zoteroApiKey);
      }
    };

    if (userData?.id) {
      checkApiKey();
    }
  }, [userData]);

  const fetchAccessToken = async (mendeleyCode: string) => {
    try {
      setLoadingMendeley(true);
      const token = null;
      const response: any = await fetchAccessData(mendeleyCode, token);

      const accessToken = response?.data?.accessToken;

      setAccessToken(accessToken);
      setLoadingMendeley(false);

      toast.success("Mendeley connected successfully!");
    } catch (error) {}
  };

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const response = await findById(userData?.id);
        const zoteroApiKey = response?.data?.data?.zotero_api_key;
        const mendeleyAccessToken = response?.data?.data?.mendeley_access_token;

        if (zoteroApiKey) {
          setApiKey(zoteroApiKey);
          setZoteroApikey(zoteroApiKey);
          setZoteroConnected(true);
        } else {
          setZoteroConnected(false);
        }

        if (mendeleyAccessToken) {
          setAccessToken(mendeleyAccessToken);
        } else {
          const mendeleyCode = new URLSearchParams(window.location.search).get(
            "code"
          );
          if (mendeleyCode) {
            fetchAccessToken(mendeleyCode);
          }
        }
      } catch (error) {
        console.error("Error checking connections:", error);
      }
    };

    if (userData?.id) {
      checkConnections();
    }
  }, [userData]);

  const MENDLEY_CLIENT_ID = process.env.NEXT_PUBLIC_MENDELEY_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_MENDELEY_REDIRECT_URI;

  const MENDLEY_AUTH_URL = `https://api.mendeley.com/oauth/authorize?client_id=${MENDLEY_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=all`;

  const handleConnectClick = async (platform: "Zotero" | "Mendeley") => {
    setPlatForm(platform);

    if (platform === "Zotero") {
      setLoading(true);
      const response = await findById(userData?.id);
      setLoading(false);
      const zotero_api_key = response?.data?.data?.zotero_api_key;

      if (!zotero_api_key) {
        window.open("https://www.zotero.org/settings/keys/new", "_blank");
        setIsModalOpen(true);
      } else {
        setApiKey(zotero_api_key);
      }
    } else if (platform === "Mendeley") {
      window.open(MENDLEY_AUTH_URL, "_blank");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: any) => {
    setApiKey(e.target.value);
  };

  const fetchZoteroUserId = async (apiKey: string) => {
    try {
      const response = await fetch("https://api.zotero.org/keys/current", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch Zotero user ID");
        return null;
      }
      const data = await response.json();
      return data.userID;
    } catch (error) {
      console.error("Error fetching Zotero user ID:", error);
      return null;
    }
  };

  const handleZoteroApiKeyLink = async () => {
    setImportLoading(true);

    const userId = await fetchZoteroUserId(apiKey);
    if (userId) {
      setZoteroConnected(true);
      await connectZotero(apiKey);
      toast.success("Zotero connected successfully.");
    } else {
      toast.error("Invalid API key or unable to fetch user. Please try later.");
    }

    setUserId(userId);
    setImportLoading(false);
  };

  const handleDisconnect = async () => {
    try {
      setDisConnectLoading(true);

      await disconnectZotero(apiKey);
      setZoteroConnected(false);
      setZoteroApikey("");
      setApiKey("");
      setShowDisconnectModal(false);
      toast.success("Zotero integration disconnected successfully.");
    } catch (error) {
      toast.error("Failed to disconnect Zotero. Please try again.");
    } finally {
      setDisConnectLoading(false);
    }
  };

  const handleDisconnectMendeley = async () => {
    try {
      setDisConnectLoading(true);

      await disconnectMendeley(accessToken);
      setAccessToken("");
      setShowDisconnectMendeleyModal(false);
      toast.success("Mendeley integration disconnected successfully.");
    } catch (error) {
      toast.error("Failed to disconnect Mendeley. Please try again.");
    } finally {
      setDisConnectLoading(false);
    }
  };

  const handleButtonClick: any = async () => {
    await handleZoteroApiKeyLink();
    setIsModalOpen(false);
  };
  return (
    <div className="flex flex-wrap ml-2 gap-2">
      <div className="rounded-xl zoterobox border border-gray-300 gap-y-6 px-4">
        <div className="h-14  w-48">
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//Zotero_logo.svg.png`
            }
            alt="Zotero Image"
            width={192}
            height={56}
          />
        </div>
        <div className="font-semibold font-size-bold text-lightGray">
          Zotero
        </div>
        <button
          className={` w-full py-1 rounded-full font-medium font-size-normal flex justify-center items-center ${
            zoteroConnected && apiKey
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white"
          }`}
          onClick={() => {
            if (zoteroConnected && apiKey) {
              setShowDisconnectModal(true);
            } else {
              if (userData?.id) {
                handleConnectClick("Zotero");
              }
            }
          }}
        >
          {loading ? (
            <Loader />
          ) : zoteroConnected && apiKey ? (
            "Connected"
          ) : (
            "Connect"
          )}
        </button>
        {showDisconnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg  text-red-500 font-bold mb-4">
                Disconnect Zotero
              </h2>
              <p className="mb-6 text-[#666666] dark:text-[#333333]">
                Are you sure you want to disconnect your Zotero integration?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowDisconnectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDisconnect}
                >
                  {disConnectLoading ? <Loader /> : "Disconnect"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl zoterobox border border-gray-300 gap-y-6 px-4">
        <div className="h-10 w-28">
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//mendeley-2.svg`
            }
            alt="Mendley "
            width={110}
            height={100}
          />
        </div>

        <div className="font-semibold font-size-bold text-lightGray mt-4">
          Mendeley
        </div>

        <button
          className={` w-full py-1 rounded-full font-medium font-size-normal flex justify-center items-center ${
            accessToken ? "bg-green-500 text-white" : "bg-blue-500 text-white"
          }`}
          onClick={() => {
            if (accessToken) {
              setShowDisconnectMendeleyModal(true);
            } else {
              handleConnectClick("Mendeley");
            }
          }}
        >
          {loadingMendeley ? <Loader /> : accessToken ? "Connected" : "Connect"}
        </button>

        {showDisconnectMendeleyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg  text-red-500 font-bold mb-4">
                Disconnect Mendeley
              </h2>
              <p className="mb-6 text-[#666666] dark:text-[#333333]">
                Are you sure you want to disconnect your Mendeley integration?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowDisconnectMendeleyModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={handleDisconnectMendeley}
                >
                  {disConnectLoading ? <Loader /> : "Disconnect"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10 "
            onClick={closeModal}
          ></div>

          <div className="fixed top-0 bg-profileDropDown  right-0 h-full w-[338px] shadow-lg z-20 transition-transform duration-300">
            <div className="p-4  bg-profileDropDown ">
              <div className="flex justify-between items-center border-b border-gray-300 py-2">
                <span className="text-sm font-size-large font-semibold text-lightGray capitalize">
                  IMPORT
                </span>
                <X
                  onClick={closeModal}
                  className="cursor-pointer"
                  color="#9A9A9A"
                  width={20}
                  height={20}
                />
              </div>

              {platForm === "Zotero" && !showDesign ? (
                <div className="mt-4 border-b border-gray-300 pb-4">
                  <label
                    htmlFor="api-key"
                    className="font-size-small uppercase font-semibold text-lightGray mb-2"
                  >
                    Paste API Key
                  </label>
                  <Input
                    id="api-key"
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 text-lightGray focus:outline-none h-8 rounded-lg"
                    placeholder="Enter your API key here"
                    value={apiKey}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ) : (
                <div className="mt-4 border-b border-gray-300 pb-4">
                  <p>Select Below Papers to import</p>
                </div>
              )}
            </div>
            <div className="flex justify-end items-center gap-2 mt-6 pr-5">
              <button
                onClick={closeModal}
                className="bg-white border font-medium font-size-normal border-blue-600 px-3 py-1 text-blue-600 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleButtonClick}
                disabled={platForm === "Zotero" && !apiKey.trim()}
                className="bg-blue-600 font-medium text-white rounded-full px-3 py-1 border-2 border-blue-500 hover:bg-blue-700 disabled:bg-blue-300"
              >
                {importLoading ? <Loader /> : "Connect"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
