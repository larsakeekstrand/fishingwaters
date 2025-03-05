import React, { useEffect, useState } from 'react';
import Map from './components/Map';
import SpeciesFilter from './components/SpeciesFilter';
import SidePanel from './components/SidePanel';
import { GeoJsonCollection, GeoJsonFeature } from './types/GeoJsonTypes';
import { mergeGeoJsonCollections, removeBOM, convertLakeDataToGeoJson } from './utils/DataLoader';

export const BASE_PATH = process.env.PUBLIC_URL || '/fishingwaters';

function App() {
  const [data, setData] = useState<GeoJsonCollection>({ type: 'FeatureCollection', features: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredSpecies, setFilteredSpecies] = useState<Set<string>>(new Set());
  const [selectedLake, setSelectedLake] = useState<GeoJsonFeature | null>(null);

  useEffect(() => {
    fetchAllLakeData();
  }, []);

  const fetchAllLakeData = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch the list of files from the data directory index
      const indexResponse = await fetch(`${BASE_PATH}/data/index.json`);
      
      console.log('Index response status:', indexResponse.status);
      console.log('Content-Type:', indexResponse.headers.get('content-type'));

      let fileList: string[] = [];
      
      // If index.json exists, use it to get the list of files
      if (indexResponse.ok) {
        try {
          // Store the response text first
          const responseText = await indexResponse.text();
          console.log('Raw response:', responseText);
          
          // Then parse it as JSON
          const indexData = JSON.parse(responseText);
          console.log('Index data:', indexData);
          fileList = indexData.files || [];
        } catch (jsonError) {
          console.error('Error parsing index.json:', jsonError);
          setError('Invalid JSON format in index.json');
        }
      } else {
        const errorText = await indexResponse.text();
        console.error('Failed to fetch index.json:', indexResponse.status, errorText);
        setError(`Failed to load index.json (${indexResponse.status})`);
      }
      
      // Then fetch each file and merge the data
      const collections: GeoJsonCollection[] = [];
      
      for (const fileName of fileList) {
        if (fileName.endsWith('.json')) {
          try {
            const response = await fetch(`${BASE_PATH}/data/${fileName}`);
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
      <SidePanel selectedLake={selectedLake} />
      <Map
        data={data}
        filteredSpecies={filteredSpecies}
        onLakeSelect={setSelectedLake}
      />
      <SpeciesFilter features={data.features} onFilterChange={handleFilterChange} />
    </div>
  );
}

export default App;
