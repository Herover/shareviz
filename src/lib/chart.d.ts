export interface Root {
  data: Data
  chart: Chart
  style: Style
}

export interface Data {
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
  hBar: HBar
  line: Line
  sourceTextLeft: string
  sourceTextLeftLink: string
  sourceTextRight: string
  sourceTextRightLink: string
}

export interface HBar {
  categories: string
  subCategories: string
  value: string
  labelWidth: number
}

export interface Line {
  x: X
}

export interface X {}

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
