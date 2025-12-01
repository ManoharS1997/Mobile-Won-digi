import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import haversine from "haversine-distance";
import { FetchDistanceMatrix } from "@/services/busroutesServices";

const visualWidth = 1000;

type Stop = {
  id: string | number;
  name: string;
  time: string;
  distance: number;
  lat: number;
  lng: number;
};

interface BusTrackingScreenProps {
  stops: Stop[];
  busLocation: { lat: number; lng: number };
  setVisible: (visible: boolean) => void;
  setStatus: any;
  setMessageStatus: (message: string) => void;
}

const BusTrackingScreen: React.FC<BusTrackingScreenProps> = ({
  stops,
  busLocation,
  setVisible,
  setStatus,
  setMessageStatus,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const scrollRef = useRef<ScrollView>(null);

  const [busRatio, setBusRatio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnRoute, setIsOnRoute] = useState(false);
  const [nextStopInfo, setNextStopInfo] = useState<{
    distanceText: string;
    durationText: string;
  }>({ distanceText: "", durationText: "" });

  const totalRouteDistance = stops[stops.length - 1]?.distance || 1;

  const fetchDistanceMatrix = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distanceText: string; durationText: string }> => {
    try {
      const response = await FetchDistanceMatrix({ origin, destination });
      if (response?.data?.distanceText && response?.data?.durationText) {
        return {
          distanceText: response.data.distanceText,
          durationText: response.data.durationText,
        };
      }
    } catch (err) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Something went wrong");
    }

    return { distanceText: "N/A", durationText: "N/A" };
  };

  const updateBusPosition = async () => {
    let closestSegmentIndex = 0;
    let minDistance = Infinity;
    let projectedDistance = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const a = { lat: stops[i].lat, lng: stops[i].lng };
      const b = { lat: stops[i + 1].lat, lng: stops[i + 1].lng };

      const distA = haversine(busLocation, a);
      const distB = haversine(busLocation, b);
      const segLength = haversine(a, b);
      const perpendicularDist = Math.abs(distA + distB - segLength);

      if (perpendicularDist < minDistance) {
        minDistance = perpendicularDist;
        closestSegmentIndex = i;

        const ratio = distA / (distA + distB);
        projectedDistance =
          stops[i].distance +
          (stops[i + 1].distance - stops[i].distance) * ratio;
      }
    }

    const isNearRoute = minDistance < 1000; // within 1km
    setIsOnRoute(isNearRoute);
    setLoading(false);

    if (isNearRoute) {
      const ratio = projectedDistance / totalRouteDistance;
      setBusRatio(Math.min(1, ratio));

      const nextStop = stops[closestSegmentIndex + 1];
      if (nextStop) {
        const result = await fetchDistanceMatrix(busLocation, {
          lat: nextStop.lat,
          lng: nextStop.lng,
        });
        setNextStopInfo(result);
      }
    } else {
      setBusRatio(0);
      setNextStopInfo({ distanceText: "Off Route", durationText: "-" });
    }
  };

  // Bus position + ETA calculation
  useEffect(() => {
    if (!busLocation.lat || !busLocation.lng || !stops.length) return;
    updateBusPosition();
  }, [busLocation, stops]);

  // Scroll position auto-alignment
  useEffect(() => {
    const xOffset = visualWidth * busRatio - screenWidth / 2 + 50;
    scrollRef.current?.scrollTo({ x: Math.max(0, xOffset), animated: true });
  }, [busRatio, screenWidth]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={24} color="#026902" />
        <Text style={styles.loadingText}>Fetching route...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.routeLineContainer}>
          <View style={styles.mainRouteLine} />
          {stops.map((stop) => (
            <View
              key={stop.id}
              style={[
                styles.stopMarkerContainer,
                {
                  left: visualWidth * (stop.distance / totalRouteDistance),
                },
              ]}
            >
              <View style={styles.stopCircle} />
              <Text style={styles.stopNameText}>{stop.name}</Text>
              <Text style={styles.stopMetaText}>{stop.time}</Text>
              <Text style={styles.stopMetaText}>{stop.distance} km</Text>
            </View>
          ))}
          <View
            style={[styles.busIconContainer, { left: visualWidth * busRatio }]}
          >
            <FontAwesome5 name="bus" size={24} color="#facc15" />
          </View>
        </View>
      </ScrollView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Bus Status:{" "}
          <Text
            style={{
              fontWeight: "bold",
              color: isOnRoute ? "#22c55e" : "#ef4444",
            }}
          >
            {isOnRoute ? "On Route" : "Off Route"}
          </Text>
        </Text>
        <Text style={styles.infoText}>
          GPS: {busLocation.lat.toFixed(4)}, {busLocation.lng.toFixed(4)}
        </Text>
        <Text style={styles.infoText}>
          Progress: {(busRatio * 100).toFixed(2)}%
        </Text>
        <Text style={styles.infoText}>
          Next Stop ETA: {nextStopInfo.durationText} (
          {nextStopInfo.distanceText})
        </Text>
      </View>
    </View>
  );
};

export default BusTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#374151",
  },
  scrollContent: {
    paddingHorizontal: 40,
  },
  routeLineContainer: {
    width: visualWidth,
    height: "auto",
    minHeight: 140,
    position: "relative",
    justifyContent: "center",
  },
  mainRouteLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#9ca3af",
    left: 0,
    right: 0,
    top: 40,
    borderRadius: 2,
  },
  stopMarkerContainer: {
    position: "absolute",
    top: 30,
    width: 80,
    alignItems: "center",
    marginLeft: -40,
    height: "auto",
  },
  stopCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderColor: "#166534",
    borderWidth: 1,
  },
  stopNameText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "bold",
    color: "#4b5563",
  },
  stopMetaText: {
    fontSize: 10,
    textAlign: "center",
    color: "#6b7280",
  },
  busIconContainer: {
    position: "absolute",
    top: 15,
    marginLeft: -12,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
});
