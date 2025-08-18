"use client";

import React, { useState } from "react";
import { sanitizeQueryParam } from "@/utils/sanitize";
import DOMPurify from "dompurify";

export default function SecureForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    htmlContent: "<p>This is safe HTML</p>",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const csrfToken =
    process.env.NEXT_PUBLIC_CSRF_TOKEN || "csrf-token-placeholder";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const sanitizedValue = sanitizeQueryParam(value);

    setFormData((prevData) => ({
      ...prevData,
      [name]: sanitizedValue,
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("validation-error");
      return;
    }

    try {
      const response = await fetch("/api/secure-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          message: "",
          htmlContent: formData.htmlContent,
        });
      } else {
        const data = await response.json();
        setSubmitStatus(`error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error: Network or server error");
    }
  };

  const renderSafeHtml = () => {
    const sanitized = DOMPurify.sanitize(formData.htmlContent, {
      ALLOWED_TAGS: ["p", "strong", "em", "a"],
      ALLOWED_ATTR: ["href", "target"],
    });

    return { __html: sanitized };
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawHtml = e.target.value;

    setFormData((prev) => ({
      ...prev,
      htmlContent: rawHtml,
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Secure Contact Form Example
      </h2>

      {submitStatus === "success" && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          Your message has been sent successfully!
        </div>
      )}

      {submitStatus?.startsWith("error") && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {submitStatus.replace("error: ", "")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="_csrf" value={csrfToken} />

        <div>
          <label htmlFor="name" className="block mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-transparent ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className={`w-full p-2 border rounded ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="htmlContent" className="block mb-1">
            HTML Content (demonstration)
          </label>
          <textarea
            id="htmlContent"
            name="htmlContent"
            value={formData.htmlContent}
            onChange={handleHtmlChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">Sanitized Output:</p>
            <div
              className="p-2 border border-gray-300 rounded bg-gray-50"
              dangerouslySetInnerHTML={renderSafeHtml()}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Submit Securely
        </button>
      </form>

      <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-medium text-yellow-800">
          Security Features Demonstrated:
        </h3>
        <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
          <li>Input sanitization to prevent XSS attacks</li>
          <li>CSRF token protection</li>
          <li>Client-side + pattern validation</li>
          <li>Safe HTML rendering with DOMPurify</li>
          <li>Secure form submission with proper headers</li>
        </ul>
      </div>
    </div>
  );
}
