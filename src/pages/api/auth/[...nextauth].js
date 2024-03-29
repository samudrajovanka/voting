import ElectionModel from "@/models/ElectionModel";
import { deleteCookie, getCookie } from "cookies-next";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const getAuthOptions = (option) => {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    ],
    callbacks: {
      async signIn({ user }) {
        const election = await ElectionModel.findOne({ participants: {
          $elemMatch: { 
            email: {
              $regex: user.email,
              $options: "i"
            }
          }
        }});

        if (!election) {
          deleteCookie(process.env.NEXT_PUBLIC_EMAIL_KEY, { req: option.req, res: option.res });

          return false;
        };

        return true;
      }
    }
  }
}

export default async function auth(req, res) {
  const emailCookie = getCookie(process.env.NEXT_PUBLIC_EMAIL_KEY, { req, res })

  return await NextAuth(req, res, getAuthOptions({ email: emailCookie, req, res }));
}
