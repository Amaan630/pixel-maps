// Cyberpunk theme MapLibre style
// Inspired by Cyberpunk 2077 - dark navy, red buildings, cyan roads

import { colors } from './colors';

export const mapStyle = {
  version: 8,
  name: 'Cyberpunk',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://amaan630.github.io/pixel-maps-fonts/{fontstack}/{range}.pbf',
  layers: [
    // Background - very dark navy
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.parchment },
    },
    // Water fill - dark blue
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': colors.water,
        'fill-outline-color': '#1a3a5a',
      },
    },
    // Landuse - parks (very dark green)
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'cemetery'],
      paint: {
        'fill-color': colors.park,
        'fill-outline-color': '#2a4a2a',
      },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': '#0f1f0f', 'fill-opacity': 0.8 },
    },
    // Buildings fill - deep red/maroon
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': colors.building,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.9],
      },
    },
    // Buildings outline - lighter red
    {
      id: 'building-line',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'line-color': colors.buildingOutline,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 6],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1],
      },
    },
    // ========== ROADS - Cyan neon style ==========
    // Road casing (dark outline)
    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 2, 22, 28],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.8],
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
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 1, 22, 36],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 0.8],
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
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 1, 22, 42],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 0.8],
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
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 1, 22, 48],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 0.8],
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
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 1, 22, 56],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 0.8],
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
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 1, 22, 64],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 0.8],
      },
    },
    // Road fill - cyan neon
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 1, 22, 24],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.7],
      },
    },
    {
      id: 'road-tertiary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'tertiary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 0.5, 22, 32],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 0.7],
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'secondary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 0.5, 22, 38],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 0.7],
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'primary'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 0.5, 22, 44],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 0.7],
      },
    },
    {
      id: 'road-trunk',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'trunk'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 0.5, 22, 52],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 0.7],
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', 'class', 'motorway'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': colors.roadCyan,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 0.5, 22, 60],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 0.7],
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
        'line-color': '#00a0cc',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 6],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, 0.5],
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
        'line-color': '#ff6b6b',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 13, 1, 22, 16],
        'line-dasharray': [4, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 11.5, 0.6],
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
        'text-font': ['Cyberpunk Regular'],
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 8, 10, 22, 48],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#4a8aaa',
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
        'text-font': ['Cyberpunk Regular'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.2,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 6, 12, 14, 28, 22, 72],
      },
      paint: {
        'text-color': colors.roadCyan,
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
        'text-font': ['Cyberpunk Regular'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 10, 10, 22, 36],
      },
      paint: {
        'text-color': colors.roadCyan,
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
        'text-font': ['Cyberpunk Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 18, 16],
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': colors.roadDark,
        'text-halo-width': 2,
      },
    },
  ],
};

export const mapStyleJSON = JSON.stringify(mapStyle);
