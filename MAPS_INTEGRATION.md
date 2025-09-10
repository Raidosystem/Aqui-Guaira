# Google Maps Integration - Aqui Guaíra

## Overview

The Aqui Guaíra portal now includes comprehensive Google Maps integration for location selection and display across the platform.

## Features

### 🗺️ Interactive Map Location Picker
- **Business Registration**: Select precise business locations during registration
- **Problem Reporting**: Mark exact locations of city issues
- **Real-time Geocoding**: Automatic address suggestions from coordinates
- **Search Functionality**: Find addresses by text search
- **Current Location**: Use device GPS for automatic location detection

### 📍 Location Display
- **Business Directory**: View business locations on interactive maps
- **Company Details**: Detailed map view in company modal dialogs
- **Issue Tracking**: Visualize reported problems with precise locations

## Components

### MapLocationPicker
Interactive map component for location selection with the following features:

- **Click Selection**: Click anywhere on the map to select a location
- **Draggable Marker**: Fine-tune position by dragging the marker
- **Address Search**: Search for specific addresses in Guaíra
- **Current Location**: Get user's current GPS position
- **Address Autocomplete**: Auto-fill address fields from selected coordinates

**Usage:**
```tsx
import { MapLocationPicker } from '@/components/MapLocationPicker'

<MapLocationPicker
  onLocationSelect={(location) => {
    console.log('Selected:', location.lat, location.lng, location.address)
  }}
  initialLocation={{ lat: -20.3186, lng: -48.3103 }}
  initialAddress="Centro, Guaíra - SP"
  height="300px"
/>
```

### MapDisplay
Read-only map component for displaying saved locations:

- **Static Map View**: Shows business or issue locations
- **Location Info**: Displays address and coordinates
- **Visual Context**: Mock street layout for better orientation

**Usage:**
```tsx
import { MapDisplay } from '@/components/MapDisplay'

<MapDisplay
  location={{ lat: -20.3186, lng: -48.3103 }}
  title="Restaurante Sabor da Casa"
  address="Avenida Brasil, 456, Centro"
  height="200px"
/>
```

## Implementation Details

### Mock Maps for Demo
Currently uses a mock implementation for demonstration purposes. The mock maps include:

- **Visual Grid**: Grid pattern to simulate map tiles
- **Street Simulation**: Mock roads and buildings for context
- **Interactive Markers**: Clickable location markers
- **Realistic Appearance**: Green background with street elements

### Production Setup
To use real Google Maps in production:

1. **Get API Key**: Obtain a Google Maps JavaScript API key
2. **Enable Services**: Enable Maps JavaScript API and Places API
3. **Configure Key**: Replace `YOUR_GOOGLE_MAPS_API_KEY` in the code
4. **Update Types**: Install `@types/google.maps` for proper TypeScript support

```typescript
// In production, replace the mock implementation with:
const script = document.createElement('script')
script.src = `https://maps.googleapis.com/maps/api/js?key=${REAL_API_KEY}&libraries=places`
```

## Data Structure

### Coordinates Format
All location data uses the standard latitude/longitude format:

```typescript
interface Coordinates {
  lat: number  // Latitude (e.g., -20.3186 for Guaíra)
  lng: number  // Longitude (e.g., -48.3103 for Guaíra)
}
```

### Location Selection Response
The `onLocationSelect` callback provides:

```typescript
interface LocationSelection {
  lat: number
  lng: number
  address?: string          // Human-readable address
  formatted_address?: string // Formatted address from geocoding
}
```

## Integration Points

### Business Registration (`BusinessRegistration.tsx`)
- **Location Selection**: Mandatory map-based location selection
- **Address Integration**: Auto-fills address fields from map selection
- **Validation**: Ensures businesses have valid coordinates

### Problem Reporting (`ReportProblem.tsx`)
- **Issue Location**: Precise marking of city problems
- **Geocoding**: Converts coordinates to readable addresses
- **Status Tracking**: Links location data to issue tracking

### Company Directory (`CompanyDirectory.tsx`)
- **Location Display**: Shows business locations in detail modals
- **Map Integration**: Seamless viewing of business coordinates
- **Address Verification**: Displays both address text and coordinates

## Guaíra-Specific Features

### Default Location
- **Center Point**: -20.3186, -48.3103 (Guaíra city center)
- **Local Context**: All maps default to Guaíra boundaries
- **Address Validation**: Prioritizes Guaíra addresses in search

### Sample Locations
The demo includes several businesses with realistic Guaíra coordinates:

1. **Farmácia Popular**: -20.3180, -48.3100 (Centro)
2. **Restaurante Sabor da Casa**: -20.3190, -48.3110 (Centro)
3. **Auto Mecânica Silva**: -20.3200, -48.3120 (Vila Industrial)

## Future Enhancements

### Planned Features
- **Route Planning**: Directions to businesses
- **Cluster Maps**: Group nearby businesses
- **Heatmaps**: Visualize issue concentration
- **Offline Support**: Cached map tiles
- **Custom Styling**: Branded map appearance

### API Integration
- **CEP Integration**: Enhanced address lookup via ViaCEP
- **Municipal Data**: Integration with city geographic data
- **Public Transport**: Bus routes and stops
- **Points of Interest**: Schools, hospitals, parks

## Accessibility

### Features
- **Keyboard Navigation**: Full keyboard support for map controls
- **Screen Reader**: ARIA labels for map elements
- **High Contrast**: Clear marker visibility
- **Touch Support**: Mobile-friendly interaction

### Best Practices
- **Alternative Text**: Descriptive text for map content
- **Fallback Options**: Text-based location entry as backup
- **Clear Instructions**: Step-by-step guidance for map usage

## Performance

### Optimization
- **Lazy Loading**: Maps load only when needed
- **Efficient Rendering**: Minimal DOM manipulation
- **Caching**: Reuse geocoding results
- **Progressive Enhancement**: Works without JavaScript

### Monitoring
- **Load Times**: Track map initialization speed
- **API Usage**: Monitor geocoding API calls
- **Error Handling**: Graceful fallback for map failures

---

This Google Maps integration enhances the Aqui Guaíra portal by providing precise location services that help connect the community with local businesses and municipal services through accurate geographic information.