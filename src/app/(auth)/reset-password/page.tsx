"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi"

type FormValues = {
  password: string
  confirmPassword: string
}

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>()

  const manageViewPassword = () => setShowPassword(!showPassword)
  const manageViewConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword)

  const onSubmit = (data: FormValues) => {
    console.log("Form Submitted", data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl">

        {/* Logo Section */}
        <div className="flex justify-center mb-6 items-center gap-2">
          {/* Logo */}
          <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900">AIScholarix</h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Password */}
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiLock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value: passwordRegex,
                    message:
                      "Must include uppercase, lowercase, number & special character.",
                  },
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={manageViewPassword}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <div className="min-h-[20px] mt-1">
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiLock size={20} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                onClick={manageViewConfirmPassword}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </span>
            </div>
            <div className="min-h-[20px] mt-1">
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>

  )
}
