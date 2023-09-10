import { useNPC } from "../hooks/useNPC";

interface NPCProps {
  id: number;
}

export const NPC: React.FC<NPCProps> = ({ id }) => {
  const npc = useNPC(id);

  return npc.type === "data" ? (
    <div>
      {npc.data.name}
      {npc.data.examine}
    </div>
  ) : (
    <></>
  );
};
