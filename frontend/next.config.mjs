/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Reown AppKit / WalletConnect pulls in optional deps that Next tries to bundle for SSR.
  webpack: (config, { webpack }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // Optional wagmi connectors (porto, metamask-connect, tempo) we don't use but whose imports
    // of uninstalled peer deps break the build.
    config.plugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /^(porto(\/.*)?|@metamask\/connect-evm|accounts|@wagmi\/core\/tempo|@base-org\/account(\/.*)?)$/,
    }));
    return config;
  },
};

export default nextConfig;
