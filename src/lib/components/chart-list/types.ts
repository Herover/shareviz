export interface Folder {
  type: "folder";
  name: string;
  id: string;
  created: number;
  updated: number;
  contents: FolderItem[];
  open?: boolean;
}

export interface File {
  type: "file";
  name: string;
  id: string;
  created: number;
  updated: number;
  chartRef: string;
}

export type FolderItem = Folder | File;
