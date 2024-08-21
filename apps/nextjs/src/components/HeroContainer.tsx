import { OakBox } from "@oaknational/oak-components";
import styled from "styled-components";

const HeroContainerOakBox = styled(OakBox)`
  position: relative;
  margin-top: -72px;
  width: 100%;
  overflow: unset;
  padding-top: 92px;
  padding-bottom: 92px;
  &:before {
    content: "";
    position: absolute;
    left: -50vw;
    bottom: 0;
    z-index: -1;
    height: 100%;
    top: 0;
    width: 150vw;
    background-color: #e3e9fb;
  }
`;

type HeroContainerProps = { children: React.ReactNode };

const HeroContainer = ({ children }: Readonly<HeroContainerProps>) => {
  return <HeroContainerOakBox>{children}</HeroContainerOakBox>;
};

export default HeroContainer;
