#!/usr/bin/env node

/**
 * Project Security Scan
 *
 * This script scans the project for common security issues including:
 * - Hard-coded secrets
 * - Potential security vulnerabilities in patterns
 * - Insecure dependencies
 * - Frontend security issues
 *
 * Run with: node scripts/project-security-scan.js
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Configuration
const config = {
  excludeDirs: ["node_modules", ".git", ".next", "public", "dist", "build"],
  fileExtensions: [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".env",
    ".env.local",
    ".env.development",
  ],
  maxFileSizeKb: 1000, // Skip files larger than 1MB
};

// Patterns to detect potential security issues
const securityPatterns = [
  {
    pattern: /(const|let|var)?\s*\w+key\s*=\s*["'][\w\d\+\/\=]{16,}["']/gi,
    description: "Possible hardcoded API key",
  },
  {
    pattern: /(const|let|var)?\s*\w+secret\s*=\s*["'][\w\d\+\/\=]{16,}["']/gi,
    description: "Possible hardcoded secret",
  },
  {
    pattern: /password\s*=\s*["'][^"']{3,}["']/gi,
    description: "Possible hardcoded password",
  },
  {
    pattern: /dangerouslySetInnerHTML/g,
    description:
      "Dangerous innerHTML usage - XSS risk if not properly sanitized",
  },
  {
    pattern: /innerHTML\s*=/g,
    description:
      "Direct innerHTML manipulation - XSS risk if not properly sanitized",
  },
  {
    pattern: /document\.write/g,
    description: "Insecure document.write usage - XSS risk",
  },
  {
    pattern: /eval\s*\(/g,
    description: "Dangerous eval() usage - Code injection risk",
  },
  {
    pattern: /setTimeout\s*\(\s*["']/g,
    description: "setTimeout with string argument - Code injection risk",
  },
  {
    pattern: /setInterval\s*\(\s*["']/g,
    description: "setInterval with string argument - Code injection risk",
  },
  {
    pattern: /innerText\s*=/g,
    description: "innerText usage - Verify content is properly sanitized",
  },
  {
    pattern: /cors\s*\(\s*\{\s*origin\s*:\s*["']\*/g,
    description: "CORS configured to allow all origins (*) - Security risk",
  },
  {
    pattern: /noValidate/g,
    description:
      "Form validation disabled - Ensure server-side validation exists",
  },
  {
    pattern: /https:\/\/\w+\.ngrok\.io/g,
    description: "Ngrok URL in code - Temporary development URL",
  },
];

// Files to specifically check
const criticalFiles = [
  { name: ".env", description: "Environment Variables" },
  { name: "next.config.js", description: "Next.js Configuration" },
  { name: "next.config.mjs", description: "Next.js Configuration" },
  { name: "package.json", description: "Dependencies" },
  { name: "middleware.ts", description: "Next.js Middleware" },
  { name: ".gitignore", description: "Git Ignore Rules" },
];

// Statistics
const stats = {
  filesScanned: 0,
  issuesFound: 0,
  criticalIssues: 0,
  warningIssues: 0,
  infoIssues: 0,
};

// Main scan function
async function scanProject() {
  console.log(
    `${colors.bold}${colors.blue}Starting Security Scan${colors.reset}\n`
  );

  try {
    // Start with the project root
    const rootDir = path.resolve(__dirname, "..");

    // Check for critical files
    await checkCriticalFiles(rootDir);

    // Scan all project files
    await scanDirectory(rootDir);

    // Print summary
    printSummary();
  } catch (error) {
    console.error(`${colors.red}Error scanning project:${colors.reset}`, error);
  }
}

// Check specific critical files
async function checkCriticalFiles(rootDir) {
  console.log(`${colors.bold}Checking critical files:${colors.reset}\n`);

  for (const file of criticalFiles) {
    const filePath = path.join(rootDir, file.name);

    try {
      await statAsync(filePath);
      console.log(
        `${colors.green}✓${colors.reset} Found ${file.name} (${file.description})`
      );

      // For .env files, check for proper encryption and sensitive data
      if (file.name.includes(".env")) {
        await checkEnvFile(filePath);
      }

      // Check package.json for outdated dependencies
      if (file.name === "package.json") {
        await checkPackageJson(filePath);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(
          `${colors.yellow}⚠${colors.reset} Missing ${file.name} (${file.description})`
        );
      } else {
        console.error(
          `${colors.red}Error checking ${file.name}:${colors.reset}`,
          err.message
        );
      }
    }
  }

  console.log(); // Add newline
}

