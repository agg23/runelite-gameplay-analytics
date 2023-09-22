import React from "react";
import { UnstyledButton, Text, Checkbox } from "@mantine/core";
import clsx from "clsx";
import { PixelatedImage } from "../PixelatedImage";

import classes from "./FancyCheckbox.module.scss";

export interface FancyCheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> {
  imageWidth?: number;

  checked: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
  description: string;
  image: string;
}

const noop = () => {};

export const FancyCheckbox: React.FC<FancyCheckboxProps> = ({
  className,
  imageWidth,

  checked,
  disabled,
  onChange,
  title,
  description,
  image,
}) => {
  return (
    <UnstyledButton
      className={clsx(classes.button, className)}
      onClick={() => onChange?.(!checked)}
      disabled={disabled}
      // Make data property disappear when not checked
      data-checked={checked || undefined}
    >
      <PixelatedImage src={image} w={imageWidth} />
      <div className={classes.body}>
        {!!description && (
          <Text className={classes.text} color="dimmed" size="xs" mb={5}>
            {description}
          </Text>
        )}
        <Text className={classes.text} size="sm" style={{ fontWeight: 500 }}>
          {title}
        </Text>
      </div>

      <Checkbox
        checked={checked}
        disabled={disabled}
        tabIndex={-1}
        // transitionDuration={100}
        styles={{ input: { cursor: "pointer" } }}
        // Supress React readonly checkbox message
        onChange={noop}
      />
    </UnstyledButton>
  );
};

// const useStyles = createStyles((theme, { checked }: { checked: boolean }) => ({
//   button: {
//     display: "flex",
//     alignItems: "center",
//     width: "100%",
//     transition: "background-color 50ms ease, border-color 50ms ease",
//     border: `${rem(1)} solid ${
//       checked
//         ? theme.fn.variant({
//             variant: "outline",
//             color: theme.primaryColor,
//           }).border
//         : theme.colorScheme === "dark"
//         ? theme.colors.dark[8]
//         : theme.colors.gray[3]
//     }`,
//     borderRadius: theme.radius.sm,
//     padding: theme.spacing.sm,
//     backgroundColor: checked
//       ? theme.fn.variant({ variant: "light", color: theme.primaryColor })
//           .background
//       : theme.colorScheme === "dark"
//       ? theme.colors.dark[8]
//       : theme.white,

//     "&:disabled": {
//       backgroundColor:
//         theme.colorScheme === "dark"
//           ? theme.colors.dark[8]
//           : theme.colors.gray[2],
//       borderColor:
//         theme.colorScheme === "dark"
//           ? theme.colors.dark[9]
//           : theme.colors.gray[3],
//       cursor: "not-allowed",
//       pointerEvents: "none",

//       [`& + .${getStylesRef("icon")}`]: {
//         color:
//           theme.colorScheme === "dark"
//             ? theme.colors.dark[6]
//             : theme.colors.gray[5],
//       },
//       "& .mantine-Text-root": {
//         color:
//           theme.colorScheme === "dark"
//             ? theme.colors.dark[4]
//             : theme.colors.gray[5],
//       },
//       "& .mantine-Image-root img": {
//         filter: "brightness(50%)",
//       },
//     },
//   },

//   body: {
//     flex: 1,
//     marginLeft: theme.spacing.xs,
//   },
// }));
