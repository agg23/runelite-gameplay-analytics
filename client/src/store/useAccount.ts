import { useMemo } from "react";
import { useStore } from "./store";
import { useAccountQuery } from "../api/hooks/useDatatypeQuery";

interface UseAccount {
  id: string | undefined;
  account:
    | {
        id: string;
        username: string;
      }
    | undefined;
  setActiveAccount: (id: string) => void;
}

export const useAccount = (): UseAccount => {
  const { activeId, setActiveAccount } = useStore((state) => state.accounts);

  const query = useAccountQuery();

  return useMemo(() => {
    const output = {
      id: activeId,
      setActiveAccount,
    };

    if (query.isSuccess) {
      const matchedAccount = query.data.find(
        (account) => account.id === activeId
      );

      return {
        ...output,
        account: matchedAccount,
      };
    } else {
      return {
        ...output,
        account: undefined,
      };
    }
  }, [activeId, query, setActiveAccount]);
};
