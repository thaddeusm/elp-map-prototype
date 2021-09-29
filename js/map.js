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
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/thaddeusmccleary/cku2oy4o30czo17s1twoies5a',
      center: [5, 36],
      zoom: 1
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    controller.initializeListeners();
  },
  addCountryFilter: function(region, color) {
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
      interactiveMap.map.on("click", "country-boundaries", function(e) {
        var features = interactiveMap.map.queryRenderedFeatures(e.point, { layers: ["country-boundaries"] });

        if (features[0] && !interactiveMap.popup) {
          var countryISO = features[0].properties.iso_3166_1_alpha_3;
          var country = features[0].properties.name_en;
          var region = ISOs[countryISO];

          var countryList = null;

          switch (region) {
            case 'Africa':
              interactiveMap.highlightedRegion = 'Africa';
              interactiveMap.addCountryFilter(AfricaISOs, '#284476');
              countryList = Object.keys(Africa);
              break;
            case 'East Asia and Pacific':
              interactiveMap.highlightedRegion = 'East Asia and Pacific';
              interactiveMap.addCountryFilter(EastAsiaAndPacificISOs, '#4DA6CD');
              countryList = Object.keys(EastAsiaAndPacific);
              break;
            case 'Europe and Eurasia':
              interactiveMap.highlightedRegion = 'Europe and Eurasia';
              interactiveMap.addCountryFilter(EuropeAndEurasiaISOs, '#7E2320');
              countryList = Object.keys(EuropeAndEurasia);
              break;
            case 'Near East':
              interactiveMap.highlightedRegion = 'Near East';
              interactiveMap.addCountryFilter(NearEastISOs, '#D16938');
              countryList = Object.keys(NearEast);
              break;
            case 'South and Central Asia':
              interactiveMap.highlightedRegion = 'South and Central Asia';
              interactiveMap.addCountryFilter(SouthAndCentralAsiaISOs, '#EAC446');
              countryList = Object.keys(SouthAndCentralAsia);
              break;
            case 'Western Hemisphere':
              interactiveMap.highlightedRegion = 'Western Hemisphere';
              interactiveMap.addCountryFilter(WesternHemisphereISOs, '#3E8549');
              countryList = Object.keys(WesternHemisphere);
              break;
          }

          if (countryList) {
            var htmlContent = view.createPopupContent(region, countryList);

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
      });
  },
  resetMap: function() {
    interactiveMap.highlightedRegion = '';
    interactiveMap.addCountryFilter('', '#FFFFFF');
  }
};

var view = {
  highlightRegion: function(color) {
    interactiveMap.map.setPaintProperty('country-boundaries', 'fill-color', color);
  },
  createPopupContent: function(region, countryList) {
    var container = document.createElement('div');
    container.classList.add('popup-container');
    var h1 = document.createElement('h1');
    h1.innerHTML = region;
    container.appendChild(h1);
    var ul = document.createElement('ul');

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
