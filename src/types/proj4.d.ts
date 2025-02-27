declare module 'proj4' {
  type Coordinates = [number, number] | [number, number, number];
  
  function proj4(fromProjection: string, toProjection: string, coordinates: Coordinates): Coordinates;
  
  namespace proj4 {
    function defs(name: string, projection: string): void;
  }
  
  export = proj4;
}
