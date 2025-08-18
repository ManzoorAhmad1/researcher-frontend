"use client";
import axios from "axios";
import localStorageService from "./localStorage";
import sessionStorageService from "./sessionStorage";
import { Router } from "next/router";
import DOMPurify from "dompurify";

const REQUEST_TIMEOUT = 600000;



const VALID_REDIRECT_PATHS = ["/login", "/dashboard", "/home", "/"];

const validateSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const criticalEnvVars = {
    API_SECRET: process.env.API_SECRET||'f3d4d18c6e1a9bc7d54e8f5a3b2c1d0e9f8b7a6',
    CSRF_SECRET: process.env.CSRF_SECRET||'9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  };

  if (isProduction) {
    const missingVars = Object.entries(criticalEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error(
        `SECURITY RISK: Missing critical environment variables in production: ${missingVars.join(
          ", "
        )}`
      );
    }
  }
};

validateSecurityConfig();

const domPurify = typeof window !== "undefined" ? DOMPurify : null;

const secureLog = (level: string, message: string, data?: any) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const sanitizedData = data ? sanitizeSensitiveData(data) : undefined;
    if (level === "error" && console.error) {
      console.error(message, sanitizedData);
    } else if (level === "warn" && console.warn) {
      console.warn(message, sanitizedData);
    } else if (level === "info" && console.info) {
      console.info(message, sanitizedData);
    } else if (level === "debug" && console.debug) {
      console.debug(message, sanitizedData);
    } else {
      console.log(message, sanitizedData);
    }
  } else {
    if (level === "error" && console.error) {
      console.error(message, data);
    } else if (level === "warn" && console.warn) {
      console.warn(message, data);
    } else if (level === "info" && console.info) {
      console.info(message, data);
    } else if (level === "debug" && console.debug) {
      console.debug(message, data);
    } else {
      console.log(message, data);
    }
  }
};

const sanitizeSensitiveData = (data: any): any => {
  if (!data) return data;

  const sanitized = JSON.parse(JSON.stringify(data));

  const sensitiveFields = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "secret",
    "apiKey",
    "Authorization",
    "credential",
    "key",
  ];

  const maskObject = (obj: any) => {
    if (!obj || typeof obj !== "object") return obj;

    Object.keys(obj).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some((field) => lowerKey.includes(field))) {
        obj[key] = "[REDACTED]";
      } else if (typeof obj[key] === "object") {
        maskObject(obj[key]);
      }
    });

    return obj;
  };

  return maskObject(sanitized);
};

const applySecurityHeaders = (headers: any) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  headers["X-Content-Type-Options"] = "nosniff";
  headers["X-Frame-Options"] = "DENY";
  headers["X-XSS-Protection"] = "1; mode=block";
  headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

  const allowedOrigins = isDevelopment
    ? [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:4000",
        process.env.NEXT_PUBLIC_API_BASE_URL,
      ].filter(Boolean)
    : [process.env.NEXT_PUBLIC_API_BASE_URL].filter(Boolean);

  headers["Access-Control-Allow-Origin"] =
    allowedOrigins.length > 0
      ? allowedOrigins[0]
      : isDevelopment
      ? "http://localhost:3000"
      : "null";

  headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
  headers["Access-Control-Allow-Headers"] =
    "Content-Type, Authorization, X-CSRF-Token";

  return headers;
};

const isValidRedirectPath = (path: string): boolean => {
  if (!path.startsWith("/")) return false;

  return VALID_REDIRECT_PATHS.some(
    (validPath) => path === validPath || path.startsWith(`${validPath}/`)
  );
};


export const axiosInstancePrivate = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  timeout: REQUEST_TIMEOUT,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
});

export const axiosFormDataInstancePrivate = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  timeout: REQUEST_TIMEOUT,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
});

const checkInternetConnection = () => {
  if (!navigator.onLine) {
    const error = new Error(
      "No internet connection. Please check your network."
    );
    error.name = "NoInternetError";
    error.message = "No internet connection. Please check your network.";
    throw error;
  }
};

const validateRequestData = (data: any): any => {
  if (data instanceof FormData) {
    return data;
  }

  if (!data) return data;

  const sanitized = JSON.parse(JSON.stringify(data));

  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== "object") return obj;

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string") {
        if (domPurify) {
          obj[key] = domPurify.sanitize(obj[key], {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
          });
        } else {
          obj[key] = obj[key]
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#39;")
            .replace(/"/g, "&quot;")
            .replace(/\(/g, "&#40;")
            .replace(/\)/g, "&#41;");
        }
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    });

    return obj;
  };

  return sanitizeObject(sanitized);
};

const getCsrfToken = () => {
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  return csrfMeta ? csrfMeta.getAttribute("content") : "";
};

axiosFormDataInstancePrivate.interceptors.request.use(
  async (config) => {
    checkInternetConnection();


    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      const formattedToken = token.replace(/^"(.*)"$/, "$1");
      config.headers.set("Authorization", `Bearer ${formattedToken}`);

      if (!config.data || !(config.data instanceof FormData)) {
        config.headers.set("Content-Type", "multipart/form-data");
      }

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers.set("X-CSRF-Token", csrfToken);
      }
    }

    if (config.headers) {
      applySecurityHeaders(config.headers);
    }

    return config;
  },
  (error) => {
    secureLog("error", "Request interceptor error:", error);
    return Promise.reject(error);
  }
);

export const axiosInstancePublic = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: REQUEST_TIMEOUT,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
});

