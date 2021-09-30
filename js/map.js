var interactiveMap = {
  token: null,
  map: null,
  popup: null,
  getToken: function() {
    var scope = this;
    fetch('/api/getToken.js', {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
				  'Content-Type': 'application/json',
				  'cache-control': 'no-cache'
				}
			}).then(function(response) {
         response.json().then(function(token) {
           scope.token = token;
           scope.initializeMap();
         });
      }).catch(function(error) {
        console.log(error);
      });
  },
  initializeMap: function() {
    mapboxgl.accessToken = this.token;
    /*
      Style created with MapBox Studio with filters applied to country boundaries
      to highlight country borders with region colors.
    */
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/thaddeusmccleary/cku2oy4o30czo17s1twoies5a',
      center: [5, 17],
      zoom: 1
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    controller.initializeListeners();
  },
  addCountryFilter: function(region, color) {
    // applies additional filter dynamically to style the fill color for countries
    if (region !== '') {
        this.map.setFilter('country-boundaries', [
          "in",
          "iso_3166_1_alpha_3",
          ...region
        ]);
    } else {
      this.map.setFilter('country-boundaries', null);
    }

    view.highlightRegion(color);
  }
};

var controller = {
  initializeListeners: function() {
    interactiveMap.map.on("click", "country-boundaries", this.handleMapClick);
    this.adjustZoom();
  },
  resetMap: function() {
    interactiveMap.highlightedRegion = '';
    interactiveMap.addCountryFilter('', '#FFFFFF');
  },
  adjustZoom: function() {
    var mq = window.matchMedia( "(min-width: 599px)" );

    if (mq.matches){
        interactiveMap.map.setZoom(1); //set map zoom level for desktop and tablet sizes
    } else {
        interactiveMap.map.setZoom(0); //set map zoom level for mobile size
    };
  },
  handleMapClick: function(e) {
    var features = interactiveMap.map.queryRenderedFeatures(e.point, { layers: ["country-boundaries"] });

    if (features[0] && !interactiveMap.popup) {
      var countryISO = features[0].properties.iso_3166_1_alpha_3;
      var country = features[0].properties.name_en;
      var region = ISOs[countryISO];

      var countryList = null;
      var storiesURL = null;

      // see regions.js for other lookup options
      switch (region) {
        case 'Africa':
          interactiveMap.highlightedRegion = 'Africa';
          interactiveMap.addCountryFilter(AfricaISOs, '#284476');
          countryList = Object.keys(Africa);
          storiesURL = 'https://elprograms.org/regions/africa/';
          break;
        case 'East Asia and Pacific':
          interactiveMap.highlightedRegion = 'East Asia and Pacific';
          interactiveMap.addCountryFilter(EastAsiaAndPacificISOs, '#4DA6CD');
          countryList = Object.keys(EastAsiaAndPacific);
          storiesURL = 'https://elprograms.org/regions/east-asia-pacific/';
          break;
        case 'Europe and Eurasia':
          interactiveMap.highlightedRegion = 'Europe and Eurasia';
          interactiveMap.addCountryFilter(EuropeAndEurasiaISOs, '#7E2320');
          countryList = Object.keys(EuropeAndEurasia);
          storiesURL = 'https://elprograms.org/regions/europe-eurasia/';
          break;
        case 'Near East':
          interactiveMap.highlightedRegion = 'Near East';
          interactiveMap.addCountryFilter(NearEastISOs, '#D16938');
          countryList = Object.keys(NearEast);
          storiesURL = 'https://elprograms.org/regions/near-east-north-africa/';
          break;
        case 'South and Central Asia':
          interactiveMap.highlightedRegion = 'South and Central Asia';
          interactiveMap.addCountryFilter(SouthAndCentralAsiaISOs, '#EAC446');
          countryList = Object.keys(SouthAndCentralAsia);
          storiesURL = 'https://elprograms.org/regions/south-central-asia/';
          break;
        case 'Western Hemisphere':
          interactiveMap.highlightedRegion = 'Western Hemisphere';
          interactiveMap.addCountryFilter(WesternHemisphereISOs, '#3E8549');
          countryList = Object.keys(WesternHemisphere);
          storiesURL = 'https://elprograms.org/regions/western-hemisphere/';
          break;
      }

      // check for disputed or excluded territories from DoS lists
      if (countryList) {
        var htmlContent = view.createPopupContent(region, countryList, storiesURL);

        interactiveMap.popup = new mapboxgl.Popup({closeOnClick: false})
          .setLngLat(e.lngLat.wrap())
          .setHTML(htmlContent.outerHTML)
          .addTo(interactiveMap.map);

        interactiveMap.popup.on("close", function(e) {
          controller.resetMap();
          interactiveMap.popup = null;
        });
      }
    }
  }
};

var view = {
  highlightRegion: function(color) {
    interactiveMap.map.setPaintProperty('country-boundaries', 'fill-color', color);
  },
  createPopupContent: function(region, countryList, url) {
    var container = document.createElement('div');
    container.classList.add('popup-container');
    var h1 = document.createElement('h1');
    h1.innerHTML = region;
    container.appendChild(h1);

    var anchor = document.createElement('a');
    anchor.innerHTML = 'View Stories >';
    anchor.setAttribute('href', url);
    anchor.setAttribute('target', '_blank');
    container.appendChild(anchor);

    var ul = document.createElement('ul');

    var li = document.createElement('li');
    li.innerHTML = '<strong>Countries with projects:</strong>';
    ul.appendChild(li);

    for (var i=0; i<countryList.length; i++) {
      var li = document.createElement('li');
      li.innerHTML = countryList[i];
      ul.appendChild(li);
    }

    container.appendChild(ul);
    return container;
  }
};

interactiveMap.getToken();
