import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

interface RoutingMachineProps {
  startPoint: L.LatLng | null;
  endPoint: L.LatLng | null;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ startPoint, endPoint }) => {
  const map = useMap();

  useEffect(() => {
    if (!startPoint || !endPoint) return;

    // Create a routing control
    const routingControl = L.Routing.control({
      waypoints: [
        startPoint,
        endPoint
      ],
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: '#6FA1EC', weight: 4 }
        ]
      },
      altLineOptions: {
        styles: [
          { color: '#9BB8E8', weight: 3 }
        ]
      }
    }).addTo(map);

    // Clean up on unmount
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, startPoint, endPoint]);

  return null;
};

export default RoutingMachine;
