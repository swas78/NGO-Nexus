"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_CENTER, MAP_ZOOM } from "@/lib/constants";
import type { Need, Volunteer } from "@/types";

/* ═══════════════════════════════════════════
   Custom Glowing Marker Icons
   ═══════════════════════════════════════════ */

function createGlowIcon(color: string, size: number = 28): L.DivIcon {
  const shadow = color === "#ef4444" ? "rgba(239,68,68,0.5)" : color === "#f97316" ? "rgba(249,115,22,0.4)" : color === "#eab308" ? "rgba(234,179,8,0.35)" : "rgba(59,130,246,0.4)";
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
    html: `
      <div style="
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color};
        box-shadow:0 0 12px 4px ${shadow}, 0 0 30px 8px ${shadow};
        border:2px solid rgba(255,255,255,0.3);
        display:flex;align-items:center;justify-content:center;
        transition: transform 0.2s ease;
        cursor:pointer;
      ">
        <div style="width:${size * 0.35}px;height:${size * 0.35}px;border-radius:50%;background:rgba(255,255,255,0.6);"></div>
      </div>
    `,
  });
}

function createVolunteerIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
    html: `
      <div style="
        width:24px;height:24px;
        border-radius:50%;
        background:#3b82f6;
        box-shadow:0 0 10px 3px rgba(59,130,246,0.4), 0 0 25px 6px rgba(59,130,246,0.15);
        border:2px solid rgba(255,255,255,0.4);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    `,
  });
}

const urgencyColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#10b981",
};

const urgencyRadii: Record<string, number> = {
  critical: 8000,
  high: 6000,
  medium: 4000,
  low: 2000,
};

