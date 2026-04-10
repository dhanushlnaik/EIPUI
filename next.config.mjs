import createMDXPlugin from "@next/mdx";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkHighlight from "remark-highlight.js";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// MDX plugin for handling .mdx files
const withMDX = createMDXPlugin({
  extension: /\.mdx$/,
  options: {
    providerImportSource: "@mdx-js/react",
    rehypePlugins: [],
    remarkPlugins: [remarkGfm, remarkHighlight],
  },
});

// MD plugin for handling .md files
const withMarkdown = createMDXPlugin({
  extension: /\.md$/,
  options: {
    providerImportSource: "@mdx-js/react",
    rehypePlugins: [],
    remarkPlugins: [remarkGfm, remarkHighlight],
  },
});

const nextConfig = withMDX(
  withMarkdown({
    compiler: {
      styledComponents: true,
    },
    experimental: {
      serverComponentsExternalPackages: ["eipw-lint-js"],
    },
    pageExtensions: ["mdx", "md", "tsx", "ts"],
    poweredByHeader: false,
    reactStrictMode: false,
    trailingSlash: false,
    typescript: {
      ignoreBuildErrors: true,
    },

    images: {
      domains: ['hackmd.io', 'etherworld.co'],
      unoptimized: true, // Required for Chakra UI Image components with static assets
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },

    webpack: (config, { isServer }) => {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["@chakra-ui/react"] = path.resolve(
        __dirname,
        "src/lib/chakra-react-compat.tsx"
      );
      config.resolve.alias["@chakra-ui/react-original"] = require.resolve(
        "@chakra-ui/react"
      );

      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      return config;
    },

    // Add the redirects method here
    async redirects() {
      return [];
    }
  })
);

export default nextConfig;
