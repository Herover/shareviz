export interface Root {
  meta: Meta;
  data: Data;
  chart: Chart;
  style: Style;
}

export interface Meta {
  publicRead: boolean;
  access: AccessItem[];
}

export interface AccessItem {
  userId: string;
  read: boolean;
  write: boolean;
}

export interface Data {
  sets: Set[];
}

export interface Set {
  id: string;
  type: string;
  raw: string;
  name: string;
  rows: Row[];
  transpose: TransposedColumn[];
}

export interface TransposedColumn {
  /** Columns to turn into rows */
  from: string[];
  /** New column for keys/old column names */
  toKey: string;
  /** New column for values */
  toValue: string;
  /** Data type for values in toValue */
  valueType: string;
  /** Data type for keys in from */
  keyType: string;
}

export interface Row {
  key: string;
  type: string;
}

export interface Chart {
  title: string;
  subTitle: string;
  width: number;
  height: number;
  chartType: string;
  scales: Scale[];
  elements: Element[];
  sourceTextLeft: string;
  sourceTextLeftLink: string;
  sourceTextRight: string;
  sourceTextRightLink: string;
}

export interface Scale {
  name: string;
  dataKey: string;
  type: string;
  dataRange?: number[];
  colors?: Colors;
}

export interface Colors {
  default: string;
  byKey: ByKey[];
}

export interface ByKey {
  k: string;
  c: string;
  legend: string;
}

export interface Element {
  type: string;
  d: HBar | Line;
}

export enum AxisRepeatMode {
  ALL = "all",
  FIRST = "first",
  LAST = "last",
}

export interface Axis {
  location: AxisLocation;
  labelSpace: number;
  orientation: AxisOrientation;
  major: AxisGrid;
  minor: AxisGrid;
  repeat: AxisRepeatMode;
}

export interface AxisGrid {
  grid: boolean;
  enabled: boolean;
  tickSize: number;
  tickWidth: number;
  color: string;
  labelDivide: number;
  labelThousands: string;
  afterLabel: string;
  auto: {
    from: number;
    each: number;
    labels: boolean;
  };
  ticks: {
    n: number;
    l: string;
  }[];
}

export enum AxisLocation {
  NONE = "none",
  START = "start",
  END = "end",
}

export enum AxisOrientation {
  VERTICAL = "vertical",
  HORIZONTAL = "horizontal",
}

export interface HBar {
  axis: Axis;
  dataSet: string;
  categories: string;
  subCategories: string;
  stackSubCategories: boolean;
  /** Show how much of 100% value represents, eg. is a stacked 100% area chart */
  portionSubCategories: boolean;
  value: string;
  labelWidth: number;
  repeat: string;
  scale: Scale;
  colors: Colors;
  rectLabels: boolean;
  totalLabels: HBarTotalLabelStyle;
}

export enum HBarTotalLabelStyle {
  NONE = "none",
  INSIDE = "inside",
  OUTSIDE = "outside",
}

export enum LabelLocation {
  None = "none",
  Left = "left",
  Right = "right",
  Float = "float",
}

export enum LabelStyleLine {
  None = "none",
  Line = "line",
}

export interface LabelStyle {
  location: LabelLocation;
  text: string;
  color: string;
  /** x value when location is float */
  x: number;
  /** y value when location is float */
  y: number;
  /** Label relative position to calculated when location is float */
  rx: number;
  /** Label relative position to calculated when location is float */
  ry: number;
  line: LabelStyleLine;
}

export enum LineSymbol {
  NONE = "none",
  CIRCLE = "circle",
}

export enum LineMissingStyle {
  NONE = "none",
  LINE = "line",
  DASHED = "dashed",
}

export interface LineStyleKey {
  k: string;
  color: string;
  width: number;
  label: LabelStyle;
  symbols: LineSymbol;
  missingStyle: LineMissingStyle;
}

export interface LineStyle {
  default: LineStyleKey;
  byKey: LineStyleKey[];
}

export interface Line {
  dataSet: string;
  x: X;
  y: Y;
  categories: string;
  stack: boolean;
  fill: boolean;
  style: LineStyle;
  heightRatio: number;
  repeat: string;
  repeatColumns: number;
}

export interface X {
  axis: Axis;
  key: string;
  scale: string;
}

export interface Y {
  axis: Axis;
  key: string;
  scale: string;
}

export interface Style {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  titleSize: number;
  titleBold: boolean;
  subTitleSize: number;
  subTitleBold: boolean;
  sourceMargin: number;
  bgColor: string;
  textColor: string;
}
