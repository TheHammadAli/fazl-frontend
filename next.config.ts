/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "market-knayf-app-bucket.s3.us-east-1.amazonaws.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
