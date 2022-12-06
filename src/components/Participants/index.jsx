import {
  Badge,
  Box,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text
} from "@chakra-ui/react";
import { setCookie } from "cookies-next";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { FaCheckCircle, FaChevronRight, FaSearch, FaTimesCircle } from "react-icons/fa";

const Participants = ({
  participants
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { data: session } = useSession();

  const calculateParticipantsVoted = (participantsElection) => {
    let participantsElectionVoted = 0;
    participantsElection.forEach((participant) => {
      if (participant.vote) {
        participantsElectionVoted++;
      }
    });
    return participantsElectionVoted;
  };

  const handleLogin = (email) => {
    if (session) return;

    setCookie(process.env.NEXT_PUBLIC_EMAIL_KEY, email);

    signIn('google', { email }, { login_hint: email, prompt: 'login' });
  }

  return (
    <>
      <Box display="flex" alignItems="center" gap="4px">
        <Heading fontSize="lg">Participants</Heading>

        <Badge>Total {participants.length}</Badge>

        <Badge colorScheme="green">
          Voted {calculateParticipantsVoted(participants)}
        </Badge>

        <Badge colorScheme="red">
          Unvoted {participants.length - calculateParticipantsVoted(participants)}
        </Badge>
      </Box>

      <Text fontSize="sm" color="grey">Search your name and click your account to login</Text>

      <InputGroup mt="8px" mb="20px">
        <Input
          placeholder="Search by name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)} 
        />
        <InputRightElement>
          <FaSearch />
        </InputRightElement>
      </InputGroup>

      <Box mt="12px" display="flex" flexDir="column" gap="16px">
        {participants
          .filter((participant) => RegExp(`${searchValue}`, 'gi').test(participant.name))
          .map((participant) => (
            <Card
              key={participant.name}
              onClick={() => handleLogin(participant.email)}
              cursor={session ? 'default' : 'pointer'}
            >
              <CardBody display="flex" alignItems="center" gap="8px">
                {participant.vote && (
                  <FaCheckCircle color="green" />
                )}

                {!participant.vote && (
                  <FaTimesCircle color="red" />
                )}

                <Box>
                  <Text>{participant.name}</Text>
                  <Text color="grey" fontSize="sm">{participant.email}</Text>
                </Box>

                {!session && (
                  <Box as={FaChevronRight} ml="auto" />
                )}
              </CardBody>
            </Card>
        ))}
      </Box>
    </>
  )
}

export default Participants;
