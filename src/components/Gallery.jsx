import { useState, useEffect } from 'react';
import './Gallery.css';

// Object mappings for property names and filter IDs
const propertyMap = {
  name: 'Title',
  alternativeHeadline: 'Original Title',
  datePublished: 'Date',
  director: 'Director',
  sameAs: 'URL',
  productionCompany: 'Production Company',
  countryOfOrigin: 'Country, Production',
  spatialCoverage: 'Country, Setting',
  temporalCoverage: 'Period',
  genre: 'Genre',
  isBasedOn: 'Literary Source',
  keywords: 'Keywords',
};

const filterMap = {
  yearFilter: 'datePublished',
  directorFilter: 'director',
  productionCompanyFilter: 'productionCompany',
  countryProductionFilter: 'countryOfOrigin',
  countrySettingFilter: 'spatialCoverage',
  periodFilter: 'temporalCoverage',
  genreFilter: 'genre',
  literarySourceFilter: 'isBasedOn',
};

function Gallery() {
  const [allMovies, setAllMovies] = useState([]);
  const [allKeywords, setAllKeywords] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [isKeywordCloudVisible, setIsKeywordCloudVisible] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch movie data on component mount
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/chmsv/Analysis-of-Medieval-Aesthetics-in-Opening-Sequence/main/source/Medieval_Movies.jsonld')
      .then((response) => response.json())
      .then((data) => {
        const movies = data['@graph'];
        setAllMovies(movies);
        setFilteredMovies(movies);

        // Extract keywords
        const keywords = new Set();
        movies.forEach((movie) => {
          if (Array.isArray(movie.keywords)) {
            movie.keywords.forEach((keyword) => {
              keyword.split(',').forEach((k) => keywords.add(k.trim()));
            });
          }
        });
        setAllKeywords(keywords);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  // Helper function to format values
  const formatValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => (item['@type'] ? item.name : item)).join(', ');
    } else if (typeof value === 'object' && value['@type']) {
      return value.name;
    }
    return value;
  };

  // Toggle dropdown
  const toggleDropdown = (filterId, event) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === filterId ? null : filterId);
  };

  // Handle filter selection
  const handleFilterSelect = (filterId, value, event) => {
    event.stopPropagation();
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[filterId]) {
        newFilters[filterId] = new Set();
      }
      if (newFilters[filterId].has(value)) {
        newFilters[filterId].delete(value);
      } else {
        newFilters[filterId].add(value);
      }
      return newFilters;
    });
  };

  // Handle keyword selection
  const handleKeywordSelect = (keyword) => {
    setSelectedKeywords(prev => {
      const newKeywords = new Set(prev);
      if (newKeywords.has(keyword)) {
        newKeywords.delete(keyword);
      } else {
        newKeywords.add(keyword);
      }
      return newKeywords;
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = allMovies;

    // Filter by dropdown selections
    Object.entries(filterMap).forEach(([filterId, property]) => {
      const selectedValues = selectedFilters[filterId];
      if (selectedValues && selectedValues.size > 0) {
        filtered = filtered.filter((movie) => {
          const movieValue = movie[property];
          return Array.isArray(movieValue)
            ? movieValue.some((v) => selectedValues.has(formatValue(v)))
            : selectedValues.has(formatValue(movieValue));
        });
      }
    });

    // Filter by selected keywords
    if (selectedKeywords.size > 0) {
      filtered = filtered.filter((movie) =>
        Array.isArray(movie.keywords) &&
        movie.keywords.some((keywordSet) =>
          keywordSet.split(',').some((k) => selectedKeywords.has(k.trim()))
        )
      );
    }

    setFilteredMovies(filtered);
    setOpenDropdown(null); // Close all dropdowns after applying filters
  };

  // Toggle keyword cloud visibility
  const toggleKeywordCloud = () => {
    setIsKeywordCloudVisible(!isKeywordCloudVisible);
  };

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          {Object.entries(filterMap).map(([filterId, property]) => (
            <div key={filterId} className="custom-dropdown">
              <div
                className="dropdown-header"
                onClick={(e) => toggleDropdown(filterId, e)}
              >
                {propertyMap[property]}
              </div>
              {['directorFilter', 'productionCompanyFilter', 'countryProductionFilter',
                'countrySettingFilter', 'literarySourceFilter'].includes(filterId)}
              <div className={`dropdown-list ${openDropdown === filterId ? 'show' : ''}`}>
                {Array.from(new Set(allMovies.map(movie => formatValue(movie[property]))))
                  .filter(Boolean)
                  .sort((a, b) => a.localeCompare(b))
                  .map(value => (
                    <div
                      key={value}
                      className={`dropdown-item ${selectedFilters[filterId]?.has(value) ? 'selected' : ''}`}
                      onClick={(e) => handleFilterSelect(filterId, value, e)}
                    >
                      {value}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="selected-filters">
          {Object.entries(selectedFilters).map(([filterId, values]) =>
            Array.from(values).map(value => (
              <div key={`${filterId}-${value}`} className="selected-filter">
                {value}
                <span
                  className="remove"
                  onClick={() => {
                    const newFilters = { ...selectedFilters };
                    newFilters[filterId].delete(value);
                    if (newFilters[filterId].size === 0) {
                      delete newFilters[filterId];
                    }
                    setSelectedFilters(newFilters);
                  }}
                >
                  &times;
                </span>
              </div>
            ))
          )}
          {Array.from(selectedKeywords).map(keyword => (
            <div key={keyword} className="selected-filter">
              {keyword}
              <span
                className="remove"
                onClick={() => handleKeywordSelect(keyword)}
              >
                &times;
              </span>
            </div>
          ))}
        </div>

        <div className="keyword-cloud-container">
          <h3
            className={`keyword-cloud-toggle ${isKeywordCloudVisible ? 'active' : ''}`}
            onClick={toggleKeywordCloud}
          >
            Keywords
            <span className="toggle-arrow">▼</span>
          </h3>
          <div className={`keyword-cloud ${!isKeywordCloudVisible ? 'hidden' : ''}`}>
            {Array.from(allKeywords).sort().map(keyword => (
              <span
                key={keyword}
                className={`keyword ${selectedKeywords.has(keyword) ? 'selected' : ''}`}
                onClick={() => handleKeywordSelect(keyword)}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <button onClick={applyFilters}>Apply filters</button>
      </div>

      <div className="gallery">
        {filteredMovies.map((movie, index) => (
          <div key={index} className="movie">
            <img
              src={movie.image}
              alt={movie.name}
              loading="lazy"
              style={{ backgroundColor: '#6e6e6e' }}
            />
            <div className="movie-info">
              {Object.entries(propertyMap).map(([prop, label]) => {
                if (movie[prop]) {
                  return (
                    <p key={prop}>
                      <strong>{label}:</strong>{' '}
                      {prop === 'sameAs' ? (
                        <a href={movie[prop]} target="_blank" rel="noopener noreferrer">
                          {movie[prop]}
                        </a>
                      ) : (
                        formatValue(movie[prop])
                      )}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;