import connectDB from "@/lib/database/connectDB"
import ElectionModel from "@/models/ElectionModel";
import { unstable_getServerSession } from "next-auth";
import { getAuthOptions } from "pages/api/auth/[...nextauth]";

const handler = async (req, res) => {
  const { method } = req;

  const session = await unstable_getServerSession(req, res, getAuthOptions());

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: 401
    });
  }

  switch (method) {
    case "POST": {
      const { slugElection } = req.query;

      const election = await ElectionModel.findOne({ slug: slugElection });

      if (!election) {
        return res.status(404).json({
          success: false,
          message: "Election not found",
          code: 404
        });
      }

      const { candidateId } = req.body;

      if (!candidateId) {
        return res.status(400).json({
          success: false,
          message: "Candidate id is required",
          code: 400
        });
      }

      const dateNow = new Date();

      if (dateNow < election.startDate || dateNow >= election.endDate) {
        return res.status(400).json({
          success: false,
          message: "Election is not active",
          code: 400
        });
      }

      const userParticipantIndex = election.participants.findIndex((participant) => {
        return participant.email.toLowerCase() === session.user.email.toLowerCase();
      });

      if (userParticipantIndex === -1) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          code: 401
        });
      }

      if (election.participants[userParticipantIndex].vote) {
        return res.status(400).json({
          success: false,
          message: "You already voted",
          code: 400
        });
      }

      const candidateIndex = election.candidates.findIndex(candidate => candidate._id.toString() === candidateId);

      if (candidateIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Candidate not found",
          code: 400
        });
      }

      election.candidates[candidateIndex].totalVote += 1;
      election.participants[userParticipantIndex].vote = true;

      await election.save();

      return res.status(200).json({
        success: true,
        data: election,
        code: 200
      })
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
