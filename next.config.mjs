/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "f5z6vohtd8.ufs.sh",
            },
        ],
    },
};

export default nextConfig;
