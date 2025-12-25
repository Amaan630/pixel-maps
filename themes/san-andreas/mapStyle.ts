// San Andreas theme MapLibre style
// Inspired by GTA San Andreas - grayish blue water, light buildings, dark roads

import { colors } from './colors';

export const mapStyle = {
  version: 8,
  name: 'San Andreas',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://amaan630.github.io/pixel-maps-fonts/{fontstack}/{range}.pbf',
  layers: [
    // Background - grayish blue like SA ocean
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': colors.parchment },
    },
    // Water fill - slightly darker grayish blue
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: {
        'fill-color': colors.water,
        'fill-outline-color': '#7A8395',
      },
    },
    // Beach/sand areas
    {
      id: 'landuse-sand',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'sand'],
      paint: {
        'fill-color': colors.beach,
        'fill-opacity': 0.9,
      },
    },
    // Landuse - parks (olive green)
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['in', 'class', 'park', 'grass', 'cemetery'],
      paint: {
        'fill-color': colors.park,
        'fill-outline-color': '#4A6A3A',
      },
    },
    {
      id: 'landuse-forest',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', 'class', 'wood'],
      paint: { 'fill-color': colors.forest, 'fill-opacity': 0.9 },
    },
    // Buildings fill - light gray/white like SA map
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': colors.building,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.95],
      },
    },
    // Buildings outline - subtle gray
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
    // ========== ROADS - Dark thick style like SA map ==========
    // Road casing (even darker outline)
    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadOutline,
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
        'line-color': colors.roadOutline,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 2, 22, 40],
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
        'line-color': colors.roadOutline,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 2, 22, 48],
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
        'line-color': colors.roadOutline,
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
        'line-color': colors.roadOutline,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 2, 22, 64],
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
        'line-color': colors.roadOutline,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 2, 22, 72],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
      },
    },
    // Road fill - dark navy/black
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', 'class', 'minor', 'service', 'track'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 2, 22, 28],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
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
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 10, 1, 22, 36],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 12, 1],
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
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 8, 1, 22, 44],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 10, 1],
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
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 6, 1, 22, 52],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 7.5, 1],
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
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 5, 1, 22, 60],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 5.5, 1],
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
        'line-color': colors.roadDark,
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 4, 1, 22, 68],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0, 5, 1],
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
        'line-color': '#3A3A4A',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 15, 0.5, 22, 6],
        'line-dasharray': [2, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 14.5, 0.7],
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
        'line-color': '#8B4513',
        'line-width': ['interpolate', ['exponential', 1.4], ['zoom'], 13, 1, 22, 16],
        'line-dasharray': [4, 2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 11.5, 0.8],
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
        'text-font': ['Pricedown Black'],
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 8, 10, 22, 48],
        'text-letter-spacing': 0.1,
      },
      paint: {
        'text-color': '#6A7485',
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
        'text-font': ['Pricedown Black'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 6, 12, 14, 28, 22, 72],
      },
      paint: {
        'text-color': colors.roadDark,
        'text-halo-color': colors.building,
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
        'text-font': ['Pricedown Black'],
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.1,
        'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 10, 10, 22, 36],
      },
      paint: {
        'text-color': colors.roadDark,
        'text-halo-color': colors.building,
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
        'text-font': ['Pricedown Black'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 18, 16],
        'symbol-placement': 'line',
        'text-rotation-alignment': 'map',
      },
      paint: {
        'text-color': colors.building,
        'text-halo-color': colors.roadDark,
        'text-halo-width': 2,
      },
    },
  ],
};

export const mapStyleJSON = JSON.stringify(mapStyle);
