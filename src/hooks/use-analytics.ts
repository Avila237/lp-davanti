/**
 * Hook for tracking events via Google Tag Manager
 * Usage: const { trackEvent } = useAnalytics();
 */

export const useAnalytics = () => {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: url,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
};
