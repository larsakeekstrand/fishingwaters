import React, { useEffect, useState } from 'react';
import Map from './components/Map';
import SpeciesFilter from './components/SpeciesFilter';
import { GeoJsonCollection } from './types/GeoJsonTypes';
import { mergeGeoJsonCollections, removeBOM, convertLakeDataToGeoJson } from './utils/DataLoader';

function App() {
  const [data, setData] = useState<GeoJsonCollection>({ type: 'FeatureCollection', features: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSpecies, setFilteredSpecies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllLakeData();
  }, []);

  const fetchAllLakeData = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch the list of files from the data directory index
      const indexResponse = await fetch('/data/index.json');
      
      let fileList: string[] = [];
      
      // If index.json exists, use it to get the list of files
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        fileList = indexData.files || [];
      }/* else {
        // Fallback to a default set of files
        // This is a limitation of client-side React - we can't list directory contents directly
        // We could manually list all expected files here as a fallback
        fileList = ['lakes.json'];
        
        // Try to detect other JSON files by making requests with common patterns
        const commonFileNames = [
          'lakes_halland.json',
          'lakes_varmland.json', 
          'lakes_dalarna.json',
          'Skåne 2025-02-11.json',
          'Halland 2025-02-11.json',
          'Nätprovfiske aggregerad data senaste fisket Halland 2025-02-11.json'
        ];
        
        for (const fileName of commonFileNames) {
          try {
            const testResponse = await fetch(`/data/${fileName}`);
            if (testResponse.ok) {
              fileList.push(fileName);
            }
          } catch (e) {
            // Ignore errors for these probing requests
          }
        }
      }*/
      
      // Then fetch each file and merge the data
      const collections: GeoJsonCollection[] = [];
      
      for (const fileName of fileList) {
        if (fileName.endsWith('.json')) {
          try {
            const response = await fetch(`/data/${fileName}`);
            if (response.ok) {
              let text = await response.text();
              
              // Remove BOM if present
              text = removeBOM(text);
              
              const jsonData = JSON.parse(text);
              
             if (Array.isArray(jsonData)) {
                // Convert raw lake data array to GeoJSON format
                console.log(`Converting raw data array from file ${fileName} to GeoJSON`);
                try {
                  const convertedData = convertLakeDataToGeoJson(jsonData);
                  collections.push(convertedData);
                  console.log(`Successfully converted ${fileName} with ${convertedData.features.length} features`);
                } catch (conversionError) {
                  console.error(`Error converting ${fileName} to GeoJSON:`, conversionError);
                }
              }
            }
          } catch (err) {
            console.error(`Error processing file ${fileName}:`, err);
          }
        }
      }
      
      // Merge all collections into one
      const mergedData = mergeGeoJsonCollections(collections);
      
      setData(mergedData);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching lake data:', err);
      setError('Failed to load lake data. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleFilterChange = (selectedSpecies: Set<string>) => {
    setFilteredSpecies(selectedSpecies);
  };

  if (isLoading) {
    return <div className="loading-container">Laddar sjödata...</div>;
  }

  if (error) {
    return <div className="error-container">{error || 'Det gick inte att ladda sjödata. Försök igen senare.'}</div>;
  }

  return (
    <div className="app">
      <Map data={data} filteredSpecies={filteredSpecies} />
      <SpeciesFilter features={data.features} onFilterChange={handleFilterChange} />
    </div>
  );
}

export default App;
