// SPDX-License-Identifier: MPL-2.0

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
  tags?: FileTag[];
}

export interface FileTag {
  id: string;
  category: string;
  key: string;
  val?: string;
  color: string;
}

export type FolderItem = Folder | File;
