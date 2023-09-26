import { intervalToDuration } from "date-fns";

export const capitalizeFirstLetter = (input: string): string =>
  input.charAt(0).toUpperCase() + input.slice(1);

const numberFormatter = new Intl.NumberFormat();

export const formatNumber = (number: number, round?: boolean): string =>
  numberFormatter.format(round ? Math.round(number) : number);

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "short",
  hour12: true,
});

export const formatDateToParts = (date: Date) => {
  const parts = dateFormatter.formatToParts(date);

  let inHour = false;
  let dateString = "";
  let hourString = "";
  for (const part of parts) {
    if (part.type === "literal" && part.value === ", ") {
      inHour = true;
    } else if (inHour) {
      hourString += part.value;
    } else {
      dateString += part.value;
    }
  }

  return {
    hourString,
    dateString,
  };
};

export const formatDatetimeNice = (date: Date): string => {
  const { hourString, dateString } = formatDateToParts(date);

  return `${hourString} on ${dateString}`;
};

const zeroPadTimeSegment = (num: number) => String(num).padStart(2, "0");

// Based on https://stackoverflow.com/a/65711327
export const formatDurationSpecificMilliseconds = (
  start: number,
  end: number
) => {
  // Millisecond entries
  const duration = intervalToDuration({ start, end });

  let formattedTime =
    duration.seconds !== undefined
      ? zeroPadTimeSegment(duration.seconds)
      : "00";

  let largestUnit = "s";

  const hasMinutes = duration.minutes !== undefined && duration.minutes !== 0;

  if (hasMinutes) {
    // Add minutes
    formattedTime = `${zeroPadTimeSegment(duration.minutes!)}:${formattedTime}`;
    largestUnit = "min";
  }

  const hasHours = duration.hours !== undefined && duration.hours !== 0;

  if (hasHours) {
    // Add hours
    if (!hasMinutes) {
      // We did not add minutes, but we need them, so add empty minutes
      formattedTime += "00:";
    }

    formattedTime = `${zeroPadTimeSegment(duration.hours!)}:${formattedTime}`;
    largestUnit = "hrs";
  }

  return `${formattedTime} ${largestUnit}`;
};
