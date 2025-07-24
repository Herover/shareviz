// SPDX-License-Identifier: MPL-2.0

// Handles some communication between editor and chart
class ChartToEditor {
  highlight: any[] = $state([]);
  setHighlight(data: any[]) {
    this.highlight = data;
  }
}

export const chartToEditor = new ChartToEditor();
