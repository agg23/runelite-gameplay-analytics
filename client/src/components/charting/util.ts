export const yAxisMinSelector = ({
  min,
  max,
}: {
  min: number;
  max: number;
}) => {
  // Instead of always having 0 in focus, focus around the current level
  const difference = max - min;
  const percentageDistance = difference * 0.1;
  const actualDistance = percentageDistance < 10 ? 10 : percentageDistance;

  const bottom = Math.round(min - actualDistance);
  return bottom > 0 ? bottom : 0;
};
