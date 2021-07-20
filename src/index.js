import { Router } from "worktop";
import { listen } from "worktop/cache";
import seedrandom from "seedrandom";

const SVG_SIZE = 32;
const COLORS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
];

const integer = (seededRng, min, max) =>
  Math.floor(seededRng() * (max - min + 1) + min);

const pickone = (seededRng, arr) => arr[integer(seededRng, 0, arr.length - 1)];

const API = new Router();

const generateSvg = (
  name,
  colors,
  backgroundColor,
  foregroundColor,
  offset
) => {
  const rng = seedrandom(name);
  const hexColor = backgroundColor ? `#${backgroundColor}` : backgroundColor;
  const color = hexColor || pickone(rng, colors);
  const textColor = foregroundColor || "fff";

  const escapedName = unescape(name);
  const parts = escapedName.split(" ") || [];
  const firstName = parts.shift() || "";
  const lastName = parts.pop() || "";
  const firstInitial = firstName.length > 0 ? firstName[0] : "";
  const lastInitial = lastName.length > 0 ? lastName[0] : "";
  const initials = `${firstInitial}${lastInitial}`.toUpperCase();

  const letters = `<text font-family="Helvetica" font-size="14px" x="50%" y="50%" dy="${offset}em" fill="#${textColor}" alignment-baseline="central" text-anchor="middle">${initials}</text>`;

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"',
    ` style="isolation:isolate" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">`,
    `<path d="M0 0h${SVG_SIZE}v${SVG_SIZE}H0V0z" fill="${color}" />`,
    letters,
    "</svg>",
  ].join("");
};

API.add("GET", "/:name.svg", (req, res) => {
  const { name } = req.params;
  const { bg, fg } = req.query;
  const svg = generateSvg(name, COLORS, bg, fg, 0);
  res.setHeader("Cache-Control", "public,max-age=60");
  res.setHeader("Content-Type", "image/svg+xml");
  return res.end(svg);
});
API.add("GET", "/", (req, res) => {
  res.end(`Welcome to AVTR!`);
});

listen(API.run);
