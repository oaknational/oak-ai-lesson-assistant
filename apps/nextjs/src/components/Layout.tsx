import Footer from "./Footer";
import HeaderManager from "./HeaderManager";
import Main from "./Main";

type LayoutProps = {
  children: React.ReactNode;
};
const Layout = ({ children }: Readonly<LayoutProps>) => {
  return (
    <>
      <HeaderManager />
      <Main>{children}</Main>
      <Footer />
    </>
  );
};

export default Layout;
