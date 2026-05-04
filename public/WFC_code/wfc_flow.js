var tileselect = document.getElementById("tileselect");
var wfcp5 = document.getElementById("wfc-container");
var prob_graph = document.getElementById('prob_graph')
const resetButton = document.getElementById("resetButton");
var prob_distr;
var tileset ='';

// Get a reference to the images container
const imagesContainer = document.querySelector(".images");

// Fetch the list of folders in the "media/wfc/" folder
const imageload = document.getElementById("imageholder");
const images = imageload.querySelectorAll("img");
const folderPaths = [];
const image_list = [];
var img_array = ['G_G_G_G_G_G_G_G_H1.png','DRLT.svg','DR.svg']
images.forEach(image => {
  const imageSrc = image.getAttribute("src").replace(/\\/g, "/");
  const lastIndex = imageSrc.lastIndexOf("/");
  var folderPath = imageSrc.substring(0, lastIndex);
  image_list.push(imageSrc)
  if (folderPaths.indexOf(folderPath) === -1 && folderPath!='/posts/WFC') { // Check if not already present
      folderPaths.push(folderPath)
      const imageContainer = document.createElement("div");
      imageContainer.classList.add("image-container");

      const label = document.createElement("p");
      label.textContent = `${folderPath.split("/").pop()}`

      const button = document.createElement("button");
      button.addEventListener("click", () => {
        setupProbGraph(folderPath)
      });
      button.textContent = 'select';

      // Choose a representative image from the folder (modify as needed)
      const image = document.createElement("img");
      image.src = `${folderPath}/`.concat(img_array.shift()); // Assuming DR.svg exists in each folder
      image.alt = `Tileset ${folderPath.split("/").pop()}`;
      imageContainer.appendChild(label)
      imageContainer.appendChild(image);
      imageContainer.appendChild(button);

      imagesContainer.appendChild(imageContainer);
  }
});




resetButton.addEventListener("click", () => {
  tileselect.style.display = 'block';
  prob_graph.style.display = 'none';
  wfcp5.style.display = 'none';
  try {
    document.getElementById("STARTWFC").remove();
  } catch (TypeError) {
  }
});

class probabilitySumError extends Error {
  constructor(message, sum_value) {
    super(message);  // Inherits from the base Error class
    this.name = "Probability Sum Error";  // Specifies the error's name
    this.value = sum_value;  // References the grid square causing the error
  }
}

function showWFC() {
  prob_graph.style.display = 'none';
  wfcp5.style.display = 'block';
  document.getElementById("STARTWFC").remove();
}

// Distribution editor: vanilla DOM, native range sliders. Each tile gets a
// row with thumbnail, label, slider and percent readout. Adjusting one
// slider redistributes the delta proportionally across the others so the
// total stays at 1. Writes to global `prob_distr` so wfc.js sampling stays
// unchanged.
function setupProbGraph(folder) {
  var folder_subset = image_list.filter(string => string.includes(folder));
  if (folder.includes('CITY')) {
    folder_subset = [
      './WFC/CITY/G_G_G_G_G_G_G_G.png',
      './WFC/CITY/Y_Y_Y_Y_Y_Y_Y_Y.png',
      './WFC/CITY/LB_LB_LB_LB_LB_LB_LB_LB.png',
      './WFC/CITY/DB_DB_DB_DB_DB_DB_DB_DB.png',
      './WFC/CITY/G_G_WD_WD_G_G_G_G.png',
    ];
  }

  tileselect.style.display = 'none';
  prob_graph.style.display = 'block';
  tileset = folder;

  var biomes = folder.includes('CITY') ? ['Grass', 'Sand', 'Lagoon', 'Ocean', 'Wall'] : null;
  var n = folder_subset.length;
  var values = new Array(n).fill(1 / n);

  var tileName = function (i) { return folder_subset[i].split('/').at(-1).split('.')[0]; };
  var tileLabel = function (i) { return biomes ? biomes[i] : tileName(i); };
  // Slider thumbnails come from the manifest (which uses absolute /posts/WFC/
  // paths). The CITY override above uses relative ./WFC/ paths inherited from
  // the original code, so rewrite for browser display.
  var tileSrc = function (i) { return folder_subset[i].replace(/^\.\/WFC\//, '/posts/WFC/'); };

  // STARTWFC button — same id the reset handler looks for.
  var footer = document.getElementById('wfc-footer');
  footer.innerHTML = '';
  var startBtn = document.createElement('button');
  startBtn.id = 'STARTWFC';
  startBtn.textContent = 'start collapse →';
  startBtn.addEventListener('click', function () { startWFC(); showWFC(); });
  footer.appendChild(startBtn);

  function syncProbDistr() {
    prob_distr = values.map(function (v, i) { return [v, tileName(i)]; });
    startBtn.dataset.array = JSON.stringify(values);
  }

  function redistribute(idx, newValue) {
    newValue = Math.max(0, Math.min(1, newValue));
    var otherSum = values.reduce(function (s, v, i) { return i === idx ? s : s + v; }, 0);
    var remaining = 1 - newValue;
    if (otherSum < 1e-9) {
      var each = remaining / (n - 1);
      values = values.map(function (v, i) { return i === idx ? newValue : each; });
    } else {
      values = values.map(function (v, i) { return i === idx ? newValue : v * (remaining / otherSum); });
    }
  }

  var host = document.getElementById('prob_editor');
  host.innerHTML = '';
  host.removeAttribute('style');

  var grid = document.createElement('div');
  grid.className = 'prob-grid';

  var rows = [];
  for (var i = 0; i < n; i++) {
    var row = document.createElement('div');
    row.className = 'prob-row';

    var thumb = document.createElement('img');
    thumb.src = tileSrc(i);
    thumb.alt = tileLabel(i);
    thumb.className = 'prob-thumb';

    var label = document.createElement('div');
    label.className = 'prob-label';
    label.textContent = tileLabel(i);

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 1000;
    slider.value = Math.round(values[i] * 1000);
    slider.className = 'prob-slider';

    var pct = document.createElement('div');
    pct.className = 'prob-pct';
    pct.textContent = (values[i] * 100).toFixed(1) + '%';

    row.appendChild(thumb);
    row.appendChild(label);
    row.appendChild(slider);
    row.appendChild(pct);
    grid.appendChild(row);

    rows.push({ slider: slider, pct: pct });
  }

  function refreshUI() {
    rows.forEach(function (r, i) {
      r.slider.value = Math.round(values[i] * 1000);
      r.pct.textContent = (values[i] * 100).toFixed(1) + '%';
    });
  }

  rows.forEach(function (r, idx) {
    r.slider.addEventListener('input', function (e) {
      redistribute(idx, parseInt(e.target.value, 10) / 1000);
      refreshUI();
      syncProbDistr();
    });
  });

  host.appendChild(grid);
  syncProbDistr();
}