<script lang="ts">
  import HBar from "$lib/components/chart/HBar.svelte";
  import { db } from "$lib/chartStore";
  import { dsvFormat } from "d3-dsv";
  import ChartEditor from "$lib/components/chart/ChartEditor.svelte";

  const disconnect = db.connect('1');
  
  $: chartSpec = $db.doc;
  $: console.log(chartSpec)

  let sizeHeight = 0;
  const onSizeInfo = (height: number) => (sizeHeight = height);

  $: data = chartSpec == null ? [] : dsvFormat("\t").parse(chartSpec.data.raw, (row) => {
    return chartSpec.data.rows.reduce((acc: any, rowInfo: any) => {
      if (rowInfo.type == "number") {
        acc[rowInfo.key] = Number.parseFloat(row[rowInfo.key]);
      } else if (rowInfo.type == "text") {
        acc[rowInfo.key] = row[rowInfo.key];
      }

      return acc;
    }, {} as any);
  });

  $: height = chartSpec == null ? [] : 
    chartSpec.style.subTitleSize * 3 +
    chartSpec.style.titleSize +
    sizeHeight +
    16 +
    chartSpec.style.marginBottom +
    chartSpec.style.marginTop +
    chartSpec.style.sourceMargin;
</script>

<div class="main">
  {#if chartSpec != null}
    <div class="chart-controls-pane">
      <div class="chart-controls-primary chart-controls">
        <ChartEditor chart={chartSpec.chart} chartScope={db.chart()} />
      </div>
    </div>

    <div class="chart-viewer">
      <svg width={chartSpec.chart.width} {height}>
        <defs>
          <style>
            svg {
              font-family: Arial, Helvetica, sans-serif;
            }
          </style>
        </defs>
        <rect width={chartSpec.chart.width} {height} fill="{chartSpec.style.bgColor}" />
        <g
          transform="translate({chartSpec.style.marginLeft}, {chartSpec.style
            .marginTop})"
        >
          <text
            font-size={chartSpec.style.titleSize}
            font-weight={chartSpec.style.titleBold ? "bold" : "normal"}
            y={chartSpec.style.titleSize}>{chartSpec.chart.title}</text
          >
          <text
            font-size={chartSpec.style.subTitleSize}
            font-weight={chartSpec.style.subTitleBold ? "bold" : "normal"}
            y={chartSpec.style.subTitleSize * 2 + chartSpec.style.titleSize}
            >{chartSpec.chart.subTitle}</text
          >
          <g
            transform="translate({0},{chartSpec.style.subTitleSize * 3 +
              chartSpec.style.titleSize})"
          >
            <!-- <rect
              x={0}
              y={0}
              width={chartSpec.chart.width -
                chartSpec.style.marginLeft -
                chartSpec.style.marginRight}
              height={sizeHeight}
              fill="#aaffaa"
            /> -->
            {#if (chartSpec.chart.chartType = "hBar")}
              <HBar
                labelWidth={chartSpec.chart.hBar.labelWidth}
                valueWidth={chartSpec.chart.width -
                  chartSpec.style.marginLeft -
                  chartSpec.style.marginRight -
                  chartSpec.chart.hBar.labelWidth}
                values={data.map((d) => ({
                  label: d[chartSpec.chart.hBar.categories],
                  value: chartSpec.chart.hBar.value.map((k) => ({
                    label: k,
                    value: d[k],
                  })),
                }))}
                on:size={(e) => onSizeInfo(e.detail.height)}
              />
            {/if}
          </g>
          <g
            transform="translate({0},{chartSpec.style.subTitleSize * 3 +
              chartSpec.style.titleSize +
              sizeHeight +
              chartSpec.style.sourceMargin})"
          >
            <text dominant-baseline="hanging">
              <a href={chartSpec.chart.sourceTextLeftLink} fill="#888888"
                >{chartSpec.chart.sourceTextLeft}</a
              >
            </text>
            <text
              x={chartSpec.chart.width -
                chartSpec.style.marginLeft -
                chartSpec.style.marginRight}
              dominant-baseline="hanging"
              text-anchor="end"
            >
              <a href={chartSpec.chart.sourceTextRightLink} fill="#888888"
                >{chartSpec.chart.sourceTextRight}</a
              >
            </text>
          </g>
        </g>
      </svg>
    </div>

    <div class="chart-controls-pane">
      <div class="chart-controls-secondary chart-controls">
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
        <p>Asdf</p>
      </div>
    </div>
  {:else}
    <p>Loading, hopefully...</p>
  {/if}
</div>

<style>
  .main {
    display: flex;
    /* justify-content: space-between; */
  }
  .chart-controls-pane {
    /* width: 100%; */
    /* flex-basis: 400px; */
    flex-grow: 0;
    height: 100vh;
  }

  .chart-controls {
    background-color: white;
    position: fixed;
    border: 1px solid black;
    box-sizing: border-box;
    padding: 10px;
    z-index: 10;
    height: 100%;
    overflow-y: scroll;
  }
  .chart-controls-primary {
    width: 400px;
  }
  .chart-controls-secondary {
    right: 0px;
    width: 400px;
  }

  .chart-viewer {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #eeeeee;
  }
</style>
