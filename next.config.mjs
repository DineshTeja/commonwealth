/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: "/get_articles",
            // destination: "http://127.0.0.1:8080/get_articles",
            destination: "https://commonwealthai.netlify.app/get_articles",
          },
          // Add this new rewrite for call_openai
          {
            source: "/call_ai",
            // destination: "http://127.0.0.1:8080/call_ai", 
            destination: "https://commonwealthai.netlify.app/call_ai", 
          },
        ];
    },
    async headers() {
        return [
         {
            // matching all API routes
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                {
                key: "Access-Control-Allow-Origin",
                value: "*",
                }, // replace this your actual origin
                {
                key: "Access-Control-Allow-Methods",
                value: "GET,DELETE,PATCH,POST,PUT",
                },
                {
                key: "Access-Control-Allow-Headers",
                value:
                "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                },
            ],
         },
        ];
     },
};
    
export default nextConfig;
