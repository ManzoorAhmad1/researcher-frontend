# research-collab

## Description

Research Collab is a collaborative platform designed to facilitate research activities and enhance teamwork among researchers.

## Installation

To install the necessary packages, run:

```bash
npm install
```

## Usage

To run the project in development mode, use:

```bash
npm run dev
```

## Security Measures

Our application implements comprehensive security measures to protect against common web vulnerabilities:

### Built-in Security Features

#### HTTP Security Headers

Our application implements the following security headers:

- Content-Security-Policy (CSP)
- X-XSS-Protection
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- Referrer-Policy

#### CSRF Protection

Cross-Site Request Forgery protection is implemented for all state-changing operations. CSRF tokens are required for forms and API calls that modify data.

#### Input Validation & Sanitization

All user inputs are validated and sanitized to prevent injection attacks:

- XSS protection through DOMPurify
- Client and server-side validation
- Deep object sanitization

#### Rate Limiting

To prevent abuse, the application implements rate limiting:

- Configurable request throttling (150 requests per 30 seconds)
- Proper error handling for rate-limited requests

#### Secure Storage

Sensitive data is handled securely:

- Authentication tokens with proper validation
- Protected against XSS token theft
- Environmental variable validation

#### Enhanced Security Monitoring

- CSP violation reporting and monitoring
- Production-aware error logging
- Sensitive data redaction in logs

#### API Security

- Automatic request/response validation
- CORS protection with environment-aware configuration
- Standardized security headers for all API requests

#### WebSocket Security

- Connection validation
- Origin verification
- Message sanitization

### Usage Guidelines

#### CSRF Protection

CSRF protection is implemented automatically for all API requests. The token is included in API requests:

```js
// Token is automatically included by our request utility
const response = await axiosInstancePrivate.post("/api/data", formData);
```

#### Input Sanitization

All request data is automatically sanitized by our request utility. For manual sanitization:

```js
import DOMPurify from "dompurify";

// Sanitize user-generated HTML
const sanitizedHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ["p", "a", "ul", "li", "b", "i", "strong", "em"],
  ALLOWED_ATTR: ["href", "target", "rel"],
});
```

### Environment Variables

The following environment variables are required for security features:

| Variable                   | Description                        | Required |
| -------------------------- | ---------------------------------- | -------- |
| NEXT_PUBLIC_API_URL        | Frontend API URL                   | Yes      |
| API_SECRET                 | Backend API secret                 | Yes      |
| CSRF_SECRET                | Secret for CSRF token generation   | Yes      |
| NEXT_PUBLIC_CSP_REPORT_URI | Endpoint for CSP violation reports | No       |

> **Note:** In production, use a secure secret management system. Never commit secrets to your repository.

### Security Best Practices

1. **Keep dependencies updated**: Regularly run `npm audit` and update vulnerable dependencies.
2. **Use Content Security Policy**: CSP is automatically configured but can be customized for your specific needs.
3. **Implement proper authentication**: Use secure authentication methods and protect API routes.
4. **Validate all input**: All user input should be validated both client-side and server-side.
5. **Use HTTPS**: Always use HTTPS in production environments.
6. **Follow least privilege principle**: Only grant the minimum permissions necessary.
7. **Monitor for security violations**: Check CSP reports and error logs regularly.

### Security Testing

The application includes built-in security testing tools:

```bash
# Run all security checks
npm run security

# Run specific checks
npm run security-check      # Checks security headers
npm run security-scan       # Scans code for security issues
npm run npm-audit           # Checks dependencies for vulnerabilities
```

## Environment Variables

This project requires the following environment variables:

```
NEXT_PUBLIC_API_URL=<api-url>
API_SECRET=<secret-key-for-api-signing>
CSRF_SECRET=<secret-key-for-csrf-tokens>
```

For production, ensure all secrets are properly managed and rotated regularly.

## Security Best Practices

1. **Keep Dependencies Updated** - Regularly run `npm audit` and update packages.
2. **Use Content Security Policy** - The CSP headers are already configured in middleware.
3. **Implement Proper Authentication** - Use secure authentication methods.
4. **Validate All Input** - Use the provided validation utilities.
5. **Use HTTPS Everywhere** - All production deployments should use HTTPS.
6. **Follow the Principle of Least Privilege** - Minimize permissions for all components.
