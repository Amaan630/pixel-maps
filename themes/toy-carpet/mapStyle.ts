// Toy Carpet theme MapLibre style
// Inspired by children's play mat maps - gray roads with white dashed lines

import { colors } from './colors';

// MapLibre style specification for "Toy Carpet" theme
export const mapStyle = {
  version: 8,
  name: 'Toy Carpet',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    // Background - bright grass green
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.parchment },
    },
    // Water fill - bright blue
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': colors.water,
        'fill-outline-color': '#1E88E5',
      },
    },
    // Landuse - parks (slightly different green)
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'cemetery'],
      paint: {
        'fill-color': colors.park,
        'fill-outline-color': '#43A047',
      },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': '#388E3C', 'fill-opacity': 0.8 },
    },
    // Buildings fill - yellow/orange
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': colors.building,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
      },
    },
    // Buildings outline - dark
    {
      id: 'building-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'line-color': colors.charcoal,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 1, 22, 8],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
      },
    },
    // ========== ROADS - The key toy carpet feature ==========
    // Road casing (dark outline around roads)
    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 3, 22, 32],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
      },
    },
    {
      id: 'road-tertiary-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 2, 22, 44],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
      },
    },
    {
      id: 'road-secondary-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 2, 22, 50],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
      },
    },
    {
      id: 'road-primary-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 2, 22, 56],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 1],
      },
    },
    {
      id: 'road-trunk-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 2, 22, 68],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 1],
      },
    },
    {
      id: 'road-motorway-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 2, 22, 80],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
      },
    },
    // Road fill (gray surface)
    {
      id: 'road-minor-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 2, 22, 28],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
      },
    },
    {
      id: 'road-tertiary-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 1, 22, 40],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
      },
    },
    {
      id: 'road-secondary-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 1, 22, 46],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
      },
    },
    {
      id: 'road-primary-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 1, 22, 52],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 1],
      },
    },
    {
      id: 'road-trunk-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 1, 22, 64],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 1],
      },
    },
    {
      id: 'road-motorway-fill',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadGray,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 1, 22, 76],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
      },
    },
    // ========== WHITE DASHED CENTER LINES ==========
    {
      id: 'road-minor-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 0.5, 22, 4],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 16, 1],
      },
    },
    {
      id: 'road-tertiary-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 12, 0.5, 22, 6],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
      },
    },
    {
      id: 'road-secondary-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0.5, 22, 8],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
      },
    },
    {
      id: 'road-primary-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.5, 22, 10],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
      },
    },
    {
      id: 'road-trunk-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 6, 0.5, 22, 12],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1],
      },
    },
    {
      id: 'road-motorway-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadLine,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 0.5, 22, 14],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0, 7, 1],
      },
    },
    // Paths (dashed)
    {
      id: 'paths',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'path'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#8D6E63',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 1, 22, 8],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, 1],
      },
    },
    // Railway
    {
      id: 'railway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'rail'],
      paint: {
        'line-color': '#5D4037',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 13, 2, 22, 24],
        'line-dasharray': [4, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 11.5, 1],
      },
    },
    // Water labels
    {
      id: 'water-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      filter: ['==', '$type', 'Point'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 8, 10, 22, 48],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#1565C0',
        'text-halo-color': colors.water,
        'text-halo-width': 2,
      },
    },
    // Place labels - cities/towns
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', 'class', 'city', 'town'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Bold'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 6, 12, 14, 28, 22, 72],
      },
      paint: {
        'text-color': colors.charcoal,
        'text-halo-color': '#FFFFFF',
        'text-halo-width': 2,
      },
    },
    // Place labels - villages
    {
      id: 'place-village',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', 'class', 'village'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Bold'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 10, 10, 22, 36],
      },
      paint: {
        'text-color': colors.charcoal,
        'text-halo-color': '#FFFFFF',
        'text-halo-width': 1.5,
      },
    },
    // Road labels
    {
      id: 'road-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'trunk', 'motorway'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 18, 16],
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': colors.roadGray,
        'text-halo-width': 2,
      },
    },
  ],
};

// Convert mapStyle to JSON string for WebView injection
export const mapStyleJSON = JSON.stringify(mapStyle);
