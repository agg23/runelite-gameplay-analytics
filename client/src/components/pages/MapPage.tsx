import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import leaflet from "leaflet";
import "leaflet.motion/dist/leaflet.motion.min";
import { Position } from "../../map/external/Position";

import MarkerSVG from "../../map/icons/marker.svg";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrevious } from "../../hooks/usePrevious";
import { useMapQuery } from "../../api/hooks/useDatatypeQuery";

// TODO: All of this is very hacky just to see it working. It needs to be cleaned up
export const MapPage: React.FC<{}> = () => {
  const [animate, setAnimate] = useState(false);

  const query = useMapQuery();

  return (
    <div style={{ height: "100%" }}>
      <button onClick={() => setAnimate((state) => !state)}>
        Toggle playback
      </button>
      <MapContainer center={[-79, -137]} zoom={7} zoomControl={false}>
        <TileLayer
          url="https://raw.githubusercontent.com/Explv/osrs_map_tiles/master/0/{z}/{x}/{y}.png"
          minZoom={4}
          maxZoom={11}
          tms
          noWrap
        />
        <SubComponent />
        {query.isSuccess && <MapRoute events={query.data} play={animate} />}
      </MapContainer>
    </div>
  );
};

const position = new Position(2791, 3477, 0);

const icon = leaflet.icon({
  iconUrl: MarkerSVG,
  iconSize: [50, 50],
  className: "mapMarker",
});

// Any points outside of these bounds are considered errors and discarded
const maxBound = { x: 4000, y: 2500 };
const minBound = { x: 1000, y: 6200 };

const SubComponent = () => {
  const map = useMap();

  return <Marker position={position.toLatLng(map)} icon={icon} />;
};

const MapRoute = ({ events, play }: { events: any[]; play: boolean }) => {
  const map = useMap();

  const polylineRef = useRef<any>();

  const positions = useMemo(() => {
    return events
      .filter(
        (event) =>
          event.x < maxBound.x &&
          event.y > maxBound.y &&
          event.x > minBound.x &&
          event.y < minBound.y
      )
      .map((event) => {
        return Position.toLatLng(map, event.x, event.y);
      });
  }, [events, map]);

  const createPolyline = useCallback(() => {
    polylineRef.current = new (leaflet as any).Motion.Polyline(
      positions,
      {},
      { auto: true, speed: 100000 }
    ).addTo(map);
  }, [positions, map]);

  // useEffect(() => {
  //   createPolyline();
  //   // new leaflet.Polyline(positions).addTo(map);
  // }, [createPolyline]);

  const previousPlay = usePrevious(play);

  useEffect(() => {
    console.log("Triggered");
    if (play === previousPlay || previousPlay === undefined) {
      return;
    }

    console.log("Toggling");

    if (play) {
      if (!polylineRef.current) {
        createPolyline();
      } else {
        polylineRef.current.motionStart();
      }
    } else if (!!polylineRef.current) {
      polylineRef.current.motionStop();
    }
  }, [play, previousPlay, createPolyline]);

  // return <Polyline positions={positions} />;
  return null;
};
