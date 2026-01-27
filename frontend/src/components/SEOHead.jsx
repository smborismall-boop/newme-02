import { useEffect, useState } from 'react';
import { settingsAPI } from '../services/api';

const SEOHead = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.get();
        setSettings(response.data);
        
        // Apply SEO settings
        if (response.data) {
          // Update document title
          if (response.data.siteTitle) {
            document.title = response.data.siteTitle;
          }
          
          // Update meta description
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = response.data.seoMetaDescription || response.data.siteDescription || '';
          
          // Update keywords
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = response.data.seoKeywords || '';
          
          // Update favicon
          if (response.data.faviconUrl) {
            let favicon = document.querySelector('link[rel="icon"]');
            if (!favicon) {
              favicon = document.createElement('link');
              favicon.rel = 'icon';
              document.head.appendChild(favicon);
            }
            favicon.href = response.data.faviconUrl;
          }
          
          // Add Google Analytics
          if (response.data.googleAnalyticsId) {
            const gaId = response.data.googleAnalyticsId;
            if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
              const gtagScript = document.createElement('script');
              gtagScript.async = true;
              gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
              document.head.appendChild(gtagScript);
              
              const gtagInit = document.createElement('script');
              gtagInit.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `;
              document.head.appendChild(gtagInit);
            }
          }
          
          // Add Facebook Pixel
          if (response.data.facebookPixelId) {
            const fbId = response.data.facebookPixelId;
            if (!document.querySelector('script[data-fb-pixel]')) {
              const fbScript = document.createElement('script');
              fbScript.setAttribute('data-fb-pixel', 'true');
              fbScript.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbId}');
                fbq('track', 'PageView');
              `;
              document.head.appendChild(fbScript);
            }
          }
          
          // Apply theme colors as CSS variables
          if (response.data.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', response.data.primaryColor);
          }
          if (response.data.secondaryColor) {
            document.documentElement.style.setProperty('--secondary-color', response.data.secondaryColor);
          }
          if (response.data.backgroundColor) {
            document.documentElement.style.setProperty('--background-color', response.data.backgroundColor);
          }
        }
      } catch (error) {
        console.debug('Failed to load SEO settings');
      }
    };

    loadSettings();
  }, []);

  return null; // This component doesn't render anything
};

export default SEOHead;
