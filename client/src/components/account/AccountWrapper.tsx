import React, { useEffect, useState } from "react";
import { useStore } from "../../store/store";

export const AccountWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const accountId = useStore((state) => state.accounts.activeId);
  const { api, requestData } = useStore((state) => state.accounts);

  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    setInitialLoad(false);
    requestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return initialLoad || api.type === "loading" ? (
    <div>Accounts loading</div>
  ) : !accountId ? (
    <div>No accounts found</div>
  ) : (
    <>{children}</>
  );
};
