import { useNPCQuery } from "../../../api/hooks/useDatatypeQuery";

interface NPCProps {
  id: number;
}

export const NPC: React.FC<NPCProps> = ({ id }) => {
  const query = useNPCQuery(id);

  return query.isSuccess ? (
    <div>
      {query.data.name}
      {query.data.examine}
    </div>
  ) : (
    <></>
  );
};
