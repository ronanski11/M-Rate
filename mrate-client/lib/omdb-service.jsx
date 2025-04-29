// mrate-client/lib/omdb-service.js

/**
 * A service for fetching data from OMDB API with client-side caching
 * Uses localStorage to cache responses and reduce API calls
 */

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_PREFIX = "omdb_cache_";

/**
 * Fetches a movie by IMDB ID with caching
 * @param {string} imdbId - The IMDB ID to fetch
 * @param {boolean} [forceRefresh=false] - Force a refresh from the API
 * @returns {Promise<Object>} - The movie data
 */
export async function fetchMovieById(imdbId, forceRefresh = false) {
  if (!imdbId) {
    throw new Error("IMDB ID is required");
  }

  // Check cache first if not forcing a refresh
  if (!forceRefresh) {
    const cachedData = getFromCache(`movie_${imdbId}`);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OMDB;
    if (!apiKey) {
      throw new Error("OMDB API key is not configured");
    }

    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch movie: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
      throw new Error(data.Error || "Movie not found");
    }

    // Save to cache
    saveToCache(`movie_${imdbId}`, data);
    return data;
  } catch (error) {
    console.error("Error fetching movie:", error);
    throw error;
  }
}

/**
 * Searches movies by title with caching
 * @param {string} query - The search query
 * @param {boolean} [forceRefresh=false] - Force a refresh from the API
 * @returns {Promise<Object>} - The search results
 */
export async function searchMovies(query, forceRefresh = false) {
  if (!query || query.trim() === "") {
    return { Search: [] };
  }

  // Normalize the query to ensure consistent caching
  const normalizedQuery = query.trim().toLowerCase();

  // Check cache first if not forcing a refresh
  if (!forceRefresh) {
    const cachedData = getFromCache(`search_${normalizedQuery}`);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OMDB;
    if (!apiKey) {
      throw new Error("OMDB API key is not configured");
    }

    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(
        normalizedQuery
      )}&type=movie&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Network response was not OK: ${response.status}`);
    }

    const data = await response.json();

    // Save to cache only if successful
    if (data.Response === "True" && data.Search) {
      saveToCache(`search_${normalizedQuery}`, data);
    }

    return data;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
}

/**
 * Saves data to localStorage with timestamp for expiry checking
 * @param {string} key - The cache key
 * @param {Object} data - The data to cache
 */
function saveToCache(key, data) {
  try {
    if (typeof window === "undefined") return;

    const cacheItem = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error("Error saving to cache:", error);
    // If localStorage is full, clear it and try again
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      clearOldCache();
      try {
        const cacheItem = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
      } catch (retryError) {
        console.error("Error saving to cache after cleanup:", retryError);
      }
    }
  }
}

/**
 * Gets data from localStorage if it exists and hasn't expired
 * @param {string} key - The cache key
 * @returns {Object|null} - The cached data or null
 */
function getFromCache(key) {
  try {
    if (typeof window === "undefined") return null;

    const cachedItem = localStorage.getItem(CACHE_PREFIX + key);

    if (!cachedItem) return null;

    const { data, timestamp } = JSON.parse(cachedItem);

    // Check if the cache has expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error retrieving from cache:", error);
    return null;
  }
}

/**
 * Clears old cache entries to free up space
 */
function clearOldCache() {
  try {
    if (typeof window === "undefined") return;

    const now = Date.now();

    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Only process our cache keys
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cachedItem = JSON.parse(localStorage.getItem(key));

          // Remove if older than expiry time or if JSON parsing fails
          if (
            !cachedItem ||
            !cachedItem.timestamp ||
            now - cachedItem.timestamp > CACHE_EXPIRY
          ) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // If the item can't be parsed, remove it
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("Error clearing old cache:", error);
  }
}

/**
 * Clears all OMDB-related cache
 */
export function clearCache() {
  try {
    if (typeof window === "undefined") return;

    // Get all keys from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    return keysToRemove.length;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return 0;
  }
}
