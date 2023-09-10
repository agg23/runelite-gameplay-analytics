import React from "react";
import {
  UnstyledButton,
  Text,
  Image,
  Checkbox,
  createStyles,
  rem,
} from "@mantine/core";

interface FancyCheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> {
  imageWidth?: number;

  checked: boolean;
  onChange?: (checked: boolean) => void;
  title: string;
  description: string;
  image: string;

  pixelated?: boolean;
}

const noop = () => {};

export const FancyCheckbox: React.FC<FancyCheckboxProps> = ({
  className,
  imageWidth,

  checked,
  onChange,
  title,
  description,
  image,

  pixelated,
}) => {
  const { classes, cx } = useStyles({ checked });

  return (
    <UnstyledButton
      className={cx(classes.button, className)}
      onClick={() => onChange?.(!checked)}
    >
      <Image
        className={cx({
          [classes.pixelatedImage]: pixelated,
        })}
        src={image}
        alt={title}
        width={imageWidth}
      />
      <div className={classes.body}>
        {!!description && (
          <Text color="dimmed" size="xs" sx={{ lineHeight: 1 }} mb={5}>
            {description}
          </Text>
        )}
        <Text weight={500} size="sm" sx={{ lineHeight: 1 }}>
          {title}
        </Text>
      </div>

      <Checkbox
        checked={checked}
        tabIndex={-1}
        transitionDuration={100}
        styles={{ input: { cursor: "pointer" } }}
        // Supress React readonly checkbox message
        onChange={noop}
      />
    </UnstyledButton>
  );
};

const useStyles = createStyles((theme, { checked }: { checked: boolean }) => ({
  button: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    transition: "background-color 50ms ease, border-color 50ms ease",
    border: `${rem(1)} solid ${
      checked
        ? theme.fn.variant({ variant: "outline", color: theme.primaryColor })
            .border
        : theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.gray[3]
    }`,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    backgroundColor: checked
      ? theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .background
      : theme.colorScheme === "dark"
      ? theme.colors.dark[8]
      : theme.white,
  },
  pixelatedImage: {
    imageRendering: "pixelated",
  },

  body: {
    flex: 1,
    marginLeft: theme.spacing.xs,
  },
}));
