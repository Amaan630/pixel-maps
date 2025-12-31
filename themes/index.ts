// Central theme registry - add new themes here

import * as cyberpunk from "./cyberpunk";
import * as losAngeles from "./los-angeles";
import * as sanAndreas from "./san-andreas";
import * as western from "./western";

export type ThemeName = "western" | "los-angeles" | "cyberpunk" | "san-andreas";

export interface Theme {
    name: ThemeName;
    displayName: string;
    colors: typeof western.colors;
    fonts: typeof western.fonts;
    fontAssets: Record<string, number>; // Font assets can vary by theme
    mapStyleJSON: string;
}

export const themes: Record<ThemeName, Theme> = {
    western: {
        name: "western",
        displayName: "Western",
        colors: western.colors,
        fonts: western.fonts,
        fontAssets: western.fontAssets,
        mapStyleJSON: western.mapStyleJSON,
    },
    "los-angeles": {
        name: "los-angeles",
        displayName: "Los Santos",
        colors: losAngeles.colors,
        fonts: losAngeles.fonts,
        fontAssets: losAngeles.fontAssets,
        mapStyleJSON: losAngeles.mapStyleJSON,
    },
    // 'toy-carpet': {
    //   name: 'toy-carpet',
    //   displayName: 'Toy Carpet',
    //   colors: toyCarpet.colors,
    //   fonts: toyCarpet.fonts,
    //   fontAssets: toyCarpet.fontAssets,
    //   mapStyleJSON: toyCarpet.mapStyleJSON,
    // },
    cyberpunk: {
        name: "cyberpunk",
        displayName: "Cyberpunk",
        colors: cyberpunk.colors,
        fonts: cyberpunk.fonts,
        fontAssets: cyberpunk.fontAssets,
        mapStyleJSON: cyberpunk.mapStyleJSON,
    },
    "san-andreas": {
        name: "san-andreas",
        displayName: "San Andreas",
        colors: sanAndreas.colors,
        fonts: sanAndreas.fonts,
        fontAssets: sanAndreas.fontAssets,
        mapStyleJSON: sanAndreas.mapStyleJSON,
    },
};

export const themeNames = Object.keys(themes) as ThemeName[];
export const defaultTheme: ThemeName = "los-angeles";
