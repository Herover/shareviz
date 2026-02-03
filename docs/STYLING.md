# Styling

DataTortilla allows editors to embedd custom stylesheets into the web charts. This allows styling charts using own style guides to match site styles better, etc.

Here's a example using CSS variables:

```css
.chart {
    /* Default light theme */
    --background-color: #ffffff;
    --text-primary-color: #000000;
    --text-mute-color: #888888;
    --chart-padding-left: 16px;
    --chart-padding-right: 16px;
    --chart-padding-top: 16px;
    --chart-padding-bottom: 16px;

    --axis-line-color: #aaaaaa;
    --axis-text-size: 0.9em;
}
```

The current available CSS variables can be found in `src/lib/components/chart/ChartViewer.svelte`,
