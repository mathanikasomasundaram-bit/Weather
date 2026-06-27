import { useState } from 'react';
import './App.css';

function App() {
  // ==========================================
  // 1. LOGIN SYSTEM STATES
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // ==========================================
  // 2. WEATHER APP STATES
  // ==========================================
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [favorites, setFavorites] = useState(['New York', 'Tokyo', 'Paris']);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);

  // ⚠️ Paste your OpenWeatherMap API key here
  const API_KEY = "746f50a6e42db793e8ec425ed9183866"; 

  const popularCities = ['London', 'Mumbai', 'Sydney', 'Cairo'];

  const globalRegions = [
    { continent: "Americas", cities: ["Toronto", "Los Angeles", "São Paulo", "Vancouver"] },
    { continent: "Europe & UK", cities: ["Berlin", "Rome", "Madrid", "Reykjavik"] },
    { continent: "Asia & Pacific", cities: ["Singapore", "Seoul", "Dubai", "Auckland"] },
    { continent: "Africa", cities: ["Cape Town", "Nairobi", "Casablanca", "Lagos"] }
  ];

  // ==========================================
  // 3. HANDLERS & LOGIC
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault(); 
    if (email.includes('@') && password.length >= 6) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Please enter a valid email and a password (min 6 characters).');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setWeatherData(null); 
  };

  const fetchWeather = async (cityName) => {
    // Safely check if a specific city was passed, otherwise use the typed input
    const target = typeof cityName === 'string' ? cityName.trim() : city.trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);
    setShowGlobalMenu(false); 

    try {
      // FIX: Use encodeURIComponent to safely handle spaces and special characters in city names
      const safeCityURL = encodeURIComponent(target);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${safeCityURL}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Location not found. Try checking the spelling!`);
      }

      const data = await response.json();
      setWeatherData(data);
      setCity(''); // Clear search box on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  const isFavorite = (cityName) => {
    return favorites.some(fav => fav.toLowerCase() === cityName.toLowerCase());
  };

  const toggleFavorite = (currentCity) => {
    if (isFavorite(currentCity)) {
      setFavorites(favorites.filter(fav => fav.toLowerCase() !== currentCity.toLowerCase()));
    } else {
      setFavorites([...favorites, currentCity]);
    }
  };

  // Dynamic Background based on Weather Condition
  const getBackgroundClass = () => {
    if (!weatherData) return 'bg-default';
    
    // Safely grab the weather condition
    const condition = weatherData.weather[0]?.main?.toLowerCase() || '';
    
    if (condition.includes('clear')) return 'bg-clear';
    if (condition.includes('cloud')) return 'bg-clouds';
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) return 'bg-rain';
    if (condition.includes('snow')) return 'bg-snow';
    
    return 'bg-default';
  };

  // ==========================================
  // 4. RENDER LOGIN SCREEN (If not logged in)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="header-logo login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <h1>Global Weather</h1>
          </div>
          <p className="login-subtitle">Log in to access live atmospheric data.</p>
          
          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="status error">{loginError}</div>}
            
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="search-btn login-btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. RENDER WEATHER APP (If logged in)
  // ==========================================
  return (
    <div className="app-container">
      {/* LEFT PANEL */}
      <div className="search-section">
        <header className="app-header">
          <div className="header-top-row">
            <div className="header-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
              <h1>Global Weather</h1>
              
              <button 
                className={`plus-btn ${showGlobalMenu ? 'active' : ''}`} 
                onClick={() => setShowGlobalMenu(!showGlobalMenu)}
                title="Explore advanced world places"
              >
                +
              </button>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
          <p>Enter any city, town, or place</p>
        </header>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="e.g., Cairo, Toronto..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="search-btn" onClick={() => fetchWeather()}>Search</button>
        </div>

        {showGlobalMenu && (
          <div className="global-menu-overlay">
            <h3>Explore Regions</h3>
            {globalRegions.map((region) => (
              <div key={region.continent} className="region-block">
                <h4>{region.continent}</h4>
                <div className="city-tags">
                  {region.cities.map((c) => (
                    <button 
                      key={c} 
                      className="tag-btn global-tag"
                      onClick={() => {
                        setCity(c);
                        fetchWeather(c);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="suggestions-container">
          <p className="suggestion-title">⭐ My Saved Favorites:</p>
          <div className="city-tags">
            {favorites.length === 0 ? (
              <span className="no-favs-text">No favorites added yet.</span>
            ) : (
              favorites.map((favCity) => (
                <button 
                  key={favCity} 
                  className="tag-btn favorite-tag" 
                  onClick={() => fetchWeather(favCity)}
                >
                  ⭐ {favCity}
                </button>
              ))
            )}
          </div>
        </div>

        {!showGlobalMenu && (
          <div className="suggestions-container">
            <p className="suggestion-title">Popular Quick Searches:</p>
            <div className="city-tags">
              {popularCities.map((cityName) => (
                <button 
                  key={cityName} 
                  className="tag-btn" 
                  onClick={() => fetchWeather(cityName)}
                >
                  {cityName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Applies Dynamic Background Class Here */}
      <div className={`results-section ${getBackgroundClass()}`}>
        {!weatherData && !loading && !error && (
          <div className="empty-state">
            <p>Search a place or click a favorite to load current metrics.</p>
          </div>
        )}

        {loading && <div className="status loading">Gathering atmospheric data...</div>}
        {error && <div className="status error">⚠️ {error}</div>}
        
        {weatherData && !loading && !error && (
          <div className="weather-card">
            
            <div className="location-info-wrapper">
              <div className="location-info">
                <h2>{weatherData.name}</h2>
                <span className="country-badge">{weatherData.sys.country}</span>
              </div>
              <button 
                className={`favorite-toggle-btn ${isFavorite(weatherData.name) ? 'is-fav' : ''}`}
                onClick={() => toggleFavorite(weatherData.name)}
              >
                {isFavorite(weatherData.name) ? '★ Saved' : '☆ Favorite'}
              </button>
            </div>
            
            <div className="main-display">
              {/* FIX: Swapped back to @2x.png for absolute stability and removed glitchy loading */}
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}@2x.png`} 
                alt="Weather Condition Icon" 
                className="weather-icon"
              />
              <div className="temp-box">
                <span className="temp-num">{Math.round(weatherData.main.temp)}</span>
                <span className="temp-unit">°C</span>
              </div>
            </div>

            <p className="description">{weatherData.weather[0]?.description}</p>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Feels Like</span>
                <span className="detail-value">{Math.round(weatherData.main.feels_like)}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weatherData.main.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{weatherData.wind.speed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pressure</span>
                <span className="detail-value">{weatherData.main.pressure} hPa</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;