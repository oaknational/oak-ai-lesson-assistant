import { OakSpan } from "@oaknational/oak-components";
import styled from "styled-components";

export const ScaleSpan = styled(OakSpan)<{ $scale: number }>`
  transform: scale(${(props) => props.$scale});
`;
