import Footer from "./Footer";
import HeaderManager from "./HeaderManager";
import Main from "./Main";

type LayoutProps = {
  children: React.ReactNode;
  featureFlag: boolean;
};
const Layout = ({ children, featureFlag }: Readonly<LayoutProps>) => {
  return (
    <>
      <HeaderManager featureFlag={featureFlag} />
      <Main>{children}</Main>
      <Footer featureFlag={featureFlag} />
    </>
  );
};

export default Layout;
