/** @jsxImportSource @emotion/react */
import React from "react";
import { Nav } from "./Nav";
import { css } from "@emotion/react";

export const Page: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div css={pageCss}>
      <Nav />
      <div css={contentCss}>{children}</div>
    </div>
  );
};

const pageCss = css({
  display: "flex",
});

const contentCss = css({
  flexGrow: 1,
});
