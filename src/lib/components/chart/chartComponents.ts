import { SvelteComponent } from "svelte";

import type { Root } from "$lib/chart";

import HBar from "./HBar";
import Line from "./Line";
import ErrorText from "./ErrorText.svelte";

interface ChartComponent {
  /** Human readable name of chart type */
  name: string,
  /** Unique key used to identify component */
  key: string,
  /** Actual component displayed in chart */
  // FIXME: types are not correct
  component: typeof SvelteComponent<{
    chartSpec: Root,
    componentSpec: any,
    data: {
      [key: string]: any[];
    },
    chartWidth: number,
  }>,
  /** Component for editor */
  editorComponent: SvelteComponent<any>,
}

const components: { [key: string]: ChartComponent } = {};

export const registerComponent = (component: ChartComponent) => {
  if (component.key in components) {
    throw new Error(`Trying to register component with name ${component.key}, but it's already registered'`);
  }

  components[component.key] = component;
};

// FIXME: remove type conversions when ChartComponent is fixed
registerComponent(Line as unknown as ChartComponent)
registerComponent(HBar as unknown as ChartComponent)

export const getComponent = (key: string) => {
  if (key in components) {
    return components[key].component;
  }
  return ErrorText;
}
