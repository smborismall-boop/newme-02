import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsAPI } from '../services/api';

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Generate or get session ID
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('visitor_session_id', sessionId);
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await analyticsAPI.trackPageview(location.pathname, sessionId);
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.debug('Analytics tracking failed');
      }
    };

    trackPageView();
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default VisitorTracker;
