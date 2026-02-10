export const MAP_MESSAGE = {
  minimap: {
    setMode: 'setMiniMapMode',
    setZoom: 'setMiniMapZoom',
    updateLocation: 'updateMiniMapLocation',
  },
  discovery: {
    setMode: 'setDiscoveryMode',
    loadTiles: 'setDiscoveryTiles',
    reveal: 'revealDiscoveryPoint',
    clear: 'clearDiscoveryFog',
  },
} as const;
