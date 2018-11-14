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
    center: { lat: 40, lng: -100 },
    zoom: 4.5,
    styles: mapStyle,
    disableDefaultUI: true,
  });

  // set up the rules for how the map should be styled
  map.data.setStyle(styleFeature);
  map.data.addListener('mouseover', mouseIn);
  map.data.addListener('mouseout', mouseOut);

  const selection = document.getElementById('election-year');

  // listen for change in selection from election year menu
  google.maps.event.addDomListener(selection, 'change', () => {
    clearData();
    loadData(selection.options[selection.selectedIndex].value);
  });

  //load GeoJSON for state polygons
  map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'NAME' });

  // make sure selected map option renders on page load
  google.maps.event.addListenerOnce(map.data, 'addfeature', () => {
      google.maps.event.trigger(document.getElementById('election-year'),
          'change');
    });
}

const styleFeature = (feature) => {
  // don't show feature if color isn't set
  let showRow = true;
  if (feature.getProperty('color') == null) {
    showRow = false;
  }

  let outlineWeight = 0.5;
  if (feature.getProperty('state') === 'hover') {
    outlineWeight = 2;
  }

  return {
    strokeWeight: outlineWeight,
    strokeColor: '#fff',
    fillColor: feature.getProperty('color'),
    fillOpacity: 1.3 - feature.getProperty('win-margin'),
    visible: showRow,
  };
};

const clearData = () => {
  map.data.forEach((row) => {
    row.setProperty('color', undefined);
  });
  document.getElementById('data-box').style.display = 'none';
};

const loadData = (url) => {
  // get JSON data
  fetch(url)
    .then(response => response.json())
    .then((myJSON) => {
      // get state and candidate info from JSON
      for (const state of Object.keys(myJSON)) {
        let stateName;
        let totalVotes = 0;
        let winningVotes = 0;
        let winningCandidate;

        for (const candidate of Object.keys(myJSON[state])) {
          stateName = myJSON[state][candidate]['state'];

          const numVotes = myJSON[state][candidate]['votes'];
          // keep track of who's the winner so far
          if (numVotes > winningVotes) {
            winningCandidate = myJSON[state][candidate];
            winningVotes = numVotes;
          }
          totalVotes += numVotes;
        }
        // find feature id by state name and pass in properties to later be used by styles
        setFeatureStyles(stateName, winningCandidate, winningVotes / totalVotes);
      }
    });

};

const setFeatureStyles = (stateName, winningCandidate, winMargin) => {
  let color;
  let party = winningCandidate['parties'][0];
  // just adding this because Minnesota is WEIRD and have a different party name for democrats
  if (party === 'Democratic-Farmer Labor') party = 'Democratic';
  if (party === 'Democratic') {
    color = '#0033cc';
  } else if (party === 'Republican') {
    color = '#cc0000';
  } else {
    color = '#e6ccff';
  }

  // update features in the map's data layer to be used by style function
  map.data
    .getFeatureById(stateName)
    .setProperty('color', color);

  map.data
    .getFeatureById(stateName)
    .setProperty('win-margin', winMargin);

  map.data
    .getFeatureById(stateName)
    .setProperty('winning-candidate', winningCandidate);

};

const mouseIn = (e) => {
  e.feature.setProperty('state', 'hover');
  const candidateName = e.feature.getProperty('winning-candidate').name.split(',');

  document.getElementById('state-name').textContent = `${e.feature.getProperty('NAME')}`;
  document.getElementById('winning-candidate').textContent = `${candidateName[1]} ${candidateName[0]}`;
  document.getElementById('winning-party').textContent =
       `${e.feature.getProperty('winning-candidate')['parties'][0]} Party`;
   document.getElementById('data-box').style.display = 'block';
  document.getElementById('winning-margin').textContent = `${Math.round(e.feature.getProperty('win-margin') * 100)}%`
}

const mouseOut = (e) => {
  e.feature.setProperty('state', 'normal');
}
