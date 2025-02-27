import proj4 from 'proj4';

// Define the SWEREF99 projection
proj4.defs('SWEREF99TM', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

/**
 * Converts SWEREF99 coordinates to WGS84 (latitude/longitude) format used by GeoJSON
 * @param sweref99N Northing coordinate in SWEREF99 format
 * @param sweref99E Easting coordinate in SWEREF99 format
 * @returns [longitude, latitude] coordinates in WGS84 format
 */
export const swerefToWgs84 = (
  sweref99N: number,
  sweref99E: number
): [number, number] => {
  const result = proj4('SWEREF99TM', 'WGS84', [sweref99E, sweref99N]);
  // GeoJSON uses [longitude, latitude] format
  return [result[0], result[1]];
};

/**
 * Checks if the coordinates are valid SWEREF99 coordinates
 * @param sweref99N Northing coordinate in SWEREF99 format
 * @param sweref99E Easting coordinate in SWEREF99 format
 * @returns boolean indicating if coordinates are valid
 */
export const isValidSwerefCoordinates = (
  sweref99N: number | null | undefined,
  sweref99E: number | null | undefined
): boolean => {
  return (
    sweref99N !== null &&
    sweref99N !== undefined &&
    sweref99E !== null &&
    sweref99E !== undefined &&
    !isNaN(sweref99N) &&
    !isNaN(sweref99E)
  );
};
