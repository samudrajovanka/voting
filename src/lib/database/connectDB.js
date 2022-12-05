import mongoose from 'mongoose';

import apiKeyAccess from '@/api-middleware/apiKeyAccess';

const connectDB = (handler) => async (req, res) => {
  try {
    apiKeyAccess(req);

    if (mongoose.connections[0].readyState) {
      return handler(req, res);
    }

    await mongoose.connect(process.env.MONGO_URI ?? '');

    return handler(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message ?? "Database error",
      code: 500
    })
  }
};

export default connectDB;
