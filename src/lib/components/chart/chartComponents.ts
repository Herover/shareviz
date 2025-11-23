// SPDX-License-Identifier: MPL-2.0

import { type Component } from "svelte";

import type { Root } from "$lib/chart";

import HBar from "./HBar";
import Line from "./Line";
import ErrorText from "./ErrorText.svelte";
import type { ChartStore } from "$lib/chartStores/chart.svelte";
import type { ComputedData } from "$lib/data";
import type { ShareDBConnection } from "$lib/chartStores/data.svelte";

export interface EditorComponentProps<chartSpec> {
  spec: Root;
  chartSpec: chartSpec;
  chartData: ComputedData;
  index: number;
  id: string;
  connection: ShareDBConnection;
  store: ReturnType<typeof ChartStore.prototype.scopeElement>;
}
export interface ChartComponentProps {
  chartSpec: Root;
  componentSpec: any;
  data: ComputedData;
  chartWidth: number;
  editor: boolean;
  index: number;
}

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
      ChartComponentProps,
      // TODO: type events without making ChartViewer.svelte unhappy
      // {
      //   edit: any,
      // }
      any
    >
  >;
  /** Component for editor */
  editorComponent: Component<EditorComponentProps<any>> | (() => Promise<Component<EditorComponentProps<any>>>);
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
