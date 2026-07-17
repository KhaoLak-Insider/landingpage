import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:locale(de|en)/home",
        destination: "/:locale",
        permanent: true,
      },
      {
        source: "/editor",
        destination: "/admin/editor",
        permanent: true,
      },
      {
        source: "/editor/list",
        destination: "/admin/editor/list",
        permanent: true,
      },
      {
        source: "/editor/edit/:id",
        destination: "/admin/editor/edit/:id",
        permanent: true,
      },
      {
        source: "/editor/blog",
        destination: "/admin/blog/new",
        permanent: true,
      },
      {
        source: "/editor/blog/:id",
        destination: "/admin/blog/:id",
        permanent: true,
      },
      {
        source: "/admin/editor/blog",
        destination: "/admin/blog/new",
        permanent: true,
      },
      {
        source: "/admin/editor/blog/:id",
        destination: "/admin/blog/:id",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-e91d905941ab460b95ac5248c28e16f3.r2.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "xwlxvxzxqpekziawpppq.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "www.lafloraresort.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "webbox.imgix.net",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
