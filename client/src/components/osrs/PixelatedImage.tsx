import { Image, ImageProps } from "@mantine/core";

import classes from "./PixelatedImage.module.scss";

export const PixelatedImage: React.FC<ImageProps> = (props) => (
  <Image className={classes.pixelatedImage} {...props} />
);
