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
  const { id, setActiveAccount } = useStore((state) => state.activeAccount);
  const accounts = useStore((state) => state.api.accounts);

  return useMemo(() => {
    const output = {
      id,
      setActiveAccount,
    };

    if (accounts.type === "data") {
      const matchedAccount = accounts.data.find((account) => account.id === id);

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
  }, [id, accounts, setActiveAccount]);
};
