// Western theme MapLibre style
// This is injected into the WebView as a JavaScript object

import { colors } from './colors';

// MapLibre style specification for "New Western" theme
export const mapStyle = {
  version: 8,
  name: 'New Western',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://amaan630.github.io/pixel-maps-fonts/{fontstack}/{range}.pbf',
  layers: [
    // Land - parchment tan background
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.parchment },
    },
    // Water fill
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': colors.water,
        'fill-outline-color': 'hsla(0, 0%, 0%, 0)',
      },
    },
    // Water line (outline)
    {
      id: 'water-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.3], ['zoom'], 15, 1, 22, 36],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 12.5, 1],
      },
    },
    // Landuse - parks, forests
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'cemetery'],
      paint: { 'fill-color': colors.park },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': colors.park, 'fill-opacity': 0.6 },
    },
    // Buildings fill
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': colors.building,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 1],
      },
    },
    // Buildings outline
    {
      id: 'building-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 12],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.5, 1],
      },
    },
    // Border shadow
    {
      id: 'border-shadow',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': colors.charcoalShadow,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 6, 1, 22, 288],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0, 3.5, 1],
      },
    },
    // Border
    {
      id: 'border',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['==', 'admin_level', 2],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 6, 0.5, 22, 72],
        'line-dasharray': [10, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0, 3.5, 1],
      },
    },
    // Paths
    {
      id: 'paths',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'path'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 12],
        'line-dasharray': [3, 4],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, 1],
      },
    },
    // Minor roads
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 0.5, 22, 24],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
      },
    },
    // Tertiary roads
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0, 22, 36],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
      },
    },
    // Secondary roads
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0, 22, 42],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
      },
    },
    // Primary roads
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0, 22, 48],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 1],
      },
    },
    // Trunk roads
    {
      id: 'road-trunk',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 0.5, 22, 60],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 1],
      },
    },
    // Motorways
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 0.5, 22, 72],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
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
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 13, 1, 22, 36],
        'line-dasharray': [10, 1],
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
        'text-font': ['Chinese Rocks Regular'],
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 8, 10, 22, 48],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': colors.charcoal,
        'text-halo-color': colors.water,
        'text-halo-width': 1,
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
        'text-font': ['Chinese Rocks Regular'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.2,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 6, 10, 14, 24, 22, 72],
      },
      paint: {
        'text-color': colors.charcoalTranslucent,
        'text-halo-color': colors.parchment,
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
        'text-font': ['Chinese Rocks Regular'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 10, 8, 22, 36],
      },
      paint: {
        'text-color': colors.charcoalTranslucent,
        'text-halo-color': colors.parchment,
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
        'text-font': ['Chinese Rocks Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 8, 18, 14],
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': colors.charcoal,
        'text-halo-color': colors.parchment,
        'text-halo-width': 2,
      },
    },
  ],
};

// Convert mapStyle to JSON string for WebView injection
export const mapStyleJSON = JSON.stringify(mapStyle);
