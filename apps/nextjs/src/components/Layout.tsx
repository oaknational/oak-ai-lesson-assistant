import { DemoProvider } from "./ContextProviders/Demo";
import Footer from "./Footer";
import HeaderManager from "./HeaderManager";
import Main from "./Main";

type LayoutProps = {
  children: React.ReactNode;
  page?: "teachingMaterials" | "aila";
};
const Layout = ({ children, page }: Readonly<LayoutProps>) => {
  return (
    <DemoProvider>
      <HeaderManager page={page} />
      <Main defaultMaxWidth={true}>{children}</Main>
      <Footer />
    </DemoProvider>
  );
};

export default Layout;
