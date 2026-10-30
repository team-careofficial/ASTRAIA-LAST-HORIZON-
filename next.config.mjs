const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    // Short URL for the static Mission Closure page in public/closure
    return [{ source: "/closure", destination: "/closure/index.html" }];
  },
};

export default nextConfig;
