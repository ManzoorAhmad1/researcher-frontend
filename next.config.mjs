import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";

import { fileURLToPath } from "url";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";

// Get the equivalent of __filename in ESM
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  swcMinify: true,
  // Set a higher memory limit for Node.js during build
  env: {
    NEXT_MEMORY_LIMIT: "8192", // Increase memory limit to 8GB
  },
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === "production", // Remove console.logs in production
  },
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable compression
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // Add optimization to help with big string serialization warning
    if (!config.optimization) {
      config.optimization = {};
    }

    // Deterministic IDs help with cache efficiency
    config.optimization.moduleIds = "deterministic";

    // Use real content hash for better caching
    config.optimization.chunkIds = "deterministic";

    // Improve memory usage with better chunk splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          default: false,
          vendors: false,
          // PDF libraries in their own chunks with higher priority and better isolation
          pdfjs: {
            test: /[\\/]node_modules[\\/](pdfjs-dist|@react-pdf-viewer)[\\/]/,
            name: "pdf-libs",
            priority: 30,
            reuseExistingChunk: true,
            enforce: true,
          },
          reactPDF: {
            test: /[\\/]node_modules[\\/](@react-pdf)[\\/]/,
            name: "react-pdf-libs",
            priority: 25,
            reuseExistingChunk: true,
            enforce: true,
          },
          // All visualization libraries in their own chunk
          vizLibs: {
            test: /[\\/]node_modules[\\/](@nivo|@visx|apexcharts|react-apexcharts)[\\/]/,
            name: "viz-libs",
            priority: 20,
            reuseExistingChunk: true,
          },
          // All document processing libraries in their own chunk
          docLibs: {
            test: /[\\/]node_modules[\\/](@progress|xlsx|docx|jspdf|exceljs)[\\/]/,
            name: "doc-libs",
            priority: 15,
            reuseExistingChunk: true,
          },
          // React and core framework libraries
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|framer-motion)[\\/]/,
            name: "framework",
            priority: 40,
            reuseExistingChunk: true,
          },
          // UI component libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|rizzui|flowbite)[\\/]/,
            name: "ui-libs",
            priority: 10,
            reuseExistingChunk: true,
          },
          // Catch-all for remaining node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Configure cache for better performance with large files
    if (config.cache) {
      // Add memoryCacheUnaffected option if supported
      if (typeof config.cache === "object") {
        // Configure snapshot options for better handling of large files
        if (!config.snapshot) {
          config.snapshot = {};
        }

        // Improve memory management during build
        config.snapshot.managedPaths = [
          /^(.+?[\\/]node_modules[\\/])(?!@progress|pdfjs-dist|@react-pdf-viewer|@react-pdf)/,
        ];

        // Exclude large file patterns from being cached as strings
        config.snapshot.immutablePaths = [];

        // Limit memory usage for build cache
        if (!dev) {
          config.cache.maxMemoryGenerations = 1;
        }
      }
    }

    // Ensure that pdf.worker.js is bundled and available for the client
    if (!isServer) {
      // Improved PDF worker configuration
      config.module.rules.push({
        test: /pdf\.worker\.js$/,
        type: "asset/resource",
        generator: {
          filename: "static/chunks/[name].[hash][ext]",
        },
      });

      // Add specific handling for PDF libraries to reduce memory usage during build
      config.module.rules.push({
        test: /[\\/]node_modules[\\/](pdfjs-dist|@react-pdf-viewer|@react-pdf)[\\/].+\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["next/babel", { "preset-env": { modules: "commonjs" } }],
            ],
            plugins: [],
            cacheDirectory: false,
          },
        },
      });
    }

    // Add memory optimization settings
    config.optimization.minimize = !dev;
    config.optimization.minimizer = [
      ...(config.optimization.minimizer || []),
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: !dev,
          },
          mangle: true,
        },
      }),
    ];

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    domains: [
      "lh3.googleusercontent.com",
      "ihgjcrfmdpdjvnoqknoh.supabase.co",
      "shyulpexykcgruhbjihk.supabase.co",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    instrumentationHook: true,
    optimizeCss: {
      critters: {
        reduceInlineStyles: false,
      },
    },
    // Optimize node_modules by isolating heavy imports for tree-shaking
    optimizePackageImports: ["react-icons", "date-fns", "lodash"],
    // Add PDF packages back to serverComponentsExternalPackages with proper configuration
    serverComponentsExternalPackages: [
      "pdfjs-dist",
      "@react-pdf-viewer/core",
      "@react-pdf/renderer",
      "@progress/kendo-react-pdf",
    ],
  },
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

// Configure the bundle analyzer
const withBundleAnalyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Configure Sentry with optimized settings
const sentryConfig = {
  // Basic configuration
  org: process.env.NEXT_PUBLIC_SENTRY_ORG,
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
  telemetry: false,

  // Only print logs for uploading source maps in CI
  silent: false,

  // Disable source maps features to reduce build complexity
  widenClientFileUpload: false,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    disable: true,
  },

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Disable automatic Vercel Cron Monitors
  automaticVercelMonitors: false,
};

const finalConfig = withBundleAnalyzerConfig(
  withSentryConfig(nextConfig, sentryConfig)
);

export default finalConfig;

// export default withBundleAnalyzerConfig(nextConfig);