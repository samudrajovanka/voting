const apiKeyAccess = (req) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== process.env.NEXT_PUBLIC_API_KEY) {
    throw new Error("API key is not valid");
  }
};

export default apiKeyAccess;
