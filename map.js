const mapStyle = [{
  'stylers': [{'visibility': 'off'}]
}, {
  'featureType': 'landscape',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
}, {
  'featureType': 'water',
  'elementType': 'geometry',
  'stylers': [{'visibility': 'on'}, {'color': '#bfd4ff'}]
}];

let map;

function initMap() {

  // load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40, lng: -100},
    zoom: 4.5,
    styles: mapStyle
  });


  const selection = document.getElementById('election-year');

  google.maps.event.addDomListener(selection, 'change', () => {
    clearData();
    loadData(selection.options[selection.selectedIndex].value);
  });

  //load GeoJSON for state polygons
  map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'NAME' });
}

const styleFeature = (feature) => {
  var showRow = true;
  if (feature.getProperty('color') == null) {
    showRow = false;
  }

  return {
    strokeWeight: 0.5,
    strokeColor: '#fff',
    fillColor: feature.getProperty('color') ,
    fillOpacity: 0.75,
    visible: showRow
  };
}

const clearData = () => {
  map.data.forEach((row) => {
    row.setProperty('winner', undefined);
  });
  // document.getElementById('data-box').style.display = 'none';
  // document.getElementById('data-caret').style.display = 'none';
}

const loadData = (url) => {
  fetch(url)
    .then(response => response.json())
    .then((myJSON) => {

      for (const state of Object.keys(myJSON)) {
        let stateName;
        let totalVotes = 0;
        let winningVotes = 0;
        let winningCandidate;

        for (const candidate of Object.keys(myJSON[state])) {
          stateName = myJSON[state][candidate]['state'];
          let numVotes = myJSON[state][candidate]['votes'];

          if(numVotes > winningVotes) {
            winningCandidate = myJSON[state][candidate];
            winningVotes = numVotes;
          }
          totalVotes += numVotes;
        }

        let color = '#ff0000';
        if(winningCandidate['parties'][0] === 'Democratic') color = '#0000ff';

        map.data
            .getFeatureById(stateName)
            .setProperty('color', color);

      }
    })

    .then( () => map.data.setStyle(styleFeature))

}

