// DoS region dictionaries
var Africa = {
  'Angola': 'AGO',
  'Benin': 'BEN',
  'Botswana': 'BWA',
  'Burkina Faso': 'BFA',
  'Burundi': 'BDI',
  'Cabo Verde': 'CPV',
  'Cameroon': 'CMR',
  'Central African Republic': 'CAF',
  'Chad': 'TCD',
  'Comoros': 'COM',
  'Côte d’Ivoire': 'CIV',
  'Democratic Republic of the Congo': 'COD',
  'Djibouti': 'DJI',
  'Equatorial Guinea': 'GNQ',
  'Eritrea': 'ERI',
  'Eswatini': 'SWZ',
  'Ethiopia': 'ETH',
  'Gabon': 'GAB',
  'Gambia': 'GMB',
  'Ghana': 'GHA',
  'Guinea': 'GIN',
  'Guinea-Bissau': 'GNB',
  'Kenya': 'KEN',
  'Lesotho': 'LSO',
  'Liberia': 'LBR',
  'Madagascar': 'MDG',
  'Malawi': 'MWI',
  'Mali': 'MLI',
  'Mauritania': 'MRT',
  'Mauritius': 'MUS',
  'Mozambique': 'MOZ',
  'Namibia': 'NAM',
  'Niger': 'NER',
  'Nigeria': 'NGA',
  'Republic of the Congo': 'COG',
  'Rwanda': 'RWA',
  'São Tomé and Príncipe': 'STP',
  'Senegal': 'SEN',
  'Seychelles': 'SYC',
  'Sierra Leone': 'SLE',
  'Somalia': 'SOM',
  'South Africa': 'ZAF',
  'South Sudan': 'SSD',
  'Sudan': 'SDN',
  'Tanzania': 'TZA',
  'Togo': 'TGO',
  'Uganda': 'UGA',
  'Zambia': 'ZMB',
  'Zimbabwe': 'ZWE'
};
var EastAsiaAndPacific = {};
var EuropeAndEurasia = {};
var NearEast = {};
var SouthAndCentralAsia = {};
var WesternHemisphere = {};

var interactiveMap = {
  token: null,
  map: null,
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
      zoom: 0 // starting zoom
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    controller.initializeListeners();
  },
  addCountryLayer: function() {
    this.map.addLayer(
    {
        id: 'country-boundaries',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        type: 'fill',
        paint: {
          'fill-color': '#284476',
          'fill-opacity': 1,
        },
      }
    );

    this.addCountryFilter();
  },
  addCountryFilter: function() {
    let countries = this.getCountryCodes(Africa);

    this.map.setFilter('country-boundaries', [
      "in",
      "iso_3166_1_alpha_3",
      ...countries
    ]);
  },
  getCountryCodes: function(region) {
    return Object.values(region);
  }
}

var controller = {
  initializeListeners: function() {
      interactiveMap.map.on("load", function() {
        setTimeout(function() {
          interactiveMap.addCountryLayer();
        }, 1000)
      });
  }
}

interactiveMap.getToken();
