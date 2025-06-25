import React from "react";
import reactStringReplace from "react-string-replace";

import { OakCodeRenderer } from "@oaknational/oak-components";
import styled from "styled-components";

const UnderlineSpan = styled.span`
  display: inline-block;
  border-bottom: 2px solid black;
  padding-bottom: 2px;
  min-width: 48px;
  position: relative;
`;

export const shortAnswerTitleFormatter = (
  title: string | null | undefined,
): string | React.ReactNode => {
  const shortAnswerRegex = /\{\{(?:[^{}]|(?!\{\{|\}\})\w)*\}\}/g;
  if (!title) return "";
  if (shortAnswerRegex.test(title)) {
    return reactStringReplace(title, shortAnswerRegex, (match, i) => (
      <React.Fragment key={i}>
        {" "}
        <UnderlineSpan
          // This is an empty box with a line under it, to indicate an answer would go here.
          role="presentation"
          title="An empty space to write an answer in"
          data-testid="underline"
        />{" "}
        <OakCodeRenderer
          string={match}
          $font="code-3"
          $mt={"space-between-ssx"}
        />
      </React.Fragment>
    ));
  } else {
    return (
      <OakCodeRenderer
        string={title}
        $font="code-3"
        $mt={"space-between-ssx"}
      />
    );
  }
};

export const removeMarkdown = (title: string | null | undefined): string => {
  return title ? title.replace(/\*{1,2}(.*?)\*{1,2}/g, "$1") : "";
};