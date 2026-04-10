"use client";


import React, { useEffect } from "react";
import AllLayout from "@/components/Layout";
import Dashboard from "@/components/Dashboard"
import ViewsShare from "@/components/ViewsNShare";
import PlaceYourAdCard from "@/components/PlaceYourAdCard";
import { Box } from "@chakra-ui/react";


const Dasboard = () => {
 
  useEffect(() => {
    // Send a POST request to increment the counter when the page loads
    fetch('/api/count/views', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        console.log('View count incremented:', data.count);
        // Any additional logic after the successful request can be placed here.
      })
      .catch((error) => console.error('Error incrementing view count:', error));
  }, []);
  
  return (
    <AllLayout>
      {/* Removed top sponsor ad per request */}
      <Dashboard />
      {/* Advertise With Us (moved lower for spacing) */}
      <Box my={12} width="100%">
        {/*<PlaceYourAdCard /> */}
      </Box>
      <ViewsShare path={'/home'} />
    </AllLayout>
  );
};

export default Dasboard;
