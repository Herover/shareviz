# Plugins

THIS IS IN A SUPER WORK-IN-PROGRESS STATE! Don't use in production, yet.

You need to know Svelte and to understand how to write ShareDB operations to mutate JSON data. This is not super complicated, but might be a mouthful! For a example, see how the Range chart is set up.

You can register new chart components by changing the file `src/lib/components/chart/chartComponents.ts` and adding `registerComponent(YourChartComponent);`. This can be a from a local file or a NPM package.

Refer to the `src/lib/components/chart/chartComponents.ts` file for the actual interface, but in general a component should have user friendly name, a unique key only this component use, a function that adds the component to the chart definition, a viewer component and a editor component.

The general flow is

- The add function use ShareDB to insert a component in the component list.
- A editor edits the chart using the editor component, which use ShareDB to change the component JSON definition.
- ShareDB will send operations to the server and other editors currently viewing the chart, where the operations are merged into the chart definition, while the resulting definition is also sent to the viewer component which renders a chart.
