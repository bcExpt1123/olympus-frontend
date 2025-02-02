import ReactGA from "react-ga";

import { Environment } from "./environment/Environment/Environment";

const GA_API_KEY = Environment.getGoogleAnalyticsApiKey();

declare global {
  interface Window {
    analytics: any; // Segment.js
    gtag: any; // Google Tag Manager
  }
}

type SegmentEvent = {
  type: string;
  [key: string]: any;
};

export const trackGAEvent = (event: ReactGA.EventArgs) => {
  try {
    // Universal GA (using react-ga)
    if (GA_API_KEY && ReactGA) {
      ReactGA.event(event);
    }
  } catch (e) {
    console.log("trackGAEvent", e);
  }
};
