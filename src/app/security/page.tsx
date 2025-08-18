import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Security Documentation | Research Collab",
  description:
    "Security guidelines, best practices, and documentation for Research Collab platform",
};

export default function SecurityDocumentation() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Security Documentation</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="overview">
          Security Overview
        </h2>
        <p className="text-gray-700 mb-4">
          Research Collab is built with security as a fundamental principle.
          This documentation outlines the security measures in place and
          provides guidelines for secure usage of the platform.
        </p>
        <p className="text-gray-700 mb-4">
          Our security strategy includes multiple layers of protection:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
          <li>
            Application security (input sanitization, CSRF protection, etc.)
          </li>
          <li>Infrastructure security (HTTPS, rate limiting, etc.)</li>
          <li>Data security (encryption, secure storage)</li>
          <li>Authentication and authorization controls</li>
          <li>Regular security audits and dependency updates</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="security-features">
          Built-in Security Features
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">HTTP Security Headers</h3>
          <p className="text-gray-700 mb-2">
            Our application implements the following security headers:
          </p>
          <ul className="list-disc list-inside ml-4 text-gray-700">
            <li>Content-Security-Policy (CSP)</li>
            <li>X-XSS-Protection</li>
            <li>X-Content-Type-Options</li>
            <li>Strict-Transport-Security (HSTS)</li>
            <li>X-Frame-Options</li>
            <li>Referrer-Policy</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">CSRF Protection</h3>
          <p className="text-gray-700 mb-2">
            Cross-Site Request Forgery protection is implemented for all
            state-changing operations. CSRF tokens are required for forms and
            API calls that modify data.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">
            Input Validation & Sanitization
          </h3>
          <p className="text-gray-700 mb-2">
            All user inputs are validated and sanitized to prevent injection
            attacks:
          </p>
          <ul className="list-disc list-inside ml-4 text-gray-700">
            <li>XSS protection through DOMPurify</li>
            <li>SQL injection protection through parameterized queries</li>
            <li>Client and server-side validation</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Rate Limiting</h3>
          <p className="text-gray-700 mb-2">
            API endpoints are protected against brute force and DoS attacks with
            rate limiting.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Secure Storage</h3>
          <p className="text-gray-700 mb-2">
            Sensitive data is stored securely:
          </p>
          <ul className="list-disc list-inside ml-4 text-gray-700">
            <li>Passwords are hashed using bcrypt</li>
            <li>API keys and secrets are encrypted</li>
            <li>Memory-first approach for authentication tokens</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="guidelines">
          Security Usage Guidelines
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">For Developers</h3>
          <ul className="list-disc list-inside ml-4 text-gray-700 space-y-2">
            <li>
              Always use the provided sanitization utilities for user-generated
              content
            </li>
            <li>
              Never use <code className="bg-gray-100 px-1">innerHTML</code> or{" "}
              <code className="bg-gray-100 px-1">dangerouslySetInnerHTML</code>{" "}
              without sanitization
            </li>
            <li>Include CSRF tokens in all forms that modify data</li>
            <li>
              Use server-side validation even when client-side validation is
              present
            </li>
            <li>
              Never store sensitive information in localStorage or client-side
              code
            </li>
            <li>Keep all dependencies updated</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">For Users</h3>
          <ul className="list-disc list-inside ml-4 text-gray-700 space-y-2">
            <li>Use strong, unique passwords</li>
            <li>Enable two-factor authentication when available</li>
            <li>Be cautious of phishing attempts or suspicious links</li>
            <li>Log out when using shared devices</li>
            <li>Report any security concerns to our team immediately</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="env-variables">
          Environment Variables
        </h2>
        <p className="text-gray-700 mb-4">
          The following environment variables must be properly configured for
          security features to work:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  API_SECRET
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Secret key for API authentication
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  CSRF_SECRET
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Secret for CSRF token generation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  NEXT_PUBLIC_API_URL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  API endpoint URL (public)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  DATABASE_URL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Database connection string
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  SESSION_SECRET
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Secret for session management
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Yes
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Never commit .env files to version control.
            Use .env.example for documentation purposes only.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="best-practices">
          Security Best Practices
        </h2>

        <ul className="space-y-4 text-gray-700">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Keep Dependencies Updated</h4>
              <p className="text-sm">
                Regularly update all dependencies to patch security
                vulnerabilities. Run{" "}
                <code className="bg-gray-100 px-1">npm audit fix</code>{" "}
                regularly.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Use Content Security Policy</h4>
              <p className="text-sm">
                Implement a strict CSP to prevent XSS and data injection
                attacks.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Implement Proper Authentication</h4>
              <p className="text-sm">
                Use robust authentication mechanisms including password
                policies, account lockouts, and 2FA where possible.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Validate All Input</h4>
              <p className="text-sm">
                Never trust user input. Always validate and sanitize on both
                client and server.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Use HTTPS</h4>
              <p className="text-sm">
                Always use HTTPS in production to encrypt data in transit.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="flex-shrink-0 h-6 w-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2 mt-0.5">
              ✓
            </span>
            <div>
              <h4 className="font-medium">Follow Least Privilege Principle</h4>
              <p className="text-sm">
                Assign the minimum necessary permissions to users, services, and
                processes.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4" id="reporting">
          Security Reporting
        </h2>
        <p className="text-gray-700 mb-4">
          If you discover a security vulnerability, please report it immediately
          to{" "}
          <a
            href="mailto:security@researchcollab.com"
            className="text-blue-600 hover:underline"
          >
            security@researchcollab.com
          </a>
          .
        </p>
        <div className="p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">
            Responsible Disclosure:
          </h4>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Provide detailed information about the vulnerability</li>
            <li>Allow reasonable time for remediation before disclosure</li>
            <li>Avoid accessing or modifying user data</li>
            <li>Do not exploit vulnerabilities beyond verification</li>
          </ol>
        </div>
      </section>

      <div className="border-t pt-6 text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
