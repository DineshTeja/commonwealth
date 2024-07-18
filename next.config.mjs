/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
        ];
    },
    async headers() {
        return [
          {
              source: "/:path*", // This pattern matches all routes
              headers: [
                  { key: "Access-Control-Allow-Credentials", value: "true" },
                  { key: "Access-Control-Allow-Origin", value: "*" }, // Adjust as necessary for security
                  { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS, PUT, DELETE" },
                  { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version" },
              ],
          },
        ];
     },
     reactStrictMode: true,
     webpack: (config, { isServer }) => {
       if (!isServer) {
         config.resolve.fallback = {
           ...config.resolve.fallback,
           fs: false,
           net: false,
           tls: false,
         };
       }
   
       // Exclude Supabase functions from the build
       config.externals.push({
         'supabase/functions': 'commonjs supabase/functions',
       });
   
       return config;
     },
};

export default nextConfig;
