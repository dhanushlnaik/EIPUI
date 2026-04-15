"use client";
;
import { VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import React, { useState, useEffect, useLayoutEffect } from "react";
import AllLayout from "@/components/Layout";
import CloseableAdCard from "@/components/CloseableAdCard";
import { Box, Spinner, Wrap, WrapItem, Text, List, Heading, Grid, Stack, Image, Link } from "@chakra-ui/react";
import NLink from "next/link";
const EIPsInsightRecap = () => {
    const bg = useColorModeValue("#f6f6f7", "#171923");
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        if (bg === "#f6f6f7") {
          setIsDarkMode(false);
        } else {
          setIsDarkMode(true);
        }
      });

  return (
    <>
      <AllLayout>
    <Box 
    paddingBottom={{ lg: "10", sm: "10", base: "10" }}
    marginX={{ lg: "40", md: "2", sm: "2", base: "2" }}
    paddingX={{ lg: "10", md: "5", sm: "5", base: "5" }}
    marginTop={{ lg: "10", md: "5", sm: "5", base: "5" }}
    >
      <VStack gap={6} align="start">
      <Text
        
           transition={{ duration: 0.5 } as any}
           fontSize={{base: "2xl",md:"4xl", lg: "6xl"}}
           fontWeight={{ base: "extrabold", md: "bold", lg: "bold" }}
           color="#30A0E0"
          >
          What is an Ethereum Improvement Proposal (EIP)?
        </Text>

        <Stack 
            direction={{ base: "column", lg: "row" }} // Stack vertically on small screens, horizontally on large screens
            gap={6} 
            align="center" // Align content in the center
            justify="center" // Center content horizontally and vertically
            >
            {/* Image Box */}
            <Box 
                display="flex" 
                justifyContent="center" 
                width={{ base: "100%", lg: "40%" }} // Image takes up 40% of the width on large screens
            >
               <Image 
  src="/EIPsFAQ.png" 
  alt="Image 1" 
  borderRadius="md" 
  width={{ base: "250px", md: "350px", lg: "100%" }}
  height="auto"
  objectFit="contain"
/>

            </Box>

            {/* Text */}
            <Box 
                width={{ base: "100%", lg: "60%" }} // Text takes up 60% of the width on large screens
                textAlign="justify"
            >     
            <Text fontSize={{ base: "sm", sm: "xs", md: "md" }}  mt={4} textAlign="justify">
            <Link href="/eip" color="blue.300" target='_blank' rel='noopener noreferrer'>EIP</Link>{" "} stands for Ethereum Improvement Proposal. An EIP is a design document providing information to the Ethereum community, or describing a new feature for Ethereum or its processes or environment. The EIP should provide a concise technical specification of the feature and a rationale for the feature. The EIP author is responsible for building consensus within the community and documenting dissenting opinions.
              </Text>
              
            </Box>
            </Stack>

            {/* EtherWorld Advertisement */}
            <Box my={6} width="100%">
              {/* <CloseableAdCard /> */}
            </Box>

            <Text fontSize={{ base: "sm", sm: "xs", md: "md" }} mt={4} textAlign="justify">
  There are three types of EIP:
</Text>
<ul >
  <li>
    <b>Standards Track EIP</b>: Describes any change that affects most or all Ethereum implementations, such as a change to the network protocol, block or transaction validity rules, proposed application standards/conventions, or any change that affects interoperability of applications using Ethereum. Standards Track EIPs include:
    <ul className="list-disc list-inside ml-5 space-y-2">
      <li>
        <b><Link href="/core" color="blue.300" target='_blank' rel='noopener noreferrer'>Core</Link></b>: Improvements requiring a consensus fork (e.g., <a href="/eips/eip-5">EIP-5</a>, <a href="/eips/eip-101">EIP-101</a>), as well as changes relevant to <a href="https://github.com/ethereum/pm">â€œcore devâ€ discussions</a>.
      </li>
      <li>
        <b><Link
          href="/networking"
          color="blue.300"
          target='_blank'
          rel='noopener noreferrer'>Networking</Link></b>: Includes improvements to <a href="https://github.com/ethereum/devp2p/blob/readme-spec-links/rlpx.md">devp2p</a> (e.g., <a href="/eips/eip-8">EIP-8</a>), the <a href="https://ethereum.org/en/developers/docs/nodes-and-clients/#light-node">Light Ethereum Subprotocol</a>, and network protocol specifications like <a href="https://github.com/ethereum/go-ethereum/issues/16013#issuecomment-364639309">Whisper</a> and <a href="https://github.com/ethereum/go-ethereum/pull/2959">Swarm</a>.
      </li>
      <li>
        <b><Link
          href="/interface"
          color="blue.300"
          target='_blank'
          rel='noopener noreferrer'>Interface</Link></b>: Includes language-level standards such as method names (e.g., <a href="/eips/eip-6">EIP-6</a>) and <a href="https://docs.soliditylang.org/en/develop/abi-spec.html">contract ABIs</a>.
      </li>
      <li>
        <b><Link href="/erc" color="blue.300" target='_blank' rel='noopener noreferrer'>ERC</Link></b>: Application-level standards and conventions, including token standards (e.g., <a href="/eips/eip-20">ERC-20</a>), name registries (e.g., <a href="/eips/eip-137">ERC-137</a>), URI schemes, and wallet formats.
      </li>
    </ul>
  </li>
  <li>
    <b><Link href="/meta" color="blue.300" target='_blank' rel='noopener noreferrer'>Meta EIP</Link></b>: Describes a process surrounding Ethereum or proposes a change to (or an event in) a process. These EIPs apply to areas other than the Ethereum protocol itself and often require community consensus. Examples include procedures, guidelines, and tools used in Ethereum development.
  </li>
  <li>
    <b><Link
      href="/informational"
      color="blue.300"
      target='_blank'
      rel='noopener noreferrer'>Informational EIP</Link></b>: Provides general guidelines or information to the Ethereum community but does not propose new features. Informational EIPs are non-binding recommendations and do not necessarily represent community consensus.
  </li>
</ul>

<Text fontSize={{ base: "sm", sm: "xs", md: "md" }}  mt={4} textAlign="justify">
  It is highly recommended that an EIP focuses on a single proposal or idea to ensure clarity and success. A clear and complete description of the proposed enhancement must be included, representing a net improvement without undue protocol complexity.
</Text>

<Text fontSize={{ base: "sm", sm: "xs", md: "md" }}  mt={4} textAlign="justify">
  <b>Special Requirements for Core EIPs:</b> If a Core EIP mentions or proposes changes to the EVM, it should use instruction mnemonics and define opcodes, for example:
</Text>
<pre className="bg-gray-900 text-white p-4 rounded-md">
  REVERT (0xfe)
</pre>

<Text fontSize={{ base: "sm", sm: "xs", md: "md" }}  mt={4} textAlign="justify">
  <b>EIP Workflow:</b> Before drafting an EIP, it is crucial to vet the idea with the Ethereum community through platforms like the <a href="https://ethereum-magicians.org/">Ethereum Magicians forum</a>. After obtaining feedback, the EIP author (or champion) must write the EIP, invite feedback from editors, developers, and the community, and gauge interest in the proposal.
</Text>

<ul >
  <li>
    For Core EIPs, presenting them on an <a href="https://github.com/ethereum/pm/issues">AllCoreDevs agenda</a> can help gain client implementer support and coordinate implementation for network upgrades.
  </li>
  <li>
    Building community consensus is vital for the EIP process. Authors should ensure that discussions and feedback from stakeholders are well-documented and accessible.
  </li>
</ul>

<Text fontSize={{ base: "sm", sm: "xs", md: "md" }}  mt={4} textAlign="justify">
  The EIP process aims to foster collaboration and standardization, ensuring technical soundness and alignment within the Ethereum ecosystem.
</Text>
<Box >
      <Heading as="h2" size="lg" mb={4}>
        EIP Process
      </Heading>

     

      <Heading as="h3" size="md" mb={4}>
        Statuses
      </Heading>
      <List.Root as='ul' gap={3} mb={6}>
        <List.Item>
          <strong>Idea:</strong> An idea that is pre-draft. This is not tracked within the EIP Repository.
        </List.Item>
        <List.Item>
          <strong>Draft:</strong> The first formally tracked stage of an EIP in development. An EIP is merged
          by an EIP Editor into the EIP repository when properly formatted.
        </List.Item>
        <List.Item>
          <strong>Review:</strong> An EIP Author marks an EIP as ready for and requesting Peer Review.
        </List.Item>
        <List.Item>
          <strong>Last Call:</strong> This is the final review window for an EIP before moving to{" "}
          <code>Final</code>. An EIP editor will assign <code>Last Call</code> status and set a review end
          date (<code>last-call-deadline</code>), typically 14 days later. If this period results in necessary
          normative changes, it will revert the EIP to <code>Review</code>.
        </List.Item>
        <List.Item>
          <strong>Final:</strong> This EIP represents the final standard. A Final EIP exists in a state of
          finality and should only be updated to correct errata and add non-normative clarifications.
        </List.Item>
        <List.Item>
          <strong>Stagnant:</strong> Any EIP in <code>Draft</code>, <code>Review</code>, or{" "}
          <code>Last Call</code> that is inactive for 6 months or greater is moved to <code>Stagnant</code>.
        </List.Item>
        <List.Item>
          <strong>Withdrawn:</strong> The EIP Author(s) have withdrawn the proposed EIP. This state has
          finality and can no longer be resurrected using this EIP number.
        </List.Item>
        <List.Item>
          <strong>Living:</strong> A special status for EIPs that are designed to be continually updated and
          not reach a state of finality. This includes EIP-1.
        </List.Item>
      </List.Root>

      <Text fontStyle="italic" mb={6}>
        *EIP Authors are notified of any algorithmic change to the status of their EIP*
      </Text>

      <Heading as="h3" size="md" mb={4}>
        What belongs in a successful EIP?
      </Heading>
      <List.Root as='ul' gap={3} mb={6}>
        <List.Item>
          <strong>Preamble:</strong> Metadata about the EIP, including its number, title, and description.
        </List.Item>
        <List.Item>
          <strong>Abstract:</strong> A concise, technical summary of the specification.
        </List.Item>
        <List.Item>
          <strong>Motivation:</strong> *(Optional)* Explains why the existing specification is inadequate.
        </List.Item>
        <List.Item>
          <strong>Specification:</strong> Describes the syntax and semantics of any new feature in detail.
        </List.Item>
        <List.Item>
          <strong>Rationale:</strong> Explains design decisions and discusses alternate approaches.
        </List.Item>
        <List.Item>
          <strong>Backwards Compatibility:</strong> *(Optional)* Describes incompatibilities, if any.
        </List.Item>
        <List.Item>
          <strong>Test Cases:</strong> *(Optional)* Mandatory for EIPs affecting consensus changes.
        </List.Item>
        <List.Item>
          <strong>Reference Implementation:</strong> *(Optional)* Provides example implementations.
        </List.Item>
        <List.Item>
          <strong>Security Considerations:</strong> Discusses risks and security implications.
        </List.Item>
        <List.Item>
          <strong>Copyright Waiver:</strong> All EIPs must be in the public domain.
        </List.Item>
      </List.Root>

      <Text mb={6}>
        EIPs should be written in <Link
        color="blue.300"
        href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
        target='_blank'
        rel='noopener noreferrer'>Markdown</Link> format. Use the{" "}
        <Link
          color="blue.300"
          href="/proposalbuilder"
          target='_blank'
          rel='noopener noreferrer'>
          EIP Template
        </Link>
        .
      </Text>

      <Heading as="h3" size="md" mb={4}>
        Current EIP Editors
      </Heading>
      <List.Root as='ul' gap={3}>
        <List.Item>Matt Garnett (@lightclient)</List.Item>
        <List.Item>Sam Wilson (@SamWilsn)</List.Item>
        <List.Item>Zainan Victor Zhou (@xinbenlv)</List.Item>
        <List.Item>Gajinder Singh (@g11tech)</List.Item>
      </List.Root>
      <br/>

      <Heading as="h3" size="md" mb={4}>
        Emeritus EIP editors
      </Heading>
      <List.Root as='ul' gap={3}>
        <List.Item>Alex Beregszaszi (@axic)</List.Item>
        <List.Item>Casey Detrio (@cdetrio)</List.Item>
        <List.Item>Gavin John (@Pandapip1)</List.Item>
        <List.Item>Greg Colvin (@gcolvin)</List.Item>
        <List.Item>Hudson Jameson (@Souptacular)</List.Item>
        <List.Item>Martin Becze (@wanderer)</List.Item>
        <List.Item>Micah Zoltu (@MicahZoltu)</List.Item>
        <List.Item>Nick Johnson (@arachnid)</List.Item>
        <List.Item>Nick Savers (@nicksavers)</List.Item>
        <List.Item>Vitalik Buterin (@vbuterin)</List.Item>

      </List.Root>
    </Box>

        
      </VStack>
    </Box>
    </AllLayout>
    </>
  );
};

export default EIPsInsightRecap;
