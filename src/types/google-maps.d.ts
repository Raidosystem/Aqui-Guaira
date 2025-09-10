// Global type declarations for Google Maps (for demo purposes)
declare global {
  interface Window {
    google?: {
      maps: {
        Map: any
        Marker: any
        MapMouseEvent: any
      }
    }
  }
}

export {}