// Cluster Icon Function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = function (cluster: any) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 20 ? 44 : 52;
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.8);
        border: 2px solid rgba(255, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${count < 10 ? 14 : 16}px;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255,255,255,0.3);
      ">
        ${count}
      </div>`,
    className: "custom-marker-cluster",
    iconSize: L.point(size, size, true),
  });
};

/* ═══════════════════════════════════════════
   Helper: find nearby volunteers for a need
   ═══════════════════════════════════════════ */
function findNearbyVolunteers(need: Need, volunteers: Volunteer[], maxKm: number = 30): (Volunteer & { distKm: number })[] {
  return volunteers
    .map((vol) => {
      const dLat = need.location.lat - vol.location.lat;
      const dLng = need.location.lng - vol.location.lng;
      const distKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111);
      return { ...vol, distKm };
    })
    .filter((v) => v.distKm <= maxKm)
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 3);
}

/* ═══════════════════════════════════════════
   Smooth Fly-To on Selection
   ═══════════════════════════════════════════ */
function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

/* ═══════════════════════════════════════════
   Main Map View Component
   ═══════════════════════════════════════════ */
interface MapViewProps {
  needs: Need[];
  volunteers: Volunteer[];
  showNeeds: boolean;
  showVolunteers: boolean;
  showHeatZones: boolean;
  showRoutes: boolean;
  selectedNeed: Need | null;
  onSelectNeed: (need: Need | null) => void;
  onAssign: (needId: string, volId: string) => void;
}

export function MapView({ needs, volunteers, showNeeds, showVolunteers, showHeatZones, showRoutes, selectedNeed, onSelectNeed, onAssign }: MapViewProps) {
  const [assignedPairs, setAssignedPairs] = useState<Record<string, string[]>>({});

  const needIcons = useMemo(() => {
    const icons: Record<string, L.DivIcon> = {};
    needs.forEach((n) => {
      icons[n.id] = createGlowIcon(urgencyColors[n.urgency] || urgencyColors.low, n.urgency === "critical" ? 32 : 28);
    });
    return icons;
  }, [needs]);

  const volIcon = useMemo(() => createVolunteerIcon(), []);

  const nearbyVols = useMemo(() => {
    if (!selectedNeed) return [];
    return findNearbyVolunteers(selectedNeed, volunteers);
  }, [selectedNeed, volunteers]);

  const handleAssign = useCallback((needId: string, volId: string) => {
    setAssignedPairs((prev) => ({
      ...prev,
      [needId]: [...(prev[needId] || []), volId],
    }));
    onAssign(needId, volId);
  }, [onAssign]);

  const flyTarget: [number, number] | null = selectedNeed ? [selectedNeed.location.lat, selectedNeed.location.lng] : null;

  return (
    <MapContainer
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={MAP_ZOOM}
      className="h-full w-full rounded-2xl"
      style={{ background: "#0a0a0f" }}
      zoomAnimation={true}
      markerZoomAnimation={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {flyTarget && <FlyTo center={flyTarget} zoom={13} />}

      {/* ── Urgency Heat Zones ── */}
      {showHeatZones && showNeeds && needs.map((need) => (
        <Circle
          key={`zone-${need.id}`}
          center={[need.location.lat, need.location.lng]}
          radius={urgencyRadii[need.urgency] || urgencyRadii.low}
          pathOptions={{
            color: urgencyColors[need.urgency] || urgencyColors.low,
            fillColor: urgencyColors[need.urgency] || urgencyColors.low,
            fillOpacity: 0.06,
            weight: 1,
            opacity: 0.2,
          }}
        />
      ))}

      {/* ── Route Lines (selected need → nearby volunteers) ── */}
      {showRoutes && selectedNeed && nearbyVols.map((vol, i) => (
        <Polyline
          key={`route-${vol.id}`}
          positions={[
            [selectedNeed.location.lat, selectedNeed.location.lng],
            [vol.location.lat, vol.location.lng],
          ]}
          pathOptions={{
            color: i === 0 ? "#10b981" : i === 1 ? "#3b82f6" : "#8b5cf6",
            weight: 2,
            opacity: 0.5,
            dashArray: "8 6",
          }}
        />
      ))}

      {/* ── Need Markers (Clustered) ── */}
      {showNeeds && (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={40}
        >
          {needs.map((need) => (
            <Marker
              key={need.id}
              position={[need.location.lat, need.location.lng]}
              icon={needIcons[need.id]}
              eventHandlers={{ click: () => onSelectNeed(need) }}
            >
              <Popup maxWidth={320} minWidth={280}>
                <div style={{ fontFamily: "Inter, sans-serif", padding: "4px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>{need.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      backgroundColor: (urgencyColors[need.urgency] || urgencyColors.low) + "25",
                      color: urgencyColors[need.urgency] || urgencyColors.low,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>{need.urgency}</span>
                  </div>

                  <p style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>{need.location.address}</p>
                  <p style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>{need.quantity} people affected · {need.status}</p>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666", marginBottom: 3 }}>
                      <span>Fulfillment</span>
                      <span>{Math.round((need.fulfilledQuantity / (need.quantity || 1)) * 100)}%</span>
                    </div>
                    <div style={{ width: "100%", height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                      <div style={{ width: `${(need.fulfilledQuantity / (need.quantity || 1)) * 100}%`, height: 4, backgroundColor: urgencyColors[need.urgency] || urgencyColors.low, borderRadius: 2, opacity: 0.8 }} />
                    </div>
                  </div>

                  {/* Nearby Volunteers */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8, marginTop: 4 }}>
                    <p style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Nearby Volunteers</p>
                    {findNearbyVolunteers(need, volunteers).map((vol) => {
                      const isAssigned = assignedPairs[need.id]?.includes(vol.id) || need.assignedVolunteers?.includes(vol.id);
                      return (
                        <div key={vol.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <div>
                            <span style={{ fontSize: 12, color: "#ccc", fontWeight: 500 }}>{vol.name}</span>
                            <span style={{ fontSize: 10, color: "#666", marginLeft: 6 }}>{vol.distKm} km</span>
                          </div>
                          <button
                            onClick={() => handleAssign(need.id, vol.id)}
                            disabled={isAssigned}
                            style={{
                              fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 6, border: "none", cursor: isAssigned ? "default" : "pointer",
                              backgroundColor: isAssigned ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.8)",
                              color: isAssigned ? "#10b981" : "white",
                            }}
                          >
                            {isAssigned ? "✓ Assigned" : "Assign"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* ── Volunteer Markers (Clustered) ── */}
      {showVolunteers && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(59, 130, 246, 0.8); border: 2px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);">${count}</div>`,
              className: "custom-marker-cluster-vols",
              iconSize: L.point(30, 30, true),
            });
          }}
        >
          {volunteers.map((vol) => (
            <Marker key={vol.id} position={[vol.location.lat, vol.location.lng]} icon={volIcon}>
              <Popup maxWidth={260}>
                <div style={{ fontFamily: "Inter, sans-serif", padding: "4px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 12, fontWeight: 700 }}>
                      {vol.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#eee" }}>{vol.name}</p>
                      <p style={{ fontSize: 10, color: "#888" }}>{vol.location.address}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
                    {vol.skills.map((s) => (
                      <span key={s} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.15)" }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
                    <span>★ {vol.rating}</span>
                    <span>{vol.totalHours}h logged</span>
                    <span style={{ color: vol.availability === "available" ? "#10b981" : vol.availability === "busy" ? "#f59e0b" : "#71717a", textTransform: "capitalize" }}>{vol.availability}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
