import { OakBox } from "@oaknational/oak-components";
import styled from "styled-components";

export const OakBoxCustomMaxWidth = styled(OakBox)<{ customMaxWidth: number }>`
  max-width: ${(props) => props.customMaxWidth}px;
`;
