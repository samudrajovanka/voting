import { Box } from "@chakra-ui/react";

const Wrapper = ({ children }) => {
  return (
    <Box maxW="6xl" w="calc(100% - 32px)" marginX="auto">
      {children}
    </Box>
  )
}

export default Wrapper;
