import React from "react";

const NextImageMock = ({ src, alt, ...props }) => {
  return <img src={src || ""} alt={alt} {...props} />;
};

export default NextImageMock;
