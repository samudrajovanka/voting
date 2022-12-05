import { Box, Heading } from "@chakra-ui/react";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Voting</title>
      </Head>
      <Box minH="100vh" w="full" display="grid" placeContent="center">
        <Heading>Welcome to Voting KSM Android UPNVJ</Heading>
      </Box>
    </>
  )
}