// Check .env file for potential issues
async function checkEnvFile(filePath) {
  try {
    const content = await readFileAsync(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.trim() && !line.startsWith("#")) {
        const [key, value] = line.split("=");

        // Check if key contains sensitive words
        const sensitiveKeys = [
          "SECRET",
          "KEY",
          "PASSWORD",
          "TOKEN",
          "CREDENTIALS",
        ];
        const isSensitive = sensitiveKeys.some((word) => key?.includes(word));

        if (isSensitive && !key?.startsWith("NEXT_PUBLIC_")) {
          console.log(
            `  ${colors.yellow}⚠${colors.reset} Sensitive variable found: ${key}`
          );
          stats.warningIssues++;
        }

        // Check for public environment variables that contain sensitive data
        if (key?.startsWith("NEXT_PUBLIC_") && isSensitive) {
          console.log(
            `  ${colors.red}✗${colors.reset} Public sensitive variable: ${key}`
          );
          stats.criticalIssues++;
        }
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}Error checking .env file:${colors.reset}`,
      error.message
    );
  }
}

// Check package.json for outdated or vulnerable dependencies
async function checkPackageJson(filePath) {
  try {
    const content = await readFileAsync(filePath, "utf8");
    const packageJson = JSON.parse(content);

    // Check for outdated React version
    const reactVersion = packageJson.dependencies?.react;
    if (reactVersion && reactVersion.match(/\d+/)[0] < 17) {
      console.log(
        `  ${colors.yellow}⚠${colors.reset} Outdated React version: ${reactVersion}`
      );
      stats.warningIssues++;
    }

    // Check for known vulnerable packages
    const vulnerablePackages = [
      "serialize-javascript@<3.1.0",
      "lodash@<4.17.19",
      "minimist@<1.2.6",
      "node-notifier@<8.0.1",
      "axios@<0.21.1",
    ];

    for (const [name, version] of Object.entries({
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    })) {
      const cleanVersion = version.replace(/^\^|~/, "");

      for (const vulnPackage of vulnerablePackages) {
        const [vulnName, vulnVersionRange] = vulnPackage.split("@");
        if (name === vulnName) {
          if (
            vulnVersionRange.startsWith("<") &&
            compareVersions(cleanVersion, vulnVersionRange.substring(1)) < 0
          ) {
            console.log(
              `  ${colors.red}✗${colors.reset} Vulnerable package: ${name}@${version}`
            );
            stats.criticalIssues++;
          }
        }
      }
    }

    // Suggest running npm audit
    console.log(
      `  ${colors.blue}ℹ${colors.reset} Run 'npm audit' for a full dependency security check`
    );
  } catch (error) {
    console.error(
      `${colors.red}Error checking package.json:${colors.reset}`,
      error.message
    );
  }
}

// Scan all files in a directory recursively
async function scanDirectory(dirPath) {
  // Read directory contents
  const items = await readdirAsync(dirPath);

  // Process each item
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = await statAsync(itemPath);

    // Skip excluded directories
    if (stats.isDirectory()) {
      if (!config.excludeDirs.includes(item)) {
        await scanDirectory(itemPath);
      }
      continue;
    }

    // Check if file extension is in the list to scan
    const ext = path.extname(item).toLowerCase();
    if (!config.fileExtensions.includes(ext)) {
      continue;
    }

    // Skip large files
    if (stats.size > config.maxFileSizeKb * 1024) {
      continue;
    }

    // Scan file
    await scanFile(itemPath);
  }
}

// Scan a single file for security issues
async function scanFile(filePath) {
  try {
    const content = await readFileAsync(filePath, "utf8");
    const relativePath = path.relative(path.resolve(__dirname, ".."), filePath);
    let foundIssue = false;

    stats.filesScanned++;

    // Check for each security pattern
    for (const { pattern, description } of securityPatterns) {
      const matches = content.match(pattern);

      if (matches && matches.length > 0) {
        if (!foundIssue) {
          console.log(`\n${colors.bold}${relativePath}${colors.reset}`);
          foundIssue = true;
        }

        console.log(
          `  ${colors.yellow}⚠${colors.reset} ${description} (${matches.length} occurrences)`
        );
        stats.warningIssues++;
        stats.issuesFound++;
      }
    }

    // Check for inline scripts (in HTML/JSX)
    if (filePath.endsWith(".jsx") || filePath.endsWith(".tsx")) {
      const inlineScriptMatches = content.match(/on\w+=\{.*?\}/g);
      if (inlineScriptMatches && inlineScriptMatches.length > 0) {
        if (!foundIssue) {
          console.log(`\n${colors.bold}${relativePath}${colors.reset}`);
          foundIssue = true;
        }

        console.log(
          `  ${colors.blue}ℹ${colors.reset} Inline event handlers (${inlineScriptMatches.length} occurrences) - Verify for unsafe code execution`
        );
        stats.infoIssues++;
        stats.issuesFound++;
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}Error scanning file ${filePath}:${colors.reset}`,
      error.message
    );
  }
}

// Print summary of scan results
function printSummary() {
  console.log(
    `\n${colors.bold}${colors.blue}Security Scan Summary${colors.reset}\n`
  );
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Total issues found: ${stats.issuesFound}`);
  console.log(
    `  ${colors.red}Critical issues:${colors.reset} ${stats.criticalIssues}`
  );
  console.log(
    `  ${colors.yellow}Warning issues:${colors.reset} ${stats.warningIssues}`
  );
  console.log(
    `  ${colors.blue}Info issues:${colors.reset} ${stats.infoIssues}`
  );

  if (stats.criticalIssues > 0) {
    console.log(
      `\n${colors.red}${colors.bold}Action required:${colors.reset} Fix critical issues before deploying to production!`
    );
  } else if (stats.warningIssues > 0) {
    console.log(
      `\n${colors.yellow}${colors.bold}Action recommended:${colors.reset} Address warnings to improve security posture.`
    );
  } else if (stats.issuesFound === 0) {
    console.log(
      `\n${colors.green}${colors.bold}No security issues detected!${colors.reset}`
    );
  }

  console.log(`\n${colors.bold}Next steps:${colors.reset}`);
  console.log(
    `- Run 'npm run security' for HTTP security header check and dependency audit`
  );
  console.log(
    `- Use 'npm audit fix' to automatically fix detected vulnerabilities`
  );
  console.log(
    `- Review security documentation at '/security' for best practices`
  );
}

// Helper function to compare version numbers
function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;

    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

// Run the scan
scanProject();
