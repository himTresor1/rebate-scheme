// Vehicle Models Database for E-Motorcycles in Rwanda

export interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  batteryCapacity: string;
  yearOfManufacture: string;
  category: 'passenger' | 'cargo' | 'both';
}

export const vehicleBrands = [
  'Ampersand',
  'Opibus',
  'EV Electric',
  'Roam',
  'Ecobodaa',
  'Zembo',
  'BasiGo',
  'Other'
];

export const vehicleModels: VehicleModel[] = [
  // Ampersand Models
  {
    id: 'amp-gen1',
    brand: 'Ampersand',
    model: 'E-Moto Gen 1',
    batteryCapacity: '4.2 kWh',
    yearOfManufacture: '2023',
    category: 'passenger'
  },
  {
    id: 'amp-gen2',
    brand: 'Ampersand',
    model: 'E-Moto Gen 2',
    batteryCapacity: '4.8 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'amp-gen2-plus',
    brand: 'Ampersand',
    model: 'E-Moto Gen 2 Plus',
    batteryCapacity: '5.0 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'amp-cargo',
    brand: 'Ampersand',
    model: 'E-Moto Cargo',
    batteryCapacity: '5.5 kWh',
    yearOfManufacture: '2024',
    category: 'cargo'
  },

  // Opibus Models
  {
    id: 'opi-moto',
    brand: 'Opibus',
    model: 'Opibus Moto',
    batteryCapacity: '5.2 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'opi-moto-pro',
    brand: 'Opibus',
    model: 'Opibus Moto Pro',
    batteryCapacity: '5.5 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'opi-moto-cargo',
    brand: 'Opibus',
    model: 'Opibus Moto Cargo',
    batteryCapacity: '6.0 kWh',
    yearOfManufacture: '2024',
    category: 'cargo'
  },

  // EV Electric Models
  {
    id: 'ev-thunder-e100',
    brand: 'EV Electric',
    model: 'Thunder E100',
    batteryCapacity: '4.5 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'ev-thunder-e150',
    brand: 'EV Electric',
    model: 'Thunder E150',
    batteryCapacity: '4.8 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'ev-thunder-e200',
    brand: 'EV Electric',
    model: 'Thunder E200',
    batteryCapacity: '5.2 kWh',
    yearOfManufacture: '2024',
    category: 'both'
  },

  // Roam Models
  {
    id: 'roam-air',
    brand: 'Roam',
    model: 'Roam Air',
    batteryCapacity: '3.5 kWh',
    yearOfManufacture: '2023',
    category: 'passenger'
  },
  {
    id: 'roam-move',
    brand: 'Roam',
    model: 'Roam Move',
    batteryCapacity: '4.0 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'roam-thunder',
    brand: 'Roam',
    model: 'Roam Thunder',
    batteryCapacity: '5.0 kWh',
    yearOfManufacture: '2024',
    category: 'cargo'
  },

  // Ecobodaa Models
  {
    id: 'eco-standard',
    brand: 'Ecobodaa',
    model: 'Ecobodaa Standard',
    batteryCapacity: '4.0 kWh',
    yearOfManufacture: '2023',
    category: 'passenger'
  },
  {
    id: 'eco-plus',
    brand: 'Ecobodaa',
    model: 'Ecobodaa Plus',
    batteryCapacity: '4.5 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },

  // Zembo Models
  {
    id: 'zembo-standard',
    brand: 'Zembo',
    model: 'Zembo E-Moto',
    batteryCapacity: '3.8 kWh',
    yearOfManufacture: '2023',
    category: 'passenger'
  },
  {
    id: 'zembo-pro',
    brand: 'Zembo',
    model: 'Zembo E-Moto Pro',
    batteryCapacity: '4.2 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },

  // BasiGo Models
  {
    id: 'basigo-bm1',
    brand: 'BasiGo',
    model: 'BasiGo BM1',
    batteryCapacity: '4.5 kWh',
    yearOfManufacture: '2024',
    category: 'passenger'
  },
  {
    id: 'basigo-bm2',
    brand: 'BasiGo',
    model: 'BasiGo BM2',
    batteryCapacity: '5.0 kWh',
    yearOfManufacture: '2024',
    category: 'both'
  }
];

// Helper function to get models by brand
export function getModelsByBrand(brand: string): VehicleModel[] {
  if (brand === 'Other') {
    return [];
  }
  return vehicleModels.filter(v => v.brand === brand);
}

// Helper function to get model by ID
export function getModelById(id: string): VehicleModel | undefined {
  return vehicleModels.find(v => v.id === id);
}

// Get all unique years
export function getManufactureYears(): string[] {
  const years = Array.from(new Set(vehicleModels.map(v => v.yearOfManufacture)));
  return years.sort().reverse();
}

// Get battery capacities for a specific brand
export function getBatteryCapacitiesByBrand(brand: string): string[] {
  const models = getModelsByBrand(brand);
  return Array.from(new Set(models.map(m => m.batteryCapacity)));
}
