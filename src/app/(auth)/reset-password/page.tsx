'use client'

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { reserPasswordApi } from '@/apis/user';
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import ThemeInput  from "@/components/ui/ThemeInput";
import { FiEyeOff } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import RoundButton  from "@/components/ui/RoundButton";

interface FormValues {
  password: string;
  confirmPassword: string;
}

function ResetPassword() {
  const [showPassword,setShowPassword]=useState<boolean>(false);

  const Params = useSearchParams();
  const { register, handleSubmit,setValue, formState: { errors,isSubmitted }, getValues, watch,
  trigger, } = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: "onChange",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const token: any = Params.get('token');
    if (!token) {
      toast.error('Invalid reset link');
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await reserPasswordApi(token, { password: data.password, confirmPassword: data.confirmPassword });
      if (response.status === 200) {
        toast.success('Your password has been reset successfully. Sign in.');
        router.push('/login');
      } else {
        toast.error('Unable to reset password. Try again!');
      }
    } catch (error: any) {
      console.log(error);

      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const manageViewPassword=()=>{
    setShowPassword(!showPassword)
  }

  return (<LayoutBar>
      <div className="rounded-bl-[12px] sm:rounded-bl-[0px] bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[44.5px]  rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px] rounded-br-[12px] sm:rounded-br-[0px] h-full" >
    <div className='flex items-center justify-center py-12'>
      <div className='mx-auto grid w-[360px] gap-6'>
        <div className='grid gap-2'>
          <h1 className="text-[28px] font-medium  text-left leading-[42px] mb-4 text-[#E5E5E5]" >Choose Your Password</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        
            <div className="mb-5">

              <ThemeInput
                placeholder="Enter your new password"
                register={{
                  ...register("password", {
                    required: "Password is required.",
                    pattern: {
                      value: passwordRegex,
                      message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                    },
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Password cannot exceed 30 characters.",
                    },
                  })
                }}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, '');
                  setValue("password", cleanedValue, { shouldValidate: true });
                }}
                type={showPassword ? 'text' : 'password'}
                StartAdornment={() => <FiLock color="white" style={{ height: "22px", width: "22px", }} />}
                EndAdornment={() => {
                  return showPassword ?
                    <FiEye color="#CCCCCC" style={{ height: "22px", width: "22px", cursor: 'pointer' }} onClick={manageViewPassword} /> :
                    <FiEyeOff color="#CCCCCC" style={{ height: "22px", width: "22px", cursor: 'pointer' }} onClick={manageViewPassword} />
                }} />
              {isSubmitted && errors.password && (
                <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <ThemeInput
                placeholder="Confirm Password"
                type={'password'}
                register={{
                  ...register("confirmPassword", {
                    required: "Confirm Password is required.",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match.",
                  })
                }}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, '');
                  setValue("confirmPassword", cleanedValue, { shouldValidate: true });
                }}
                StartAdornment={() => <FiLock color="white" style={{ height: "22px", width: "22px", }} />}
              />
              {isSubmitted && errors.confirmPassword && (
                <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
               <RoundButton label={"Generate Password"}  type='submit' isLoading={isLoading} />
        </form>
      </div>
    </div>
    </div>
    </LayoutBar>
  );
}

export default ResetPassword