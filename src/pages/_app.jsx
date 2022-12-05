import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from "next-auth/react";
import '@/assets/styles/globals.css'
import Wrapper from '@/components/layout/Wrapper';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
      <SessionProvider session={session}>
        <ChakraProvider>
          <Wrapper>
            <Component {...pageProps} />
          </Wrapper>
        </ChakraProvider>
      </SessionProvider>
  )
}

export default MyApp;
