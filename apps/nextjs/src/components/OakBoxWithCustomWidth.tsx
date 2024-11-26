import { OakBox } from "@oaknational/oak-components";
import styled from "styled-components";

const OakBoxWithCustomWidth = styled(OakBox)<{ width: number }>`
  width: ${({ width }) => width}px;
`;

export default OakBoxWithCustomWidth;
