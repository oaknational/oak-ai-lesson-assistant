import React from "react";

import PropTypes from "prop-types";

const NextImageMock = ({ src, alt, ...props }) => {
  return <img src={src || ""} alt={alt} {...props} />;
};

NextImageMock.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default NextImageMock;
