// SPDX-License-Identifier: MPL-2.0

// Shared annotation layer: rich-text notes and colored zone boxes drawn over a
// chart's plot area. Charts provide an AnnotationGeometry so annotations can be
// positioned in data coordinates or in percent relative to the plot origin
// (bottom left corner), the components here handle rendering and drag editing.

import chroma from "chroma-js";
import type { ResponsiveColor, RichText } from "$lib/chart";
import type { ScaleLinear } from "d3-scale";

export enum AnnotationUnit {
  /** Same values as the data points, eg. year 2020 */
  DATA = "data",
  /** Percent of the plot area, measured from the origin (bottom left) */
  PERCENT = "percent",
}

export enum AnnotationBoxKind {
  /** All four corners are configurable */
  FREE = "free",
  /** Fills the plot height, only the left/right sides are configurable */
  VERTICAL_BAND = "verticalBand",
  /** Fills the plot width, only the top/bottom sides are configurable */
  HORIZONTAL_BAND = "horizontalBand",
}

export interface AnnotationCoordinate {
  v: number;
  unit: AnnotationUnit;
}

export interface AnnotationText {
  type: "text";
  id: string;
  text: RichText;
  // Top left corner of the text block
  x: AnnotationCoordinate;
  y: AnnotationCoordinate;
  // Width of the text block in percent of the plot area
  width: number;
}

export interface AnnotationBox {
  type: "box";
  id: string;
  kind: AnnotationBoxKind;
  x1: AnnotationCoordinate;
  y1: AnnotationCoordinate;
  x2: AnnotationCoordinate;
  y2: AnnotationCoordinate;
  color: ResponsiveColor;
  // Fill opacity, 0-1
  opacity: number;
}

export type Annotation = AnnotationText | AnnotationBox;

export interface AnnotationGeometry {
  /** Plot area in pixels, x0/y0 is the top left */
  plot: { x0: number; x1: number; y0: number; y1: number };
  xToPx: (c: AnnotationCoordinate) => number;
  yToPx: (c: AnnotationCoordinate) => number;
  pxToX: (px: number, unit: AnnotationUnit) => AnnotationCoordinate;
  pxToY: (px: number, unit: AnnotationUnit) => AnnotationCoordinate;
}

// Keeps dragged values readable in the editor without visibly moving anything
const round = (n: number) => Number(n.toPrecision(4));

/**
 * Geometry for charts with two linear scales where the y range runs from
 * bottom (range[0]) to top (range[1]), like the scatter chart.
 */
export const linearAnnotationGeometry = (
  xScale: ScaleLinear<number, number, never>,
  yScale: ScaleLinear<number, number, never>,
): AnnotationGeometry => {
  const [xr0, xr1] = xScale.range();
  const [yr0, yr1] = yScale.range();
  return {
    plot: {
      x0: Math.min(xr0, xr1),
      x1: Math.max(xr0, xr1),
      y0: Math.min(yr0, yr1),
      y1: Math.max(yr0, yr1),
    },
    xToPx: (c) =>
      c.unit == AnnotationUnit.PERCENT ? xr0 + (c.v / 100) * (xr1 - xr0) : xScale(c.v),
    yToPx: (c) =>
      c.unit == AnnotationUnit.PERCENT ? yr0 + (c.v / 100) * (yr1 - yr0) : yScale(c.v),
    pxToX: (px, unit) => ({
      unit,
      v: round(
        unit == AnnotationUnit.PERCENT ? ((px - xr0) / (xr1 - xr0)) * 100 : xScale.invert(px),
      ),
    }),
    pxToY: (px, unit) => ({
      unit,
      v: round(
        unit == AnnotationUnit.PERCENT ? ((px - yr0) / (yr1 - yr0)) * 100 : yScale.invert(px),
      ),
    }),
  };
};

export const defaultTextAnnotation = (): AnnotationText => ({
  type: "text",
  id: crypto.randomUUID(),
  text: {
    ops: [{ insert: "Note..." }, { insert: "\n", attributes: { block: "p" } }],
  },
  x: { v: 5, unit: AnnotationUnit.PERCENT },
  y: { v: 90, unit: AnnotationUnit.PERCENT },
  width: 30,
});

export const defaultBoxAnnotation = (): AnnotationBox => {
  // Random color visible on a white background, users adjust it afterwards
  const c = chroma
    .hsl(Math.random() * 360, 0.5 + Math.random() * 0.3, 0.3 + Math.random() * 0.25)
    .hex();
  return {
    type: "box",
    id: crypto.randomUUID(),
    kind: AnnotationBoxKind.FREE,
    x1: { v: 10, unit: AnnotationUnit.PERCENT },
    y1: { v: 10, unit: AnnotationUnit.PERCENT },
    x2: { v: 40, unit: AnnotationUnit.PERCENT },
    y2: { v: 40, unit: AnnotationUnit.PERCENT },
    color: { light: { c, v: c } },
    opacity: 0.15,
  };
};
