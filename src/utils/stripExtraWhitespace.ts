export const stripExtraWhitespace = (str: string) => {
  return str.replace(/\s+/g, " ").trim();
};
