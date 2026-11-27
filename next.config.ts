import type { NextConfig } from 'next';

// The free MVP runs entirely in the browser. Static export avoids a paid server.
// Future authenticated and premium APIs will live separately until hosting is reviewed.
const config: NextConfig = { output: 'export', images: { unoptimized: true } };
export default config;
