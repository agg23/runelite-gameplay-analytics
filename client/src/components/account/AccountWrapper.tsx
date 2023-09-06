import React, { useEffect, useState } from "react";
import { useStore } from "../../store/store";

export const AccountWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const account = useStore((state) => state.activeAccount);
  const accountData = useStore((state) => state.api.accounts);

  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    setInitialLoad(false);
    accountData.requestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return initialLoad || accountData.type === "loading" ? (
    <div>Accounts loading</div>
  ) : !account ? (
    <div>No accounts found</div>
  ) : (
    <>{children}</>
  );
};
