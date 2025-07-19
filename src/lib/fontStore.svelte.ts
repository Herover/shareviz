export interface FONTS {
  [key: string]: { url: string; format: string };
}

class FontStore {
  #fontMap: FONTS = $state({});

  setFontMap(newFontMap: FONTS) {
    this.#fontMap = newFontMap;
  }

  get fontCSS(): string {
    return Object.keys(this.#fontMap)
      .map(
        (k) =>
          `
      @font-face {
        font-family: ${k};
        src:
          url("${this.#fontMap[k].url}")
            format("${this.#fontMap[k].format.replace('"', "'")}");
      }
      `,
      )
      .join("");
  }
}

export const fontStore = new FontStore();
