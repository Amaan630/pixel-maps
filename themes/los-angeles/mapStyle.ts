// Los Angeles (GTA V style) MapLibre style
// Dark, minimalist map with prominent white roads

import { colors } from './colors';

export const mapStyle = {
  version: 8,
  name: 'Los Angeles',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    // Background - near black
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.parchment },
    },
    // Water fill - dark blue-gray
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': colors.water,
      },
    },
    // Water outline - subtle
    {
      id: 'water-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'line-color': '#3a4a5a',
        'line-width': ['interpolate', ['exponential', 1.3], ['zoom'], 15, 0.5, 22, 2],
        'line-opacity': 0.5,
      },
    },
    // Parks/forests - barely visible
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'cemetery'],
      paint: { 'fill-color': colors.park, 'fill-opacity': 0.5 },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': colors.park, 'fill-opacity': 0.3 },
    },
    // Buildings fill - subtle dark gray
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': colors.building,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 16, 0.6],
      },
    },
    // Buildings outline - very subtle
    {
      id: 'building-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'line-color': '#333333',
        'line-width': 0.5,
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0, 16, 0.4],
      },
    },
    // Paths - thin gray lines
    {
      id: 'paths',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'path'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#4a4a4a',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 4],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.6],
      },
    },
    // Minor roads - thin gray
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#666666',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 0.5, 22, 12],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.8],
      },
    },
    // Tertiary roads - medium gray
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#888888',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0, 22, 18],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
      },
    },
    // Secondary roads - light gray
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#aaaaaa',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0, 22, 24],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
      },
    },
    // Primary roads - white/light gray
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0, 22, 30],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 1],
      },
    },
    // Trunk roads - bright white
    {
      id: 'road-trunk',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadHsl,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 0.5, 22, 36],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 1],
      },
    },
    // Motorways - brightest white, thickest
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 0.5, 22, 48],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
      },
    },
    // Railway - dashed gray
    {
      id: 'railway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'rail'],
      paint: {
        'line-color': '#555555',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 13, 1, 22, 12],
        'line-dasharray': [4, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 0.6],
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
        'line-color': '#444444',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 6, 0.5, 22, 24],
        'line-opacity': 0.5,
      },
    },
    // Water labels - subtle
    {
      id: 'water-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      filter: ['==', '$type', 'Point'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Italic'],
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 8, 10, 22, 36],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#5a6a7a',
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
        'text-font': ['Noto Sans Bold'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 6, 10, 14, 20, 22, 48],
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': colors.parchment,
        'text-halo-width': 2,
        'text-opacity': 0.9,
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
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 10, 8, 22, 24],
      },
      paint: {
        'text-color': '#888888',
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
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 8, 18, 12],
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': '#888888',
        'text-halo-color': colors.parchment,
        'text-halo-width': 2,
      },
    },
  ],
};

// Convert mapStyle to JSON string for WebView injection
export const mapStyleJSON = JSON.stringify(mapStyle);
