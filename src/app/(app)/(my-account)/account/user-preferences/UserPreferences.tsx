"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "rizzui";
import { useDispatch } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { VscDebug } from "react-icons/vsc";
import { TbBoxMultipleFilled } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { Tabs } from "@/components/ui/tabs";
import { FaCoins } from "react-icons/fa";
import Select, { SingleValue } from "react-select";
import {
  comparedBothAnswer,
  PrimaryModelResponse,
  roundCredit,
  SecondaryModelResponse,
} from "@/utils/commonUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import makeAnimated from "react-select/animated";
import {
  ModelList,
  multiModels,
  GroupModel,
  Option,
  pricing,
} from "@/types/types";
import { RoundButton } from "@/components/ui/button";
import { fetchApi } from "@/utils/fetchApi";
import { Label } from "@/components/ui/label";
import { RootState } from "@/reducer/store";
import {
  useMultipleModelsMsg,
  FastAndCostEffectiveAI,
  SmartAI,
  ReasoningAI,
  modelPrompt,
} from "@/utils/commonUtils";
import { AppDispatch } from "@/reducer/store";
import { updateUserfeatures, updateUserData, updateUserProfile } from "@/apis/user";
import Switch from "@/components/ui/Switch";
import { setBetaModeConfirm } from "@/reducer/feature/featureSlice";
import toast from "react-hot-toast";

const UserPreferences = () => {
  const [loading, setLoading] = useState(false);
  const [debugModel, setDebugModel] = useState<boolean>(false);
  const [showModel, setShowModel] = useState<boolean>(false);
  const [modelData, setModelData] = useState<multiModels[]>([]);
  const [showError, setShowError] = useState(false);
  const [showSecondError, setShowSecondError] = useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const [promptModel, setPromptModel] = useState<GroupModel[]>([
    {
      label: "Fast and Cost Effective A1:",
      options: [],
    },
    {
      label: "Smart A1:",
      options: [],
    },
    {
      label: "Reasoning A1:",
      options: [],
    },
    {
      label: "Other AI Models",
      options: [],
    },
  ]);
  const { user } = useSelector((state: RootState) => state.user.user);
  const {confirmBetaMode} = useSelector(
    (state: RootState) => state.feature
  );
 
  const [selectedOption, setSelectedOption] = useState<Option[]>(
    user?.selected_models?.length == 0 ? [] : user?.selected_models
  );
  const [betaMode,setBetaMode]=useState(user?.hasAiResearchAssistantBeta)
  const [checkUseModel, setCheckUseModel] = useState<boolean>(
    user?.use_multiple_models || false
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user?.id) {
      getAIModel();
    }
  }, [user]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [user?.id]);

  const manageReminder = async () => {
    setCheckUseModel(!checkUseModel);
    setEnableButton(true);
  };

  const handleChangeOne = (selectedOptionOne: any) => {
    const updateData = [...selectedOption];

    if (selectedOptionOne === null) {
      updateData[0] = updateData[2];
    } else if (updateData[0]) {
      updateData[0] = {
        ...updateData[0],
        ...selectedOptionOne,
      };
    } else {
      updateData[0] = selectedOptionOne;
    }
    setEnableButton(true);
    setSelectedOption(updateData);
    const isChecked = updateData?.some((item)=> item !== null)
    setCheckUseModel(isChecked)
  };

  const handleChangeTwo = (selectedOptionTwo: any) => {
    const updateData = [...selectedOption];

    if (selectedOptionTwo === null) {
      updateData[1] = updateData[2];
    } else if (updateData[1]) {
      updateData[1] = {
        ...updateData[1],
        ...selectedOptionTwo,
      };
    } else {
      updateData[1] = selectedOptionTwo;
    }

    setEnableButton(true);
    setSelectedOption(updateData);

    const isChecked = updateData?.some((item)=> item !==null)
    setCheckUseModel(isChecked)
  };

  const manageModel = (allModel: multiModels[]) => {
    let GroupModel: GroupModel[] = [
      { label: "Fast and Cost Effective A1:", options: [] },
      { label: "Smart A1:", options: [] },
      { label: "Reasoning A1:", options: [] },
      { label: "Other AI Models", options: [] },
    ];

    setModelData(
      allModel.map((value) => {
        if (FastAndCostEffectiveAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Fast and Cost Effective A1",
          };
        }
        if (SmartAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Smart A1",
          };
        }
        if (ReasoningAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Reasoning A1",
          };
        } else {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Other AI Models",
          };
        }
      })
    );

    allModel.forEach((value: multiModels) => {
      if (FastAndCostEffectiveAI.includes(value.name))
        GroupModel[0].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      if (SmartAI.includes(value.name))
        GroupModel[1].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      if (ReasoningAI.includes(value.name))
        GroupModel[2].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      else
        GroupModel[3].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
    });

    setPromptModel(GroupModel);
  };

  const getAIModel = async () => {
    !user?.selected_models && (await dispatch(updateUserData()));
    try {
      const response = await fetchApi(
        `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/models`,
        { method: "GET" }
      );

      if (!response.success) {
        throw new Error(`HTTP error! status: ${response.success}`);
      }
      manageModel(response.data);
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
    }
  };
  
