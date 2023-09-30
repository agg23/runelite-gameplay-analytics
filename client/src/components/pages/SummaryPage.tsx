import { CurrentLevelSkills } from "components/osrs/skills/CurrentLevelSkills";
import { ErrorBoundary } from "react-error-boundary";

export const SummaryPage: React.FC<{}> = () => {
  return (
    <ErrorBoundary fallback={<div>An error occured</div>}>
      <CurrentLevelSkills />
    </ErrorBoundary>
  );
};
