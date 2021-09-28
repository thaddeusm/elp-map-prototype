var interactiveMap = {
  token: null,
  map: null,
  highlightedRegion: '',
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
      container: 'map', // container ID
      style: 'mapbox://styles/thaddeusmccleary/cku2oy4o30czo17s1twoies5a', // style URL
      center: [5, 36], // starting position [lng, lat]
      zoom: 1 // starting zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    controller.initializeListeners();
  },
  addCountryFilter: function(region, color) {
    let countries;

    if (region !== '') {
        countries = this.getCountryCodes(region);
        this.map.setFilter('country-boundaries', [
          "in",
          "iso_3166_1_alpha_3",
          ...countries
        ]);
    } else {
      this.map.setFilter('country-boundaries', null);
    }

    view.highlightRegion(color);
  },
  getCountryCodes: function(region) {
    return Object.values(region);
  }
};

var controller = {
  initializeListeners: function() {
      interactiveMap.map.on("style.load", function() {
        view.addCountryLayer();
      });

      interactiveMap.map.on("mousemove", function(e) {
        var features = interactiveMap.map.queryRenderedFeatures(e.point, { layers: ["country-boundaries"] });

        if (features[0]) {
            var region = features[0].properties.region;
            console.log(region);
            switch (region) {
              case 'Africa':
                interactiveMap.addCountryFilter(region, '#284476');
                break;
              case 'Oceana':

                break;

            }
        } else {
          interactiveMap.addCountryFilter('', '#FFFFFF');
        }
      })
  }
};

var view = {
  addCountryLayer: function() {
    interactiveMap.map.addLayer(
    {
        id: 'country-boundaries',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        type: 'fill',
        paint: {
          'fill-color': '#FFFFFF',
          'fill-opacity': 1,
        },
      }
    );

    interactiveMap.addCountryFilter('', '#FFFFFF');
  },
  highlightRegion(color) {
    interactiveMap.map.setPaintProperty('country-boundaries', 'fill-color', color);
  }
};

interactiveMap.getToken();
