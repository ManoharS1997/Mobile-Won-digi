import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import Images from "@/constant/Images";
import haversine from "haversine-distance";
import {
  FetchRoutePolyline,
  UpdateDistanceData,
} from "@/services/busroutesServices";

const assumedSpeedKmph = 35;

type Stop = {
  id: string | number;
  name: string;
  time: string;
  distance: number;
  lat: number;
  lng: number;
};

interface Props {
  stops: Stop[];
  busLocation: { lat: number; lng: number };
  activeTab: string;
  setVisible: (visible: boolean) => void;
  setStatus: any;
  setMessageStatus: (message: string) => void;
}

const TrackBusScreen: React.FC<Props> = ({
  stops,
  busLocation,
  activeTab,
  setVisible,
  setStatus,
  setMessageStatus,
}) => {
  const [nextStopIndex, setNextStopIndex] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState(0);
  const [etaToNext, setEtaToNext] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalEta, setTotalEta] = useState(0);
  const [polylineCoordinates, setPolylineCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const isValidBusLocation = busLocation.lat !== 0 && busLocation.lng !== 0;
  const nextStop = stops[nextStopIndex + 1];

  const region = useMemo(() => {
    const allLats = stops.map((s) => s.lat).concat(busLocation.lat);
    const allLngs = stops.map((s) => s.lng).concat(busLocation.lng);
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 0.01,
      longitudeDelta: (maxLng - minLng) * 1.5 || 0.01,
    };
  }, [stops, busLocation]);

  const calculateDistance = (from: any, to: any) => haversine(from, to) / 1000;

  const getETA = (distanceKm: number) =>
    Math.ceil((distanceKm / assumedSpeedKmph) * 60);

  const decodePolyline = (encoded: string) => {
    let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [];

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return coordinates;
  };

  const fetchRoutePolyline = async () => {
    if (stops.length < 2) return;

    try {
      const res = await FetchRoutePolyline({ stops });
      if (res.data.polyline) {
        const points = decodePolyline(res.data.polyline);
        setPolylineCoordinates(points);
      }
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Something went wrong");
    }
  };

  const updateDistanceData = async () => {
    if (!nextStop || !isValidBusLocation) return;

    const distToNext = calculateDistance(busLocation, {
      lat: nextStop.lat,
      lng: nextStop.lng,
    });

    setDistanceToNext(distToNext);
    setEtaToNext(getETA(distToNext));

    if (distToNext < 0.15) {
      setNextStopIndex((prev) => prev + 1);
    }

    const remainingStops = stops.slice(nextStopIndex + 1);
    if (!remainingStops.length) return;

    try {
      const res = await UpdateDistanceData({
        busLocation,
        remainingStops,
      });

      if (res.data.distanceKm && res.data.durationMin) {
        setTotalDistance(res.data.distanceKm);
        setTotalEta(res.data.durationMin);
      }
    } catch (err) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Something went wrong");
    }
  };

  useEffect(() => {
    fetchRoutePolyline();
    updateDistanceData();
  }, [stops, busLocation, activeTab]);

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${busLocation.lat},${busLocation.lng}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        {nextStop && (
          <>
            <Text style={styles.infoText}>
              Next Stop: <Text style={styles.bold}>{nextStop.name}</Text>
            </Text>
            <Text style={styles.infoText}>
              Distance:{" "}
              <Text style={styles.bold}>{distanceToNext.toFixed(2)} km</Text> |
              ETA: <Text style={styles.bold}>{etaToNext} min</Text>
            </Text>
          </>
        )}
        <Text style={styles.infoText}>
          Final ETA: <Text style={styles.bold}>{Math.ceil(totalEta)} min</Text>{" "}
          | Total Distance:{" "}
          <Text style={styles.bold}>{totalDistance.toFixed(2)} km</Text>
        </Text>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
      >
        {isValidBusLocation && (
          <Marker
            coordinate={{
              latitude: busLocation.lat,
              longitude: busLocation.lng,
            }}
            title="Live Bus Location"
          >
            <Image
              source={Images.busstop}
              style={{ width: 40, height: 40, resizeMode: "contain" }}
            />
          </Marker>
        )}

        {stops.map((stop, index) => {
          const dist = calculateDistance(busLocation, {
            lat: stop.lat,
            lng: stop.lng,
          });
          const eta = getETA(dist);

          const pinColor =
            index < nextStopIndex
              ? "green"
              : index === nextStopIndex + 1
              ? "orange"
              : "blue";

          return (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              title={stop.name}
              description={`ETA: ${eta} min | ${dist.toFixed(2)} km | ${
                stop.time
              } | ${stop.distance} km`}
              pinColor={pinColor}
            />
          );
        })}

        {polylineCoordinates.length > 0 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#4285F4"
            strokeWidth={4}
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
        <Ionicons name="navigate" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default TrackBusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height * 0.65,
  },
  mapButton: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#026902",
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    margin: 10,
    elevation: 3,
    zIndex: 999,
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
    color: "#026902",
  },
});
