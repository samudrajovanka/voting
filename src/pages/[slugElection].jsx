import { useEffect, useState } from "react";
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Tag,
  Text,
  UnorderedList,
  useDisclosure
} from "@chakra-ui/react";
import Image from "next/image";
import dayjs from "dayjs";
import { FaCheckCircle, FaTimesCircle, FaChevronRight, FaSearch } from "react-icons/fa";
import { signIn, signOut, useSession } from "next-auth/react";
import { deleteCookie, setCookie } from 'cookies-next';
import Head from "next/head";

const BADGE_COLOR_SCHEME = {
  'CREATED': 'blue',
  'ONGOING': 'green',
  'FINISHED': 'red',
}

const ElectionPage = ({ election, slug }) => {
  const [currentElection, setCurrentElection] = useState(election);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [candidateSelected, setCandidateSelected] = useState({});
  const [countdown, setCountdown] = useState('');
  const { data: session } = useSession();
  const [loadingVote, setLoadingVote] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const finishedElection = async () => {
      const updateResponse = await fetch(`/api/elections/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: JSON.stringify({
          status: 'FINISHED',
        }),
      }).then((res) => res.json());
      
      if (updateResponse.code >= 400) {
        console.error(updateResponse.message);
        return;
      }

      setCurrentElection(updateResponse.data);
    }

    const endDateElection = dayjs(election.endDate);

    const intervalId = setInterval(() => {
      const dateNow = dayjs();

      if (dateNow >= endDateElection) {
        finishedElection();
      }

      if (!dateNow.isBefore(endDateElection)) return;

      const distance = endDateElection.diff(dateNow);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

    }, 1000);

    return () => clearInterval(intervalId);
  }, [election.endDate, slug]);

  useEffect(() => {
    const getElection = async () => {
      const electionResponse = await fetch(`/api/elections/${slug}`, {
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
        },
      }).then((res) => res.json());

      if (electionResponse.code >= 400) {
        console.error(electionResponse.message);
        return;
      }

      setCurrentElection(electionResponse.data);
    }

    const intervalId = setInterval(getElection, 30000);

    return () => clearInterval(intervalId);
  }, [slug]);

  const calculateParticipantsVoted = (participants) => {
    let participantsVoted = 0;
    participants.forEach((participant) => {
      if (participant.vote) {
        participantsVoted++;
      }
    });
    return participantsVoted;
  };

  const handleOpenModal = (candidate) => {
    setCandidateSelected(candidate);
    onOpen();
  };

  const handleLogin = (email) => {
    if (session) return;

    setCookie(process.env.NEXT_PUBLIC_EMAIL_KEY, email);

    signIn('google', { email }, { login_hint: email, prompt: 'login' });
  }

  const handleLogout = () => {
    deleteCookie(process.env.NEXT_PUBLIC_EMAIL_KEY)
    signOut();
  }

  const getUser = () => {
    const email = session?.user?.email;
    const user = election.participants.find((participant) => participant.email === email);

    return user;
  }

  const handleVote = async (candidate) => {
    const answer = confirm(`Are you sure you want to vote ${candidate.name}?`);

    if (!answer) onClose();

    setLoadingVote(true);

    const voteResponse = await fetch(`/api/elections/${slug}/vote`, {
      method: "POST",
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidateId: candidate._id,
      }),
    }).then((res) => res.json());

    if (voteResponse.code >= 400) {
      alert(voteResponse.message);
      setLoadingVote(false);
      return;
    }

    setLoadingVote(false);

    setCurrentElection(voteResponse.data);
    alert('Vote successfully!');

    onClose();
  }

  return (
    <>
      <Head>
        <title>{currentElection.name}</title>
      </Head>
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" py="10">
        <Box gridColumn={{ base: "span 12 / span 12", md: "span 7 / span 7"}}>
          {session && (
            <Box mb="32px">
              <Text>Your logged as {session.user.email}</Text>
              <Button onClick={handleLogout} mt="12px">Logout</Button>
            </Box>
          )}

          <AspectRatio position="relative" width="full" ratio={ 2/1 } borderRadius="xl" overflow="hidden">
            <Image
              src={currentElection.bannerUrl}
              alt={`banner ${currentElection.name}`}
              layout="fill"
              objectFit="cover"
            />
          </AspectRatio>

          <Box mt="20px">
            {currentElection.status === 'ONGOING' && (
              <Text color="red" fontWeight="bold">Time Remaining {countdown}</Text>
            )}

            <Heading as="h1" fontSize="3xl">{currentElection.name}</Heading>

            <Box mt="8px" display="flex" gap="8px" alignItems="center" flexWrap="wrap">
              <Badge colorScheme={BADGE_COLOR_SCHEME[currentElection.status]}>{currentElection.status}</Badge>
              <Tag borderRadius="full">Open Date: {dayjs(currentElection.startDate).format('DD MMMM YYYY - HH:mm')}</Tag>
              <Tag borderRadius="full">End Date: {dayjs(currentElection.endDate).format('DD MMMM YYYY - HH:mm')}</Tag>
            </Box>
          </Box>

          <Box mt="24px">
            <Heading fontSize="lg">Candidates</Heading>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="16px" mt="12px">
              {currentElection.candidates.map((candidate) => (
                <Card
                  key={candidate._id}
                  w="full"
                  cursor="pointer"
                  gridColumn={{ base: "span 2 / span 2", md: "span 1 / span 1"}}
                  _hover={{
                    boxShadow: "lg",
                  }}
                  onClick={() => handleOpenModal(candidate)}
                >
                    <CardBody w="full">
                      <AspectRatio position="relative" w="full" borderRadius="xl" overflow="hidden">
                        <Image
                          src={candidate.photo.url}
                          alt={`Candidate ${candidate.name}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </AspectRatio>

                      <Text mt="8px">{candidate.name}</Text>

                      <Tag colorScheme="green" borderRadius="full">Vote: {candidate.totalVote}</Tag>
                    </CardBody>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
        <Box gridColumn={{ base: "span 12 / span 12", md: "span 5 / span 5"}}>
          <Box display="flex" alignItems="center" gap="4px">
            <Heading fontSize="lg">Participants</Heading>
            <Badge>Total {currentElection.participants.length}</Badge>
            <Badge colorScheme="green">Voted {calculateParticipantsVoted(currentElection.participants)}</Badge>
            <Badge colorScheme="red">Unvoted {currentElection.participants.length - calculateParticipantsVoted(currentElection.participants)}</Badge>
          </Box>

          <InputGroup my="8px">
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
            {currentElection.participants.filter((participant) => RegExp(`${searchValue}`, 'gi').test(participant.name)).map((participant) => (
              <Card key={participant.name} onClick={() => handleLogin(participant.email)} cursor={session ? 'default' : 'pointer'}>
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
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />

          <ModalContent pb={currentElection.status === "ONGOING" && session && !getUser()?.vote ? 0 : 8}>
            <ModalHeader pr="40px">{candidateSelected.name}</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Box>
                <Heading as="h3" fontSize="md">Vision</Heading>
                <Text mt="4px">{candidateSelected.vision}</Text>
              </Box>

              <Box mt="12px">
                <Heading as="h3" fontSize="md" mb="4px">Mission</Heading>
                <OrderedList>
                  {candidateSelected.mission?.map((mission, index) => (
                    <ListItem key={index}>{mission}</ListItem>
                  ))}
                </OrderedList>
              </Box>

              <Box mt="12px">
                <Heading as="h3" fontSize="md" mb="4px">Future Plan</Heading>
                <UnorderedList>
                  {candidateSelected.program?.map((program, index) => (
                    <ListItem key={index}>{program}</ListItem>
                  ))}
                </UnorderedList>
              </Box>
            </ModalBody>

            {currentElection.status === "ONGOING" && session && !getUser()?.vote && (
              <ModalFooter>
                <Button colorScheme="green" onClick={() => handleVote(candidateSelected)} isLoading={loadingVote}>Vote</Button>
              </ModalFooter>
            )}
          </ModalContent>

        </Modal>
      </Box>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const { slugElection } = context.query;
  
  const electionResponse = await fetch(`${process.env.BASE_URL_API}/elections/${slugElection}`, {
    headers: {
      'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
    },
  }).then((response) => response.json());

  if (electionResponse.code === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      election: electionResponse.data,
      slug: slugElection,
    }
  }
}

export default ElectionPage;
