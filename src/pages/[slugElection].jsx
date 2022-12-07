import { useEffect, useState } from "react";
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Tag,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import Image from "next/image";
import dayjs from "dayjs";
import { signOut, useSession } from "next-auth/react";
import { deleteCookie } from 'cookies-next';
import Head from "next/head";
import ModalDetailCandidate from "@/components/ModalDetailCandidate";
import Participants from "@/components/Participants";

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

  useEffect(() => {
    const finishedElection = async () => {
      const updateResponse = await fetch(`/api/elections/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
          ADMIN_KEY: process.env.NEXT_PUBLIC_ADMIN_KEY,
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

      if (dateNow >= endDateElection && currentElection.status !== 'FINISHED') {
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
  }, [currentElection.status, election.endDate, slug]);

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

  const handleOpenModal = (candidate) => {
    setCandidateSelected(candidate);
    onOpen();
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
          <Participants participants={currentElection.participants}/>
        </Box>

        <ModalDetailCandidate
          isOpen={isOpen}
          onClose={onClose}
          electionStatus={currentElection.status}
          isUserVote={getUser()?.vote}
          candidate={candidateSelected}
          setCurrentElection={setCurrentElection}
          slug={slug}
        />
      </Box>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const { slugElection } = context.query;
  
  let electionResponse = await fetch(`${process.env.BASE_URL_API}/elections/${slugElection}`, {
    headers: {
      'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
    },
  }).then((response) => response.json());

  if (electionResponse.code === 404) {
    return {
      notFound: true,
    };
  }

  const dateNow = new Date();

  if (electionResponse.data.status === 'ONGOING' && dateNow >= new Date(electionResponse.data.endDate)) {
    electionResponse = await fetch(`${process.env.BASE_URL_API}/elections/${slugElection}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
          ADMIN_KEY: process.env.NEXT_PUBLIC_ADMIN_KEY,
        },
        body: JSON.stringify({
          status: 'FINISHED',
        }),
      }).then((res) => res.json());
      
      if (electionResponse.code >= 400) {
        console.error(electionResponse.message);
        
        return {
          notFound: true,
        };
      }
  }

  return {
    props: {
      election: electionResponse.data,
      slug: slugElection,
    }
  }
}

export default ElectionPage;
