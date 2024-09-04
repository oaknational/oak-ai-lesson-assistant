import { OakBox, OakFlex } from "@oaknational/oak-components";
import styled from "styled-components";

export const OakBoxCustomMaxWidth = styled(OakBox)<{ customMaxWidth: number }>`
  max-width: ${(props) => props.customMaxWidth}px;
`;

export const OakFlexCustomMaxWidth = styled(OakFlex)<{
  customMaxWidth: number;
}>`
  max-width: ${(props) => props.customMaxWidth}px;
`;
