/**
 * Hook for tracking Google Analytics events
 * Usage: const { trackEvent } = useAnalytics();
 */

export const useAnalytics = () => {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventParams);
    }
  };

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
};
