import { DemoProvider } from "./ContextProviders/Demo";
import Footer from "./Footer";
import HeaderManager from "./HeaderManager";
import Main from "./Main";
import { StatusBannerSpacer } from "./StatusBanner";

type LayoutProps = {
  children: React.ReactNode;
  feature?: "teachingMaterials" | "aila";
};
const Layout = ({ children, feature }: Readonly<LayoutProps>) => {
  return (
    <DemoProvider>
      <HeaderManager page={feature} />
      <StatusBannerSpacer />
      <Main defaultMaxWidth={true}>{children}</Main>
      <Footer />
    </DemoProvider>
  );
};

export default Layout;
