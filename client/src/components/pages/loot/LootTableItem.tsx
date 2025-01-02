import { Table } from "@mantine/core";
import React from "react";

import { LootEvent } from "api/internal/types";
import { useNPCQuery } from "api/hooks/useDatatypeQuery";

interface LootTableItemProps {
  event: LootEvent;
}

export const LootTableItem: React.FC<LootTableItemProps> = ({ event }) => {
  const data = useNPCQuery(event.npcId);

  return !!data.data ? (
    <Table.Tr>
      <Table.Td>{data.data.name}</Table.Td>
    </Table.Tr>
  ) : (
    <></>
  );
};
