import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  noindex?: boolean;
}

const SEO = ({ title, description, noindex }: SEOProps) => {
  // Данные JSON-LD для поисковиков (Пункт 3.4)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SportCenter",
    "description": description,
    "applicationCategory": "FitnessApplication",
    "operatingSystem": "All"
  };

  return (
    <Helmet>
      <title>{title} | SportCenter</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={window.location.href} />
      
      {/* Скрипт структурированных данных */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;