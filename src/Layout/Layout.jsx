import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Layout.css";
import data from "../../data.json";
import forecast from "../../data.forcast.json";

export default function Layout() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null || data);
  const [forecastData, setForecastData] = useState(null || forecast);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const unsplashApiKey = import.meta.env.VITE_UNSPLASH_ACCESSKEY;
  const weatherBaseUrl = import.meta.env.VITE_BASE_URL;
  const unsplashBaseUrl = import.meta.env.VITE_UNSPLASH_BASE_URL;

  // Fetch weather and image
  const fetchWeatherAndImage = async (searchCity) => {
    if (!searchCity) return;

    setLoading(true); // Start loading

    try {
      // Fetch Weather Data
      const weatherResponse = await axios.get(
        `${weatherBaseUrl}/weather?q=${searchCity}&appid=${weatherApiKey}&units=metric`
      );
      setWeatherData(weatherResponse.data);

      // Fetch Forecast Data
      const forecastResponse = await axios.get(
        `${weatherBaseUrl}/forecast?q=${searchCity}&appid=${weatherApiKey}&units=metric`
      );
      setForecastData(forecastResponse.data);

      // Fetch Unsplash Image
      const imageResponse = await axios.get(
        `${unsplashBaseUrl}?query=${searchCity}&client_id=${unsplashApiKey}`
      );

      if (imageResponse.data.results.length > 0) {
        setImageUrl(imageResponse.data.results[0].urls.regular);
      } else {
        setImageUrl(""); // No image found
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("City not found. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch location-based weather
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);

        try {
          const response = await axios.get(
            `${weatherBaseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`
          );
          setCity(response.data.name);
          fetchWeatherAndImage(response.data.name);
        } catch (error) {
          console.error("Error fetching location data:", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Location access denied. Please search manually.");
      }
    );
  }, []);

  return (
    <div className="container">
      <p className="title">
        Welcome to <span>Weather Forecast</span>
      </p>

      <div className="d-flex">
        <input
          type="text"
          placeholder="Search your city..."
          className="search-input"
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          className="search-btn"
          onClick={() => fetchWeatherAndImage(city)}
        >
          Search
        </button>
      </div>

      {/* Show Spinner when loading */}
      {loading && <div className="spinner"></div>}

      {!loading && weatherData && (
        <>
          <div className="weather-container">
            {/* Weather Info */}
            <div className="weather-card">
              <h2>
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <p className="align-center">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                  alt="Weather icon"
                />
                {weatherData.weather[0].main} -{" "}
                {weatherData.weather[0].description}
              </p>
              <p className="align-center">
                <span className="material-symbols-outlined">thermometer</span>
                {weatherData.main.temp}°C
              </p>
              <p className="align-center">
                <span className="material-symbols-outlined">air</span>
                {weatherData.wind.speed} m/s
              </p>
              <p className="align-center">
                <span className="material-symbols-outlined">light_mode</span>
                {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}
              </p>
              <p className="align-center">
                <span className="material-symbols-outlined">nightlight</span>
                {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}
              </p>
            </div>

            {/* City Image */}
            <div className="weather-image">
              <img
                src={imageUrl || "https://placehold.co/600x400?text=No+Image"}
                alt={city}
              />
            </div>
          </div>

          {/* Forecast Section */}
          {forecastData && (
            <div className="weather-forecast">
              <h2>5-Day Forecast</h2>
              <div className="forecast-container">
                {forecastData.list.slice(0, 5).map((forecast, index) => (
                  <div key={index} className="forecast-card">
                    <p>{new Date(forecast.dt_txt).toLocaleDateString()}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                      alt="Weather icon"
                    />
                    <p>{forecast.main.temp}°C</p>
                    <p>{forecast.weather[0].description}</p>
                    <p>{forecast.wind.speed}m/s</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
