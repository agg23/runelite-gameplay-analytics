import { useAccountQuery } from "../../api/hooks/useDatatypeQuery";

export const AccountWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const query = useAccountQuery();

  return query.isLoading ? (
    <div>Accounts loading</div>
  ) : query.data === undefined || query.data.length < 1 ? (
    <div>No accounts found</div>
  ) : (
    <>{children}</>
  );
};
