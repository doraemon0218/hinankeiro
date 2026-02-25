/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === '1';
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages 用: 静的エクスポート（API・DB は動かない＝見た目デモのみ）
  ...(isGitHubPages && { output: 'export' }),
  ...(basePath && { basePath, assetPrefix: basePath + '/' }),
};

module.exports = nextConfig;
