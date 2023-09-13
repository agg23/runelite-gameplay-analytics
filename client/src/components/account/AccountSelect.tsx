import React, { useMemo } from "react";
import { Select } from "@mantine/core";

import { useStore } from "../../store/store";
import { useAccountQuery } from "../../api/hooks/useDatatypeQuery";

export const AccountSelect: React.FC<{}> = () => {
  const { activeId, setActiveAccount } = useStore((state) => state.accounts);

  const query = useAccountQuery();

  const [allAccountValues, onChange] = useMemo(() => {
    const onChange = (newId: string | null) => {
      if (!newId || !query.isSuccess || !query.data) {
        return;
      }

      const account = query.data.find((account) => account.id === newId);

      if (!account) {
        console.error(`Could not find selected account ${newId}`);
        return;
      }

      setActiveAccount(newId);
    };

    if (!query.isSuccess || !query.data) {
      return [[], onChange];
    }

    return [
      query.data.map((account) => ({
        value: account.id,
        label: account.username,
      })),
      onChange,
    ];
  }, [query, setActiveAccount]);

  return (
    <Select
      value={activeId ?? null}
      data={allAccountValues}
      onChange={onChange}
    />
  );
};
