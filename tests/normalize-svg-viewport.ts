export function normalizeSvgViewport(svg: string): string {
  const openingTag = svg.match(/<svg\b[^>]*>/u)?.[0]
  if (!openingTag) return svg
  const explicitWidth = Number(getSvgAttribute(openingTag, "width"))
  const explicitHeight = Number(getSvgAttribute(openingTag, "height"))
  const viewBox = getSvgAttribute(openingTag, "viewBox")
  const dimensions = viewBox
    ? viewBox
        .trim()
        .split(/[\s,]+/u)
        .map(Number)
    : [0, 0, explicitWidth, explicitHeight]
  if (dimensions.length !== 4 || !dimensions.every(Number.isFinite)) return svg
  const [minimumX, minimumY, viewportWidth, viewportHeight] = dimensions
  if (
    minimumX === undefined ||
    minimumY === undefined ||
    viewportWidth === undefined ||
    viewportHeight === undefined ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return svg
  }
  const openingTagWithoutSize = openingTag.replace(
    /\s+(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gu,
    "",
  )
  const normalizedOpeningTag = viewBox
    ? openingTagWithoutSize
    : setSvgAttributes(openingTagWithoutSize, {
        viewBox: dimensions.join(" "),
      })
  let normalizedSvg = svg.replace(openingTag, normalizedOpeningTag)
  const firstElement = normalizedSvg
    .slice(normalizedOpeningTag.length)
    .match(/^\s*(?:<title\b[^>]*>[\s\S]*?<\/title>\s*)?(<rect\b[^>]*>)/u)?.[1]
  if (
    firstElement &&
    getSvgAttribute(firstElement, "width") === "100%" &&
    getSvgAttribute(firstElement, "height") === "100%"
  ) {
    normalizedSvg = normalizedSvg.replace(
      firstElement,
      setSvgAttributes(firstElement, {
        width: viewportWidth,
        height: viewportHeight,
        x: minimumX,
        y: minimumY,
      }),
    )
  }
  return normalizedSvg
}

export function addSvgHeading(svg: string, heading: string): string {
  const openingTag = svg.match(/<svg\b[^>]*>/u)?.[0]
  if (!openingTag) return svg
  const viewBox = getSvgAttribute(openingTag, "viewBox")
  if (!viewBox) return svg
  const dimensions = viewBox
    .trim()
    .split(/[\s,]+/u)
    .map(Number)
  if (dimensions.length !== 4 || !dimensions.every(Number.isFinite)) return svg
  const [minimumX, minimumY, viewportWidth, viewportHeight] = dimensions
  if (
    minimumX === undefined ||
    minimumY === undefined ||
    viewportWidth === undefined ||
    viewportHeight === undefined
  ) {
    return svg
  }
  const closingTagIndex = svg.lastIndexOf("</svg>")
  if (closingTagIndex < 0) return svg
  const headingHeight = 48
  const content = svg.slice(openingTag.length, closingTagIndex)
  const escapedHeading = heading
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportWidth}" height="${viewportHeight + headingHeight}" viewBox="0 0 ${viewportWidth} ${viewportHeight + headingHeight}">
  <rect x="0" y="0" width="${viewportWidth}" height="${headingHeight}" fill="#111827" />
  <text x="${viewportWidth / 2}" y="31" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">${escapedHeading}</text>
  <g transform="translate(${-minimumX} ${headingHeight - minimumY})">${content}</g>
</svg>`
}

function getSvgAttribute(tag: string, name: string): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
  const match = tag.match(
    new RegExp(`\\b${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "u"),
  )
  return match?.[1] ?? match?.[2]
}

function setSvgAttributes(
  tag: string,
  attributes: Record<string, string | number>,
): string {
  let updatedTag = tag
  for (const [name, fieldEntry] of Object.entries(attributes)) {
    const attributePattern = new RegExp(
      `\\b${name}\\s*=\\s*(?:"[^"]*"|'[^']*')`,
      "u",
    )
    updatedTag = attributePattern.test(updatedTag)
      ? updatedTag.replace(attributePattern, `${name}="${fieldEntry}"`)
      : updatedTag.replace(/\s*\/?>$/u, ` ${name}="${fieldEntry}"$&`)
  }
  return updatedTag
}
