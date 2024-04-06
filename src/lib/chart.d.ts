export interface Root {
  data: Data
  chart: Chart
  style: Style
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
  hBar?: HBar
  line?: Line
}

export interface HBar {
  dataSet: string
  categories: string
  subCategories: string
  value: string
  labelWidth: number
  repeat: string
  scale: string
}

export interface Line {
  dataSet: string
  x: X
  y: Y
  categories: string
  stack: boolean
  fill: boolean
}

export interface X {
  key: string
  scale: string
}

export interface Y {
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
}
