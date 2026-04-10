import { TableContainer, Thead, Tbody, Tr, Th, Td } from "@/components/ui/compat";
import React, { useEffect, useState } from 'react';
import { useColorModeValue } from "./ui/color-mode";
import { Steps, Table, Tfoot, TableCaption, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

type InsightStatCounts = {
  open: number;
  created: number;
  closed: number;
  merged: number;
};

type InsightStatsPayload = {
  key: string;
  prs: Record<string, Record<string, InsightStatCounts>>;
  issues: Record<string, Record<string, InsightStatCounts>>;
};

export default function InsightStats() {
  const bg = useColorModeValue("#f6f6f7", "#171923");
  let year = "";
  let month = "";
  const path = usePathname();
  if (path) {
    const pathParts = path.split("/");
    year = pathParts[2];
    month = pathParts[3];
  }

  const formattedMonth = month ? month.padStart(2, "0") : "";
  const key = year && formattedMonth ? `${year}-${formattedMonth}` : "";

  const [prData, setPrData] = useState({
    EIPs: { open: 0, created: 0, closed: 0, merged: 0 },
    ERCs: { open: 0, created: 0, closed: 0, merged: 0 },
    RIPs: { open: 0, created: 0, closed: 0, merged: 0 },
  });
  const [issueData, setIssueData] = useState({
    EIPs: { open: 0, created: 0, closed: 0 },
    ERCs: { open: 0, created: 0, closed: 0 },
    RIPs: { open: 0, created: 0, closed: 0 },
  });

  useEffect(() => {
    if (!key) {
      return;
    }
    fetchInsightStats();
  }, [key]);

  const fetchInsightStats = async () => {
    try {
      const response = await fetch(`/api/insight-stats?year=${year}&month=${formattedMonth}`);
      const payload = (await response.json()) as InsightStatsPayload;
      const currentKey = payload.key ?? key;
      const prStats = {
        EIPs: payload.prs?.EIPs?.[currentKey],
        ERCs: payload.prs?.ERCs?.[currentKey],
        RIPs: payload.prs?.RIPs?.[currentKey],
      };
      const issueStats = {
        EIPs: payload.issues?.EIPs?.[currentKey],
        ERCs: payload.issues?.ERCs?.[currentKey],
        RIPs: payload.issues?.RIPs?.[currentKey],
      };

      setPrData({
        EIPs: {
          open: prStats.EIPs?.open ?? 0,
          created: prStats.EIPs?.created ?? 0,
          closed: prStats.EIPs?.closed ?? 0,
          merged: prStats.EIPs?.merged ?? 0,
        },
        ERCs: {
          open: prStats.ERCs?.open ?? 0,
          created: prStats.ERCs?.created ?? 0,
          closed: prStats.ERCs?.closed ?? 0,
          merged: prStats.ERCs?.merged ?? 0,
        },
        RIPs: {
          open: prStats.RIPs?.open ?? 0,
          created: prStats.RIPs?.created ?? 0,
          closed: prStats.RIPs?.closed ?? 0,
          merged: prStats.RIPs?.merged ?? 0,
        },
      });

      setIssueData({
        EIPs: {
          open: issueStats.EIPs?.open ?? 0,
          created: issueStats.EIPs?.created ?? 0,
          closed: issueStats.EIPs?.closed ?? 0,
        },
        ERCs: {
          open: issueStats.ERCs?.open ?? 0,
          created: issueStats.ERCs?.created ?? 0,
          closed: issueStats.ERCs?.closed ?? 0,
        },
        RIPs: {
          open: issueStats.RIPs?.open ?? 0,
          created: issueStats.RIPs?.created ?? 0,
          closed: issueStats.RIPs?.closed ?? 0,
        },
      });
    } catch (error) {
      console.error('Error fetching insight stats:', error);
    }
  };

  return (
    <>
      <Table.ScrollArea bg={bg} padding={4} rounded={"xl"} marginTop={8}>
    <Table.Root variant="simple" size="md" bg={bg} padding={8}>
      <Table.Caption>eipsinsight.com</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>EIPs</Table.ColumnHeader>
          <Table.ColumnHeader>ERCs</Table.ColumnHeader>
          <Table.ColumnHeader>RIPs</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Created PRs</Table.Cell>
          <Table.Cell>{prData.EIPs.created}</Table.Cell>
          <Table.Cell>{prData.ERCs.created}</Table.Cell>
          <Table.Cell>{prData.RIPs.created}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Open PRs</Table.Cell>
          <Table.Cell>{prData.EIPs.open}</Table.Cell>
          <Table.Cell>{prData.ERCs.open}</Table.Cell>
          <Table.Cell>{prData.RIPs.open}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Closed PRs</Table.Cell>
          <Table.Cell>{prData.EIPs.closed}</Table.Cell>
          <Table.Cell>{prData.ERCs.closed}</Table.Cell>
          <Table.Cell>{prData.RIPs.closed}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Merged PRs</Table.Cell>
          <Table.Cell>{prData.EIPs.merged}</Table.Cell>
          <Table.Cell>{prData.ERCs.merged}</Table.Cell>
          <Table.Cell>{prData.RIPs.merged}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Created Issues</Table.Cell>
          <Table.Cell>{issueData.EIPs.created}</Table.Cell>
          <Table.Cell>{issueData.ERCs.created}</Table.Cell>
          <Table.Cell>{issueData.RIPs.created}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Open Issues</Table.Cell>
          <Table.Cell>{issueData.EIPs.open}</Table.Cell>
          <Table.Cell>{issueData.ERCs.open}</Table.Cell>
          <Table.Cell>{issueData.RIPs.open}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Closed Issues</Table.Cell>
          <Table.Cell>{issueData.EIPs.closed}</Table.Cell>
          <Table.Cell>{issueData.ERCs.closed}</Table.Cell>
          <Table.Cell>{issueData.RIPs.closed}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  </Table.ScrollArea>
    </>
  );
}
