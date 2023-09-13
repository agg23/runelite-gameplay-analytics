import { Image, ImageProps, createStyles } from "@mantine/core";

export const PixelatedImage: React.FC<ImageProps> = (props) => {
  const { classes } = useStyles();
  return <Image className={classes.pixelatedImage} {...props} />;
};

const useStyles = createStyles((theme) => ({
  pixelatedImage: {
    imageRendering: "pixelated",
  },
}));
