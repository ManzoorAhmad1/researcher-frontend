#!/usr/bin/env node

/**
 * Security Headers Check Script
 *
 * This script checks that HTTP security headers are properly set
 * for your application URL. Run it to verify that your security
 * headers configuration is working correctly.
 */

const https = require("https");
const http = require("http");

// URL to check (change to your application URL)
const URL_TO_CHECK = process.env.URL_TO_CHECK || "http://localhost:3000";

console.log(`\n🔒 Checking security headers for: ${URL_TO_CHECK}\n`);

// Headers that should be present
const REQUIRED_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "x-xss-protection",
  "referrer-policy",
];

// Optional but recommended headers
const RECOMMENDED_HEADERS = ["strict-transport-security", "permissions-policy"];

// Headers that should not be present
const FORBIDDEN_HEADERS = ["x-powered-by", "server"];

// Function to make a request and check headers
function checkSecurityHeaders(url) {
  const client = url.startsWith("https") ? https : http;

  const request = client.get(url, (response) => {
    const { statusCode } = response;
    const headers = response.headers;

    console.log(`Status code: ${statusCode}\n`);
    console.log("Security Headers:\n");

    // Check required headers
    let missingRequired = [];
    REQUIRED_HEADERS.forEach((header) => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        missingRequired.push(header);
        console.log(`❌ ${header}: MISSING`);
      }
    });

    // Check recommended headers
    let missingRecommended = [];
    RECOMMENDED_HEADERS.forEach((header) => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        missingRecommended.push(header);
        console.log(`⚠️ ${header}: MISSING (recommended)`);
      }
    });

    // Check forbidden headers
    let presentForbidden = [];
    FORBIDDEN_HEADERS.forEach((header) => {
      if (headers[header]) {
        presentForbidden.push(header);
        console.log(`❌ ${header}: ${headers[header]} (should be removed)`);
      } else {
        console.log(`✅ ${header}: not present (good)`);
      }
    });

    // Extra security headers that might be present
    const extraSecurityHeaders = Object.keys(headers).filter(
      (h) =>
        !REQUIRED_HEADERS.includes(h) &&
        !RECOMMENDED_HEADERS.includes(h) &&
        !FORBIDDEN_HEADERS.includes(h) &&
        (h.startsWith("x-") || h.includes("security"))
    );

    if (extraSecurityHeaders.length > 0) {
      console.log("\nAdditional Security Headers:");
      extraSecurityHeaders.forEach((header) => {
        console.log(`ℹ️ ${header}: ${headers[header]}`);
      });
    }

    // Summary
    console.log("\nSecurity Headers Summary:");

    if (missingRequired.length === 0 && presentForbidden.length === 0) {
      console.log("✅ All required security headers are present!");
    } else {
      if (missingRequired.length > 0) {
        console.log(
          `❌ Missing required headers: ${missingRequired.join(", ")}`
        );
      }
      if (presentForbidden.length > 0) {
        console.log(
          `❌ Insecure headers present: ${presentForbidden.join(", ")}`
        );
      }
    }

    if (missingRecommended.length > 0) {
      console.log(
        `⚠️ Missing recommended headers: ${missingRecommended.join(", ")}`
      );
    }

    // CSP Analysis if present
    if (headers["content-security-policy"]) {
      console.log("\nContent Security Policy Analysis:");
      const csp = headers["content-security-policy"];

      // Check for unsafe-inline
      if (csp.includes("'unsafe-inline'")) {
        console.log(`⚠️ CSP uses 'unsafe-inline' which weakens XSS protection`);
      }

      // Check for unsafe-eval
      if (csp.includes("'unsafe-eval'")) {
        console.log(`⚠️ CSP uses 'unsafe-eval' which weakens XSS protection`);
      }

      // Check for default-src 'none'
      if (!csp.includes("default-src")) {
        console.log(`⚠️ CSP is missing default-src directive`);
      }

      // Check if frame-ancestors is set
      if (!csp.includes("frame-ancestors")) {
        console.log(
          `⚠️ CSP is missing frame-ancestors directive (clickjacking protection)`
        );
      }
    }

    // HTTPS Check
    if (url.startsWith("http://") && !url.includes("localhost")) {
      console.log(
        "\n⚠️ Using HTTP instead of HTTPS in production is not recommended"
      );
    }
  });

  request.on("error", (err) => {
    console.log(`❌ Request error:`);
    console.error(err);
  });
}

// Run the check
checkSecurityHeaders(URL_TO_CHECK);
