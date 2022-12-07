import {
  Box,
  Button,
  Heading,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Text,
  UnorderedList
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'

const ModalDetailCandidate = ({
  isOpen,
  onClose,
  electionStatus,
  isUserVote,
  candidate,
  setCurrentElection,
  slug
}) => {
  const { data: session } = useSession();
  const [loadingVote, setLoadingVote] = useState(false);

  const handleVote = async (candidateSelected) => {
    const answer = confirm(`Are you sure you want to vote ${candidateSelected.name}?`);

    if (!answer) {
      setLoadingVote(false);
      onClose();
      return;
    };

    setLoadingVote(true);

    const voteResponse = await fetch(`/api/elections/${slug}/vote`, {
      method: "POST",
      headers: {
        'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidateId: candidateSelected._id,
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent pb={electionStatus === "ONGOING" && session && !isUserVote ? 0 : 8}>
        <ModalHeader pr="40px">{candidate.name}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Box>
            <Heading as="h3" fontSize="md">Vision</Heading>
            <Text mt="4px">{candidate.vision}</Text>
          </Box>

          <Box mt="12px">
            <Heading as="h3" fontSize="md" mb="4px">Mission</Heading>
            <OrderedList>
              {candidate.mission?.map((mission, index) => (
                <ListItem key={index}>{mission}</ListItem>
              ))}
            </OrderedList>
          </Box>

          <Box mt="12px">
            <Heading as="h3" fontSize="md" mb="4px">Future Plan</Heading>
            <UnorderedList>
              {candidate.program?.map((program, index) => (
                <ListItem key={index}>{program}</ListItem>
              ))}
            </UnorderedList>
          </Box>
        </ModalBody>

        {electionStatus === "ONGOING" && session && !isUserVote && (
          <ModalFooter>
            <Button colorScheme="green" onClick={() => handleVote(candidate)} isLoading={loadingVote}>Vote</Button>
          </ModalFooter>
        )}
      </ModalContent>

    </Modal>
  )
}

export default ModalDetailCandidate;
