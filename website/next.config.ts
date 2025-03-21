import type { NextConfig } from "next";
const path = require('path');

const nextConfig: NextConfig = {
  	images: {
    	localPatterns: [
      		{
        		pathname: '/**',
        		search: '',
      		},
    	],
    	remotePatterns: [
      		{
			protocol: 'http',
			hostname: 'w3.org',
			port: '',
			pathname: '/2000/svg/**',
			search: '',
      		},
    	],
 	},
	webpack: (config) => {
		config.resolve.alias['@'] = path.resolve(__dirname, './');
		return config;
	},
};

export default nextConfig;
