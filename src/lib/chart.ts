export interface Root {
  meta: Meta
  data: Data
  chart: Chart
  style: Style
}

export interface Meta {
  publicRead: boolean
}

export interface Data {
  sets: Set[]
}

export interface Set {
  id: string
  type: string
  raw: string
  rows: Row[]
}

export interface Row {
  key: string
  type: string
}

export interface Chart {
  title: string
  subTitle: string
  width: number
  height: number
  chartType: string
  scales: Scale[]
  elements: Element[]
  sourceTextLeft: string
  sourceTextLeftLink: string
  sourceTextRight: string
  sourceTextRightLink: string
}

export interface Scale {
  name: string
  dataKey: string
  type: string
  dataRange?: number[]
  colors?: Colors
}

export interface Colors {
  default: string
  byKey: ByKey[]
}

export interface ByKey {
  k: string
  c: string
  legend: string
}

export interface Element {
  type: string
  d: HBar | Line
}

export enum AxisRepeatMode {
  ALL = "all",
  FIRST = "first",
  LAST = "last",
}

export interface Axis {
  location: AxisLocation
  labelSpace: number
  orientation: AxisOrientation
  major: AxisGrid
  minor: AxisGrid
  repeat: AxisRepeatMode
}

export interface AxisGrid {
  grid: boolean
  enabled: boolean
  tickSize: number
  color: string
  labelDivide: number
  labelThousands: string
  afterLabel: string
  auto: {
    from: number
    each: number
    labels: boolean
  }
  ticks: {
    n: number;
    l: string;
  }[]
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
  axis: Axis
  dataSet: string
  categories: string
  subCategories: string
  value: string
  labelWidth: number
  repeat: string
  scale: string
}

export enum LabelLocation {
  Left = "left",
  Right = "right",
}

export interface LabelStyle {
  location: LabelLocation
  text: string
  color: string
}

export interface LineStyleKey {
  k: string
  color: string
  width: number
  label: LabelStyle
}

export interface LineStyle {
  default: LineStyleKey
  byKey: LineStyleKey[]
}

export interface Line {
  dataSet: string
  x: X
  y: Y
  categories: string
  stack: boolean
  fill: boolean
  style: LineStyle
}

export interface X {
  axis: Axis
  key: string
  scale: string
}

export interface Y {
  axis: Axis
  key: string
  scale: string
}

export interface Style {
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number
  titleSize: number
  titleBold: boolean
  subTitleSize: number
  subTitleBold: boolean
  sourceMargin: number
  bgColor: string
  textColor: string
}
