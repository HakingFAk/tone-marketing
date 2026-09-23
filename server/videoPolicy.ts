export function shouldPublishVideo(kind: "demo" | "client", consentConfirmed: boolean, requestedPublished: boolean) {
  return requestedPublished && (kind === "demo" || consentConfirmed);
}