export const configureInterceptors = (router: Router) => {
  let refreshTokenPromise: Promise<any> | null = null;

  axiosInstancePrivate.interceptors.request.use(
    async (config) => {
      checkInternetConnection();


      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          const formattedToken = token.replace(/^"(.*)"$/, "$1");
          config.headers["Authorization"] = `Bearer ${formattedToken}`;

          const csrfToken = getCsrfToken();
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        }

        applySecurityHeaders(config.headers);

        if (config.data && !(config.data instanceof FormData)) {
          config.data = validateRequestData(config.data);
        }

        return config;
      } catch (error) {
        secureLog("error", "Request configuration error:", error);
        return Promise.reject(error);
      }
    },
    (error) => {
      secureLog("error", "Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  axiosInstancePrivate.interceptors.response.use(
    (response) => {
      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        try {
          if (typeof response.data === "string") {
            if (process.env.NODE_ENV !== "production") {
              console.debug("Response data before parsing:", {
                url: response.config.url,
                responseData:
                  response.data.substring(0, 200) +
                  (response.data.length > 200 ? "..." : ""),
                contentLength: response.data.length,
              });
            }

            if (response.data.trim()) {
              try {
                response.data = JSON.parse(response.data);
              } catch (parseError) {
                secureLog("error", "Invalid JSON response:", {
                  error: parseError,
                  url: response.config.url,
                  responsePreview:
                    response.data.substring(0, 100) +
                    (response.data.length > 100 ? "..." : ""),
                  responseLength: response.data.length,
                });

                response.data = {
                  error: "Invalid JSON response",
                  success: false,
                  isParsingError: true,
                };
              }
            } else {
              response.data = { data: null, success: true, isEmpty: true };
            }
          }
        } catch (e) {
          secureLog("error", "Invalid JSON response:", {
            error: e,
            url: response.config.url,
            responsePreview:
              typeof response.data === "string"
                ? response.data.substring(0, 100) +
                  (response.data.length > 100 ? "..." : "")
                : "Not a string",
            responseLength:
              typeof response.data === "string" ? response.data.length : 0,
          });
        }
      }

      return response;
    },

    async (error) => {
      const originalRequest = error.config;

      if (error?.response?.status === 429) {
        secureLog("warn", "Rate limit exceeded. Please try again later.");
        return Promise.reject({
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      if (error?.response?.data?.message === "jwt expired" || error?.response?.status === 401 || error?.response?.data?.message === "Your session has expired. Please log in again to continue") {
        try {
          const refreshToken =
            localStorageService.getItem("refreshToken") ||
            sessionStorageService.getItem("refreshToken");

          if (refreshToken) {
            if (!refreshTokenPromise) {
              refreshTokenPromise = axiosInstancePublic.post(
                "/users/refresh-token",
                {
                  refreshToken,
                }
              );

              refreshTokenPromise.finally(() => {
                refreshTokenPromise = null;
              });
            }

            const { data } = await refreshTokenPromise;
            localStorageService?.setItem("token", data.token);
            sessionStorageService?.setItem("token", data.token);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${data.accessToken}`;

            return axiosInstancePrivate(originalRequest);
          } else {
            localStorageService.clear();
            sessionStorage.clear();

            const redirectPath = "/login";
            if (isValidRedirectPath(redirectPath)) {
              router.push(redirectPath);
            } else {
              secureLog(
                "warn",
                "Invalid redirect path attempted:",
                redirectPath
              );
              router.push("/login");
            }
          }
        } catch (refreshError) {
          secureLog("error", "Refresh token request failed:", refreshError);
          localStorageService.clear();
          sessionStorage.clear();
          router.push("/login");
        }
      }

      if (
        error.message === "No internet connection. Please check your network."
      ) {
        secureLog("error", "Network error:", error.message);
        return Promise.reject({
          success: false,
          message: error.message,
        });
      }

      if (error.response) {
        secureLog("error", "Response error:", error?.response?.data);
      } else if (error.request) {
        secureLog("error", "No response received:", {
          requestUrl: originalRequest?.url,
        });
      } else {
        secureLog("error", "Request error:", { message: error?.message });
      }

      return Promise.reject(error);
    }
  );

  axiosInstancePublic.interceptors.request.use(
    async (config) => {
      try {
        checkInternetConnection();

        applySecurityHeaders(config.headers);

        if (config.method !== "get") {
          const csrfToken = getCsrfToken();
          if (csrfToken && config.headers) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        }

        if (config.data && !(config.data instanceof FormData)) {
          config.data = validateRequestData(config.data);
        }

        return config;
      } catch (error) {
        secureLog("error", "Public request configuration error:", error);
        return Promise.reject(error);
      }
    },
    (error) => {
      secureLog("error", "Public request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  axiosInstancePublic.interceptors.response.use(
    (response) => {
      // Check for security headers in responses
      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("application/json")) {
        try {
          // Ensure response is properly formatted
          if (typeof response.data === "string") {
            response.data = JSON.parse(response.data);
          }
        } catch (e) {
          secureLog("error", "Invalid JSON response:", e);
        }
      }

      return response;
    },
    (error) => {
      // Handle rate limiting
      if (error?.response?.status === 429) {
        secureLog("warn", "Rate limit exceeded. Please try again later.");
        return Promise.reject({
          success: false,
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      secureLog(
        "error",
        "Public response error:",
        sanitizeSensitiveData(error)
      );
      return Promise.reject(error);
    }
  );
};
