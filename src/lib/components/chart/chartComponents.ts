import { type Component } from "svelte";

import type { Root } from "$lib/chart";

import HBar from "./HBar";
import Line from "./Line";
import ErrorText from "./ErrorText.svelte";
import type { ChartStore } from "$lib/chartStores/chart.svelte";

interface ChartComponent {
  /** Human readable name of chart type */
  name: string;
  /** Unique key used to identify component */
  key: string;
  /** Function to call when adding a new item */
  add: (chart: ChartStore, index: number) => void;
  /** Actual component displayed in chart */
  // FIXME: types are not correct
  component: () => Promise<
    Component<
      {
        chartSpec: Root;
        componentSpec: any;
        data: {
          [key: string]: any[];
        };
        chartWidth: number;
        editor: boolean;
        index: number;
      },
      // TODO: type events without making ChartViewer.svelte unhappy
      // {
      //   edit: any,
      // }
      any
    >
  >;
  /** Component for editor */
  editorComponent: Component<any> | (() => Promise<Component<any>>);
}

const components: { [key: string]: ChartComponent } = {};
const componentCache: { [key: string]: Component<any, any> } = {};

export const registerComponent = (component: ChartComponent) => {
  if (component.key in components) {
    throw new Error(
      `Trying to register component with name ${component.key}, but it's already registered'`,
    );
  }

  components[component.key] = component;
};

// FIXME: remove type conversions when ChartComponent is fixed
registerComponent(Line as unknown as ChartComponent);
registerComponent(HBar as unknown as ChartComponent);

export const getComponent = async (key: string): Promise<any> => {
  if (key in componentCache) {
    return componentCache[key];
  }
  if (key in components) {
    componentCache[key] = await components[key].component();
    return componentCache[key];
  }
  return ErrorText;
};
export const getEditorComponent = async (key: string): Promise<any> => {
  if (key in components) {
    return components[key].editorComponent;
  }
  return ErrorText;
};
export const getComponentList = () =>
  Object.keys(components).map((key) => ({
    add: components[key].add,
    key,
    label: components[key].name,
  }));
