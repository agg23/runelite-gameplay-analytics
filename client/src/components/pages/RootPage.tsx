import { AccountWrapper } from "../account/AccountWrapper";
import { Page } from "../layout/Page";
import { Outlet } from "@tanstack/react-router";

export const RootPage: React.FC<{}> = () => {
  return (
    <div className="App">
      <AccountWrapper>
        <Page>
          <Outlet />
        </Page>
      </AccountWrapper>
    </div>
  );
};
