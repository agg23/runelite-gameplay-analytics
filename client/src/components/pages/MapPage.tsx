import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import leaflet from "leaflet";
import { Position } from "../../map/external/Position";

import MarkerSVG from "../../map/icons/marker.svg";

//[-79, -137]
export const MapPage: React.FC<{}> = () => {
  return (
    <>
      <MapContainer center={[-79, -137]} zoom={7} zoomControl={false}>
        <TileLayer
          url="https://raw.githubusercontent.com/Explv/osrs_map_tiles/master/0/{z}/{x}/{y}.png"
          minZoom={4}
          maxZoom={11}
          tms
          noWrap
        />
        <SubComponent />
      </MapContainer>
    </>
  );
};

const position = new Position(2791, 3477, 0);

const icon = leaflet.icon({
  iconUrl: MarkerSVG,
  iconSize: [50, 50],
  className: "mapMarker",
});

const SubComponent = () => {
  const map = useMap();

  return <Marker position={position.toLatLng(map)} icon={icon} />;
};
