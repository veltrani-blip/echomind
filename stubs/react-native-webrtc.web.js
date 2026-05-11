// Stub web para react-native-webrtc.
// No browser, RTCPeerConnection, MediaStream etc. já existem como globais nativos.
// RTCView não existe no web — o áudio é tocado via elemento <audio> do DOM.

import React from "react";

export const RTCPeerConnection =
  globalThis.RTCPeerConnection ?? class RTCPeerConnection {};
export const RTCSessionDescription =
  globalThis.RTCSessionDescription ?? class RTCSessionDescription {};
export const RTCIceCandidate =
  globalThis.RTCIceCandidate ?? class RTCIceCandidate {};
export const MediaStream =
  globalThis.MediaStream ?? class MediaStream {};
export const mediaDevices =
  globalThis.navigator?.mediaDevices ?? {};

// Componente vazio — no web o stream de áudio é gerenciado via <audio> element
export function RTCView() { return null; }
export function RTCPIPView() { return null; }

export default {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
  mediaDevices,
  RTCView,
  RTCPIPView,
};
