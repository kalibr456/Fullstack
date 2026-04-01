import React, { useEffect, useState } from 'react';
import api from '../api';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    api.get('/external/weather').then(res => setWeather(res.data)).catch(() => setWeather(null));
  }, []);

  if (!weather) return null;

  return (
    <div style={{ background: '#eff6ff', padding: '10px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '20px', border: '1px solid #dbeafe' }}>
      <img src={`http://openweathermap.org/img/wn/${weather.icon}.png`} alt="icon" style={{width: '40px'}} />
      <span style={{fontWeight: 600}}>{weather.temp}°C в г. {weather.city} ({weather.desc})</span>
    </div>
  );
};
export default WeatherWidget;