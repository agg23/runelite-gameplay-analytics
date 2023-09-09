import { useMemo } from "react";
import { useStore } from "./store";

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
  const accounts = useStore((state) => state.accounts.api);

  return useMemo(() => {
    const output = {
      id: activeId,
      setActiveAccount,
    };

    if (accounts.type === "data") {
      const matchedAccount = accounts.data.find(
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
  }, [activeId, accounts, setActiveAccount]);
};
