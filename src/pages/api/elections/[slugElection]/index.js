import connectDB from "@/lib/database/connectDB"
import ElectionModel from "@/models/ElectionModel";

const handler = async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET": {
      const { slugElection } = req.query;

      const election = await ElectionModel.findOne({ slug: slugElection });

      if (!election) {
        return res.status(404).json({
          success: false,
          message: "Election not found",
          code: 404
        });
      }

      return res.status(200).json({
        success: true,
        data: election,
        code: 200
      })
    }
    case 'PUT': {
      const { ADMIN_KEY } = req.headers;

      if (ADMIN_KEY !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          code: 401
        });
      }

      const { slugElection } = req.query;

      const election = await ElectionModel.findOne({ slug: slugElection });

      if (!election) {
        return res.status(404).json({
          success: false,
          message: "Election not found",
          code: 404
        });
      }

      const { status } = req.body;

      if (!status || ["CREATED", "ONGOING", "FINISHED"].indexOf(status) === -1) {
        return res.status(400).json({
          success: false,
          message: "Status is required or status is invalid",
          code: 400
        });
      }

      election.status = status;

      await election.save();

      return res.status(200).json({
        success: true,
        data: election,
        code: 200
      });
    }
    default: {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
        code: 405
      });
    }
  }
}

export default connectDB(handler);
