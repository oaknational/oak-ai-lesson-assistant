module.exports = {
  process() {
    console.log("Called jest svg transform");
    return { code: "module.exports = {};" };
  },
  getCacheKey() {
    return "svgTransform";
  },
};
