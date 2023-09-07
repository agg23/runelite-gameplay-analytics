import React, { useMemo } from "react";
import { Select } from "@mantine/core";

import { useStore } from "../../store/store";

export const AccountSelect: React.FC<{}> = () => {
  const accountData = useStore((state) => state.api.accounts);
  const { id, setActiveAccount } = useStore((state) => state.activeAccount);

  const [allAccountValues, onChange] = useMemo(() => {
    const onChange = (newId: string | null) => {
      if (!newId || accountData.type !== "data") {
        return;
      }

      const account = accountData.data.find((account) => account.id === newId);

      if (!account) {
        console.error(`Could not find selected account ${newId}`);
        return;
      }

      setActiveAccount(newId);
    };

    if (accountData.type !== "data") {
      return [[], onChange];
    }

    return [
      accountData.data.map((account) => ({
        value: account.id,
        label: account.username,
      })),
      onChange,
    ];
  }, [accountData, setActiveAccount]);

  return (
    <Select value={id ?? null} data={allAccountValues} onChange={onChange} />
  );
};
