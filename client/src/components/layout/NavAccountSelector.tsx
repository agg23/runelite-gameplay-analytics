import { Box, Text } from "@mantine/core";
import { AccountSelect } from "../account/AccountSelect";

import classes from "./NavAccountSelector.module.scss";

export const NavAccountSelector: React.FC<{}> = () => {
  return (
    <Box className={classes.box}>
      <Text className={classes.text}>Account:</Text>
      <AccountSelect />
    </Box>
  );
};
