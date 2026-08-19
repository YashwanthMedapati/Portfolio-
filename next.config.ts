import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*.map",
          destination: "/404-source-map-blocked",
        },
      ],
    };
  },
  async headers() {
    const baseHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      },
    ];

    // CSP (and HSTS) only in production: dev needs 'unsafe-eval' for React's
    // own debugging instrumentation, and frame-ancestors 'none' blocks
    // legitimate local preview tooling that renders the dev server in an
    // iframe - neither is a real production security concern, so rather
    // than loosen the policy that ships, it just doesn't apply locally.
    const productionHeaders =
      process.env.NODE_ENV === "production"
        ? [
            {
              // 'unsafe-inline' on script/style is required for Next.js's
              // own hydration payload and JSX inline `style` attributes
              // used throughout - everything else on this static, API-less
              // site is same-origin, so external script/style/frame/object
              // sources are otherwise fully blocked.
              key: "Content-Security-Policy",
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "font-src 'self' data:",
                "connect-src 'self'",
                // 'self' (not 'none'): the Resume section iframes the resume
                // PDF for an inline preview - that's a same-origin frame,
                // and this header applies to every response (including the
                // PDF itself via the /:path* matcher below), so 'none' would
                // block the site from framing its own PDF. X-Frame-Options:
                // SAMEORIGIN above already stops third-party framing either way.
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'self'",
              ].join("; "),
            },
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin",
            },
            {
              key: "Cross-Origin-Resource-Policy",
              value: "same-origin",
            },
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains",
            },
          ]
        : [];

    return [
      {
        source: "/:path*",
        headers: [...baseHeaders, ...productionHeaders],
      },
    ];
  },
};

export default nextConfig;
