const getBaseUrl = () => {
  let URL;

  if (process.env.VERCEL_ENV === 'production') {
    URL = 'https://voting-android.vercel.app';
  } else {
    URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  }
  return URL;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    BASE_URL_API: `${getBaseUrl()}/api`,
  },
  images: {
    domains: ['firebasestorage.googleapis.com']
  }
}

module.exports = nextConfig
