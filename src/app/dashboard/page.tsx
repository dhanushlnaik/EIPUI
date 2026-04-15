"use client";
/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useTheme: Use Import from system or use useChakraContext

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/

import FlexBetween from "@/components/FlexBetween";
import { useColorModeValue } from "../../components/ui/color-mode";
import StatBox from "@/components/StatBox";
import CloseableAdCard from "@/components/CloseableAdCard";
import PlaceYourAdCard from "@/components/PlaceYourAdCard";
import { Steps, Box, Button, Heading, Icon, Text, useMediaQuery, Link as LI } from "@chakra-ui/react";
import React from "react";
import { mockEIP } from "@/data/eipdata";
import { useRouter } from "next/navigation";
import AllLayout from "@/components/Layout";
import Dashboard from "@/components/Dashboard"

const Dasboard = () => {
    const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
    const data = mockEIP;
    const bg = useColorModeValue("#f6f6f7", "#171923");
    const text = useColorModeValue("white", "black");
    const router = useRouter()
    return (
        <AllLayout>
            {/* EtherWorld Advertisement */}
            <Box my={6} width="100%">
                {/* <CloseableAdCard /> */}
            </Box>
            <Dashboard/>
            {/* Advertise With Us (moved lower for spacing) */}
            <Box my={12} width="100%">
                {/*<PlaceYourAdCard /> */}
            </Box>

        </AllLayout>
    );
};

export default Dasboard;
