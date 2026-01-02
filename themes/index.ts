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
    is3D: boolean; // true = tilted 3D camera view, false = flat 2D view
}

export const themes: Record<ThemeName, Theme> = {
    western: {
        name: "western",
        displayName: "Western",
        colors: western.colors,
        fonts: western.fonts,
        fontAssets: western.fontAssets,
        mapStyleJSON: western.mapStyleJSON,
        is3D: false,
    },
    "los-angeles": {
        name: "los-angeles",
        displayName: "Los Santos",
        colors: losAngeles.colors,
        fonts: losAngeles.fonts,
        fontAssets: losAngeles.fontAssets,
        mapStyleJSON: losAngeles.mapStyleJSON,
        is3D: false,
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
        is3D: true,
    },
    "san-andreas": {
        name: "san-andreas",
        displayName: "San Andreas",
        colors: sanAndreas.colors,
        fonts: sanAndreas.fonts,
        fontAssets: sanAndreas.fontAssets,
        mapStyleJSON: sanAndreas.mapStyleJSON,
        is3D: false,
    },
};

export const themeNames = Object.keys(themes) as ThemeName[];
export const defaultTheme: ThemeName = "los-angeles";