const checkModel = () => {
  if(betaMode !== user?.hasAiResearchAssistantBeta){
    return false
  }

  if (!enableButton) {
    return true; 
  }

    return !(
      selectedOption &&
      selectedOption.length === 2 &&
      selectedOption[0]?.label &&
      selectedOption[1]?.label
    );
  };

  const submitModel = async () => {
    const multiModalLength = selectedOption?.filter((item)=>item != null)
    
    if(user?.hasAiResearchAssistantBeta!==betaMode){
      dispatch(setBetaModeConfirm(betaMode))
      const formData = new FormData();
      // formData.append("hasCollectiveMindBeta", true.toString());
      formData.append("hasAiResearchAssistantBeta", betaMode.toString());
      try {
        const response = await updateUserProfile(formData);
        await dispatch(updateUserData())
        if (response) {
          toast.success(`${betaMode?`Early Access Features are enabled. You can now try our upcoming features.`
        :
        "Early Access Features are disabled."}`);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message);
      }
    }

    if(checkUseModel){
      if(multiModalLength?.length === 2 && JSON.stringify(multiModalLength) !== JSON.stringify(user?.selected_models)){
 
        const newSelectModel = checkUseModel ? [...selectedOption] : [];
        setLoading(true);
        dispatch(
          updateUserfeatures({
            model_use: checkUseModel,
            selected_model: newSelectModel,
          })
        );
        !checkUseModel && setSelectedOption([]);
      
        setLoading(false);
      }
    }else if(user?.use_multiple_models !== checkUseModel) {
      setLoading(true);
      dispatch(
        updateUserfeatures({
          model_use: checkUseModel,
          selected_model: [],
        })
      );
      !checkUseModel && setSelectedOption([]);
    
      setLoading(false);
    }

    setEnableButton(false)
  };

  const manageDebugModel = () => {
    setDebugModel(!debugModel);
  };

  const showModelDetails = () => {
    setShowModel(!showModel);
  };

  const generateCoinIcons = (coins: any, arr: any) => {
    const normalizedCoins = roundCredit(coins);
    const icons = [];
    for (let i = 0; i < normalizedCoins; i++) {
      icons.push(
        <FaCoins key={i} className="inline text-yellow-500" size={16} />
      );
    }
    return icons;
  };

  useEffect(()=>{
    dispatch(setBetaModeConfirm(user?.hasAiResearchAssistantBeta))
    // setBetaMode(user?.hasAiResearchAssistantBeta)
  },[user?.hasAiResearchAssistantBeta,confirmBetaMode])

  return (
    <>
      <div className="border border-borderColor rounded-lg p-4 mb-4 bg-bgGray">
        <h5 className="mb-5 text-[#393939] dark:text-[#CCCCCC] font-medium">
          Use Multiple Models
        </h5>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <Tooltip
              rounded="lg"
              content={
                <div className="max-w-[350px]">{useMultipleModelsMsg}</div>
              }
            >
              <Label className="font-poppins text-sm font-normal leading-[19.5px] text-left items-center text-center flex">
                <>
                  {checkUseModel ? (
                    <ImCheckboxChecked
                      color="#999999"
                      onClick={() => {
                        manageReminder();
                      }}
                      className="cursor-pointer h-4 w-4 mr-2"
                    />
                  ) : (
                    <ImCheckboxUnchecked
                      color="#999999"
                      onClick={() => {
                        manageReminder();
                      }}
                      className="cursor-pointer h-4 w-4 mr-2"
                    />
                  )}
                </>
                <p className="font-size-md font-medium text-darkGray text-center whitespace-nowrap">
                  Cross Select using Multiple Models &nbsp;&nbsp;
                </p>
              </Label>
            </Tooltip>
            <VscDebug
              color="#0f6fff"
              className="cursor-pointer h-5 w-5"
              onClick={manageDebugModel}
            />
          </div>
          <div className="flex font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
            Select Primary and Secondary AI Models (please select any two model)
            &nbsp;&nbsp;
            <TbBoxMultipleFilled
              color="#0f6fff"
              className="cursor-pointer h-5 w-5"
              onClick={showModelDetails}
            />
          </div>
          <div>
            <div className="lg:w-[100%] xl:w-[100%] 2xl:w-[75%]">
              <div className="flex flex-wrap gap-4">
                <div className="max-w-full sm:min-w-min lg:min-w-[250px] xl:min-w-[450px]  flex-1">
                  <div className="w-max font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
                    Select Primary Model
                  </div>
                  <div
                    onClick={() => {
                      if (!checkUseModel) {
                        setShowError(true);
                      } else {
                        setShowError(false);
                      }
                    }}
                  >
                    <Select
                      closeMenuOnSelect={true}
                      components={makeAnimated()}
                      isClearable
                      onChange={handleChangeOne}
                      value={!!selectedOption ? [selectedOption[0]] : []}
                      options={promptModel.map((value) => {
                        return {
                          label: value.label,
                          options: value.options.filter((val) => {
                            return val.value !== selectedOption[1]?.value;
                          }),
                        };
                      })}
                      placeholder={"Select AI Models"}
                      isSearchable={true}
                      getOptionLabel={(e: any) => e.label}
                      isDisabled={!checkUseModel}
                      formatOptionLabel={(e: any) => (
                        <div title={e.label}>{e.label}</div>
                      )}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      className="mt-3"
                      classNames={{
                        control: ({ isDisabled }) =>
                          `  border  dark:bg-[#15252a] rounded ${
                            isDisabled
                              ? " dark:bg-[#414546]"
                              : " dark:bg-[#15252a]"
                          } ${
                            isDisabled
                              ? "dark:border-[#e6e6e652]"
                              : "dark:border-[#15252a]"
                          }`,
                        menu: () =>
                          `dark:bg-[#15252a] border border-gray-300  rounded-md shadow-lg`,
                        menuList: () => " overflow-y-auto",
                        option: ({ isFocused, isSelected }) =>
                          `cursor-pointer ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : isFocused
                              ? "bg-gray-200 dark:bg-[#15252a]"
                              : "bg-white dark:bg-[#15252a]"
                          }`,
                        singleValue: () => "text-gray-900 dark:text-white",
                        placeholder: () => "text-gray-400 dark:text-gray-500",
                        input: () => "text-gray-900 dark:text-white",
                      }}
                      styles={{
                        container: (provided) => ({
                          ...provided,
                          width: "+100%",
                        }),
                        control: (provided) => ({
                          ...provided,
                          width: "100%",
                          minWidth: "200px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                          position: "absolute",
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          maxHeight: "300px",
                          overflowY: "auto",
                        }),
                      }}
                    />
                  </div>
                  {showError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please check the &apos;Cross Select&apos; before selecting
                      a model.
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-size-md mt-4 font-medium text-darkGray">
                    Credits per 100 Words
                  </div>
                  <div className="mt-3 text-center">
                    {Math.ceil(selectedOption[0]?.pricing?.coins * 2) || 0}
                  </div>
                </div>
                {selectedOption[0]?.pricing?.coins&&<div className="flex-1">
                  <div className="font-size-md mt-4 font-medium text-darkGray">
                    &nbsp;
                  </div>
                  <div className="mt-3">
                    {generateCoinIcons(
                      selectedOption[0]?.pricing?.coins,
                      modelData
                    )}
                  </div>
                </div>}
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="max-w-full sm:min-w-min lg:min-w-[250px] xl:min-w-[450px]  flex-1">
                  <div className="w-max font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
                    Secondary AI Model
                  </div>
                  <div
                    onClick={() => {
                      if (!checkUseModel) {
                        setShowSecondError(true);
                      } else {
                        setShowSecondError(false);
                      }
                    }}
                  >
                    <Select
                      closeMenuOnSelect={true}
                      components={makeAnimated()}
                      isClearable
                      onChange={handleChangeTwo}
                      value={!!selectedOption[1] ? selectedOption[1] : []}
                      options={promptModel.map((value) => {
                        return {
                          label: value.label,
                          options: value.options.filter((val) => {
                            return val.value !== selectedOption[0]?.value;
                          }),
                        };
                      })}
                      placeholder={"Select AI Models"}
                      isSearchable={true}
                      getOptionLabel={(e: any) => e.label}
                      isDisabled={!checkUseModel}
                      formatOptionLabel={(e: any) => (
                        <div title={e.label}>{e.label}</div>
                      )}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      className="mt-3"
                      classNames={{
                        control: ({ isDisabled }) =>
                          `  border  dark:bg-[#15252a] rounded ${
                            isDisabled
                              ? " dark:bg-[#414546]"
                              : " dark:bg-[#15252a]"
                          } ${
                            isDisabled
                              ? "dark:border-[#e6e6e652]"
                              : "dark:border-[#15252a]"
                          }`,
                        menu: () =>
                          `dark:bg-[#15252a] border border-gray-300  rounded-md shadow-lg`,
                        menuList: () => " overflow-y-auto",
                        option: ({ isFocused, isSelected }) =>
                          `cursor-pointer ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : isFocused
                              ? "bg-gray-200 dark:bg-[#15252a]"
                              : "bg-white dark:bg-[#15252a]"
                          }`,
                        singleValue: () => "text-gray-900 dark:text-white",
                        placeholder: () => "text-gray-400 dark:text-gray-500",
                        input: () => "text-gray-900 dark:text-white",
                      }}
                      styles={{
                        container: (provided) => ({
                          ...provided,
                          width: "100%",
                        }),
                        control: (provided) => ({
                          ...provided,
                          width: "100%",
                          minWidth: "100px",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                          position: "absolute",
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          maxHeight: "300px",
                          overflowY: "auto",
                        }),
                      }}
                    />
                  </div>
                  {showSecondError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please check the &apos;Cross Select&apos; before selecting
                      a model.
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
                    {" "}
                    Credits per 100 Words
                  </div>
                  <div className="mt-3 text-center">
                    {Math.ceil(selectedOption[1]?.pricing?.coins * 2) || 0}
                  </div>
                </div>
                {selectedOption[1]?.pricing?.coins&&<div className="flex-1">
                  <div className="font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
                    &nbsp;
                  </div>
                  <div className="mt-3">
                    {generateCoinIcons(
                      selectedOption[1]?.pricing?.coins,
                      modelData
                    )}
                  </div>
                </div>}
              </div>

            </div>
          </div>
        </div>
        <hr className="mt-5"/>
              <div className="mt-5 flex items-center justify-between max-w-[28rem] w-full">
                <label
                  htmlFor="Early Access Features"
                  className="font-size-md font-medium text-darkGray"
                >
                  Early Access Features
                </label>

                <div>
                  <Switch
                    id="ai-research-assistant"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEnableButton(true)
                      setBetaMode(checked)
                    }}
                    value={betaMode}
                  />
                </div>
              </div>
        <div className="flex justify-center mt-3">
          <RoundButton
            disabled={checkModel()}
            onClick={() => {
              submitModel();
            }}
            loading={loading}
          >
            Save Changes
          </RoundButton>
        </div>
      </div>
      <Dialog open={debugModel} onOpenChange={manageDebugModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg w-[90%] max-w-[525px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogTitle className="flex dark:text-gray-700 justify-between items-center text-lg font-semibo   ld md:text-xl">
            Process of Multiple Models
            <IoClose onClick={manageDebugModel} size={26} />
          </DialogTitle>
          <div>
            <DialogDescription className="mt-2 text-gray-700 font-semibold  text-[1.3rem]">
              Date and Time:
            </DialogDescription>
            <h4 className="dark:text-gray-700">
              {" "}
              {new Date().toLocaleString()}
            </h4>
          </div>
          <div>
            <DialogDescription className="mt-2 text-gray-700 font-semibold  text-[1.3rem]">
              Prompt:
            </DialogDescription>
            <h4 className="dark:text-gray-700"> {modelPrompt}</h4>
          </div>
          <div>
            <DialogDescription className="mt-2 text-gray-700 font-semibold  text-[1.3rem]">
              Primary Model Response:
            </DialogDescription>
            <h4 className="dark:text-gray-700"> {PrimaryModelResponse}</h4>
          </div>
          <div>
            <DialogDescription className="mt-2 text-gray-700 font-semibold  text-[1.3rem]">
              Secondary Model Response:
            </DialogDescription>
            <h4 className="dark:text-gray-700"> {SecondaryModelResponse}</h4>
          </div>
          <div>
            <DialogDescription className="mt-2 text-gray-700 font-semibold  text-[1.3rem]">
              Compared both answers (Primary Model):
            </DialogDescription>
            <h4 className="dark:text-gray-700"> {comparedBothAnswer}</h4>
          </div>
        </DialogContent>
      </Dialog>
     
      <Dialog open={showModel} onOpenChange={showModelDetails}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg w-[90%] max-w-max left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogTitle className="flex justify-between dark:text-gray-700 items-center text-lg font-semibold md:text-xl mb-1">
            AI Model Cost Comparison
            <IoClose onClick={showModelDetails} size={26} />
          </DialogTitle>
          <Tabs defaultValue="users">
            <Card className="bg-secondaryBackground border-tableBorder w-full">
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <div className="overflow-auto max-h-[400px] scrollbar-hide w-full">
                      <TableHeader className="sticky top-0 bg-gray-100 w-full">
                        <TableRow>
                          <TableHead className="w-[50px] border-b">
                            # No.
                          </TableHead>
                          <TableHead className="border-b">AI Model</TableHead>
                          <TableHead className="border-b">
                            Cost Visualization
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelData.map(
                          (model: multiModels, index: number, arr: any) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{model.name}</TableCell>
                              <TableCell>
                                {generateCoinIcons(model?.pricing.coins, arr)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </div>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserPreferences;
