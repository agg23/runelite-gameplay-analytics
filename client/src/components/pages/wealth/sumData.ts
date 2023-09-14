export const sumDataArrays = <T>(
  first: T[],
  second: T[],
  timestampSelector: (item: T) => number,
  valueSelector: (item: T) => number
) => {
  const mergedData: Array<[number, number]> = [];

  let i = 0;
  let j = 0;
  let prevFirst = 0;
  let prevSecond = 0;

  while (i < first.length && j < second.length) {
    const firstItem = first[i];
    const secondItem = second[j];

    const firstTimestamp = timestampSelector(firstItem);
    const secondTimestamp = timestampSelector(secondItem);

    console.log(i, j, firstTimestamp < secondTimestamp);

    if (firstTimestamp === secondTimestamp) {
      // Add normally
      prevFirst = valueSelector(firstItem);
      prevSecond = valueSelector(secondItem);

      mergedData.push([firstTimestamp, prevFirst + prevSecond]);
      i += 1;
      j += 1;
    } else if (firstTimestamp < secondTimestamp) {
      // Use previous second item
      prevFirst = valueSelector(firstItem);
      mergedData.push([firstTimestamp, prevFirst + prevSecond]);
      i += 1;
    } else {
      // Use previous first item
      prevSecond = valueSelector(secondItem);
      mergedData.push([secondTimestamp, prevFirst + prevSecond]);
      j += 1;
    }
  }

  // Only one of these loops will run
  while (i < first.length) {
    const item = first[i];

    mergedData.push([
      timestampSelector(item),
      valueSelector(item) + prevSecond,
    ]);
    i += 1;
  }

  while (j < second.length) {
    const item = second[j];

    mergedData.push([timestampSelector(item), prevFirst + valueSelector(item)]);
    j += 1;
  }

  return mergedData;
};
