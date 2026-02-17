export const extractTagValue = (xml, tagName) => {
  const regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
};

export const extractReasonValue = (xml, parentTag, childTag) => {
  const regex = new RegExp(
    `<${parentTag}[\\s\\S]*?<${childTag}>(.*?)<\\/${childTag}>`
  );
  const match = xml.match(regex);
  return match ? match[1] : null;
};
