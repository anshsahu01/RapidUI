/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid Windows file-lock cache rename issues (EPERM) in local dev.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
