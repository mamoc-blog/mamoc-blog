var w = window.innerWidth;
var h = window.innerHeight;
var bslider
var slider_text
var status_button
var step_button
var status_bool = false
var grid_list = [];
var gridimages = [];
var testimage
var tracking = [];
var global_options =[];
var old_grids = [];
var backtracking = false;
var slider_max = 30;


var filled_count;


var svgFilenames = [];



const imageHolder = document.getElementById('imageholder'); // Get the div with the ID "imageholder"
// Create an empty array to store the filenames

const svgImages = imageHolder.querySelectorAll('img'); // Get all img elements within the div

svgImages.forEach(image => {
const filename = image.src.split('/posts').pop(); // Extract the filename from the src attribute
if (filename.endsWith('.svg')||filename.endsWith('.png')) { // Check if it's an SVG file
  svgFilenames.push('.'.concat(filename)); // Add the filename to the list
  }
});

function  startWFC() {
  try {
    bslider.remove()
  }
  catch (TypeError) {
  }
  if (tileset.includes('CITY')){
    bslider = createSlider(1, 8,2);
    bslider.parent("wfc-container")
    bslider.position(0,0.41*h);
    bslider.size(0.2*w);
  }
  else {
    bslider = createSlider(1, 30,2);
    bslider.parent("wfc-container")
    bslider.position(0,0.41*h);
    bslider.size(0.2*w);
  }

  createGrid(bslider.value(),true)

}

// Represents a square within the grid.
class gridSquare {
constructor(position, options) {
  this.position = position;  // Stores the position of the square within the grid of type [x,y]
  this.options = options;  // Contains the possible values or options for the square
  this.underInspection = false;  // Flags whether the square is currently being examined while solving
  this.fixed = false;  // Indicates whether the value of the square has been definitively set
}
}

// Object for tracking information required for backtracking.
class trackingObj {
constructor(gridSquare, options) {
  this.gridSquare = gridSquare;  // References the grid square being tracked
  this.options = options;  // Stores the current possible options for the tracked square
  this.indexes = [];  // Holds the options that have been tried
}
}

// Represents an error encountered when the propogationn algorithm causes a cell to have no remaining options.
class optionsError extends Error {
constructor(message, broken_cell, grid_list) {
  super(message);  // Inherits from the base Error class
  this.name = "OptionError";  // Specifies the error's name
  this.broken_cell = broken_cell;  // References the grid square causing the error
}
}


// Function to visually render a grid of squares onto the canvas.
function renderGrid(grid_array) {
// Calculate grid dimensions
var grid_size = Math.sqrt(grid_array.length);
var [grid_w, grid_h] = [0.6 * w / grid_size, 0.4 * h / grid_size];  // Adjust based on canvas size

// Iterate through each square in the grid
for (let i = 0; i < grid_array.length; i++) {
  // Get the square's position
  var [x, y] = grid_array[i].position;

  // Render based on the number of options and state:

  // If only one option (likely a solved square):
  if (grid_array[i].options.length == 1) {
    fill('black');       // Black background
    strokeWeight(2);     // White border (default)
    stroke('white');

    // If the square is fixed (value cannot change):
    if (grid_array[i].fixed == true) {
      strokeWeight(2);  // Thicker blue border for emphasis
      stroke('blue');
    }

    rect(x * grid_w, y * grid_h, grid_w, grid_h);  // Draw the square
    strokeWeight(0);  // Reset stroke for text
    image(gridimages[grid_array[i].options[0]], x * grid_w, y * grid_h, grid_w, grid_h);  // Display image based on option

  // If no options (error or invalid state):
  } else if (grid_array[i].options.length == 0) {
    fill('orange');      // Orange background to indicate issue
    rect(x * grid_w, y * grid_h, grid_w, grid_h);

  // Otherwise (multiple options, unsolved):
  } else {
    fill('black');      // Black background
    rect(x * grid_w, y * grid_h, grid_w, grid_h);
  }

  // Display text information for each square:
  fill('white');         // White text for visibility
  strokeWeight(0);       // No stroke for text
  options_coords = grid_array[i].options.length.toString() //.concat(' ').concat(grid_array[i].position.toString());
  // Display number of options and position coordinates
  text(options_coords, (x + 0.1) * grid_w, (y + 0.1) * grid_h, grid_w, grid_h);
}
}

// Function to create array representing the grid of gridSquare objects
function createGrid(grid_size,tilebool=false) {
// Initialize arrays to hold the grid and options
let grid_array = [];
let options = [];
global_options = [];  // reset global options

// Extract options from SVG images:
svgImages.forEach(image => {
  var filename =''
  if (!tilebool) {
    filename = image.src.split('/').pop();
  } else {
    if (image.src.includes(tileset)) {
      filename = image.src.split('/').pop();
    } else {
      filename = '';
    }
  }
  if (filename.endsWith('.svg')||filename.endsWith('.png')) {  // Check if it's an SVG file
    options.push(filename.split('.')[0]);  // Add filename (without extension) as an option
    global_options.push(filename.split('.')[0]);  // Add to global options as well
  }
});

// Create grid squares:
for (let x = 0; x < grid_size; x++) {
  for (let y = 0; y < grid_size; y++) {
    var temp_square = new gridSquare([x, y], options);  // Create a gridSquare object with position and options
    grid_array.push(temp_square);  // Add the square to the grid array
  }
}

return grid_array;  // Return the created grid
}

// Simple "not" function
const not = x => !x;

// Identity function (returns input as-is)
const identity = x => x;

// Function to check a neighboring cell in a specific direction
function checkDirection(direction, cell, grid_list, visited, in_visited = not) {
// Direction format: [x offset, y offset] (e.g., N = [0, -1])

// Calculate the new position based on direction
let new_position = [direction[0] + cell.position[0], direction[1] + cell.position[1]];

// Check if the new position is within the grid
position_match = grid_list.some(cell => JSON.stringify(cell.position) == JSON.stringify(new_position));

// Check if the new position is included or excluded in the "visited" list, based on the "in_visited" function
visited_match = in_visited(visited.some(cell => JSON.stringify(cell.position) == JSON.stringify(new_position)));

// If both conditions are met, return the cell at the new position
if (position_match && visited_match) {
  found_cell = grid_list.filter(cell => JSON.stringify(cell.position) === JSON.stringify(new_position))[0];
  return found_cell;
} else {
  return false; // Indicate no valid cell found
}
}

// Function to check if a cell is present in a list of grid cells
function inArray(input_cell, grid_list) {
// Compare cell positions for equality (using JSON.stringify for consistent comparison)
return grid_list.some(cell => JSON.stringify(cell.position) == JSON.stringify(input_cell.position));
}

// Map to convert numerical direction pairs to letters
const directionsMap = new Map([
[[0, -1].toString(), "U"],  // Up
[[0, 1].toString(), "D"],  // Down
[[-1, 0].toString(), "L"],  // Left
[[1, 0].toString(), "R"]   // Right
]);

// Function to obtain the letter representation of a direction
function mapDirectionToLetter(direction) {
// Access the corresponding letter from the directionsMap, or return false for invalid directions
return directionsMap.get(direction.toString()) || false;
}
function checkConnection(cell,direction){
// cell is the cell to be checked, direction is the vector of the connection we are checking
// e.g check cell x for [0,-1] i.e check if it has a connection to the North
// returns true or false
letter = mapDirectionToLetter(direction)
return cell.options.toString().includes(letter)

}

function checkAllOptionsForDirection(adjacent_cell,direction) {
return adjacent_cell.options.every(str => str.includes(mapDirectionToLetter(direction)))
}

function adjustPossibilities(collapsedCell,grid_array) {
/**
 * Returns an updated grid_array with reduced tile options
 *
 * @param {gridSquare} collapsedCell Cell to propogate entropy from.
 * @param {Array} grid_array The Array to propogate entropy through.
 * @return {Array} grid list with updated tileset.
 */

// setup the queue and visited arrays for marking what cells in the grid
// we need to visit/have visited
var queue = [];
var visited = [collapsedCell];

// define the vector directions for NESW in the grid
directions = [[0,-1],[0,1],[-1,0],[1,0]]
if (tileset.includes('CITY')){
  directions = [[0,-1],[0,1],[-1,0],[1,0],[1,-1],[-1,-1],[1,1],[-1,1]]
}
const directionstoindex = {
  '0,-1': [0,4,5],
  '0,1': [1,6,7],
  '1,0': [2,4,6],
  '-1,0': [3,5,7],
  '1,-1': [4,0,2], // north, northeast, east
  '-1,-1': [5,0,3], // north, west, northwest
  '1,1': [6,1,2], // south, southeast, east
  '-1,1': [7,1,3], //  south, southwest, west
};

// // push the four adjacent cells surrounding the collapsed cell into the queue
directions.forEach(direction => {
  result = checkDirection(direction,collapsedCell,grid_array,visited);
  if(result){
    queue.push(result)
  }
  })



// until we run out of cells in the grid (== checking if the queue isnt empty)
while (queue.length > 0){

  // remove the first cell from the queue and mark it as current_cell
  current_cell = queue.shift()

  // if it has entropy 0 (== to only have one tile option skip it)
  if (current_cell.fixed == true) {
    continue;

  }

  // collect the four cells adjacent to the current cell and if they are already visited we add them to adjacent_visited
  // if they aren't visited and not already in the queue we can add them to the queue
  current_cell.underInspection = true;
  adjacent_visited = [];
  adjacent_not_visited = [];
  directions.forEach(direction => {
    result = checkDirection(direction,current_cell,grid_array,visited,in_visited=identity);
    if (result){
      adjacent_visited.push([result,direction])
    } else {
      // add current_cells new adjacents to adjacent_not_visited
      not_visited = checkDirection(direction,current_cell,grid_array,visited);
      if(not_visited && !inArray(not_visited,queue)){
        adjacent_not_visited.push(not_visited)
      }
    }
    })
    var split_adj = [[],[],[],[],[],[],[],[]];
    var split_cur = [];

  total_indices = [];
  old_options = JSON.stringify(current_cell.options)
  adjacent_visited.forEach(pair => {
    // decompose adjacent_visited into a cell and direction
    adjacent_cell=pair[0];
      direction=pair[1];

    if (tileset.includes('CITY')){


      cur_indexes =  directionstoindex[direction.toString()]
      //total_indices.concat(cur_indexes)
      adj_indexes = directionstoindex[direction.map(function(x) {return x*-1}).toString()]
      adj_indexes.forEach((adj_index,index) =>{
        adjacent_cell.options.forEach(option => {
          if (direction[0]*direction[1]!=0){
            index = 0;
          }
          i=index;
          if(!split_adj[cur_indexes[index]].includes(option.split('_')[adj_index])) {
            if(!total_indices.includes(cur_indexes[index])) {
              total_indices.push(cur_indexes[i])
            }
            if(option.split('_')[adj_index]=='WLWR'){
              split_adj[cur_indexes[index]].push('WL','WR')
            } else if (option.split('_')[adj_index]=='WUWD') {
              split_adj[cur_indexes[index]].push('WU','WD')
            } else {
              split_adj[cur_indexes[index]].push(option.split('_')[adj_index])
            }

          }
        })

      })





      // throw('i want a break')
      // //current_cell.options = current_cell.options.filter(element => !to_remove.includes(element))
      // current_cell.options = current_cell.options.filter((element,index) => !(to_remove[index]==adjacent_cell.options.length))

    } else {


      // if the adjacent cell does not have a connection towards the current cell we remove all tile with a connection towards the adjacent cell
      if(!checkConnection(adjacent_cell,direction.map(function(x) { return x * -1; }))) {
        connection = mapDirectionToLetter(direction);
        current_cell.options = current_cell.options.filter(str => !str.includes(connection))
      };
      // check if for every option in the cell to be checked there is always a connector in that direction then we can enforce
      // that current cell must have a connection in that direction
      if(checkAllOptionsForDirection(adjacent_cell,direction.map(function(x) { return x * -1; }))) {
        connection = mapDirectionToLetter(direction);
        current_cell.options = current_cell.options.filter(str => str.includes(connection))
      };
    }
  })
  if(tileset.includes('CITY')) {
    unvisited = [0,1,2,3,4,5,6,7].filter(item=>!total_indices.includes(item))
    unvisited.forEach((item, i) => {
      split_adj[item] = ['G','Y','LB','DB','WL','WR','WU','WD',];
    });


    current_cell.options.forEach(option => {
      var c = 0;
      split_adj.forEach((bucket,index) => {
        if(bucket.includes(option.split('_')[index])) {
          c+=1
        }
      })
      if(c==8) {
        split_cur.push(option)
      }

    })

    current_cell.options = split_cur
  }
  current_cell.underInspection = false;

  //if the current cell has no options we know this propogation can never work and therefore we throw an error
  // in order to indicate that backtracking should start
  if (current_cell.options.length==0){
    throw new optionsError('No available options',current_cell,grid_array)
  }

  // add the current cell to visited
  visited.push(current_cell)

  // if the options post constraint satisfying have changed add the adjacent cells to the queue
  if (old_options!=JSON.stringify(current_cell.options)) {
    adjacent_not_visited.forEach((item, i) => {
      if(!inArray(item,queue)) {
        queue.push(item)
      }
    });

    //queue = queue.concat(adjacent_not_visited)
  }



}
return grid_array
}

// Function to check if all cells in a grid have been collapsed to a single option
function finishedCollapse(grid_list) {
// Initialize a counter to track cells with a single option
count = 0;

// Iterate through each cell in the grid list
grid_list.forEach(cell => {
  // If the cell has only one option, increment the counter
  if (cell.options.length == 1) {
    count += 1;
  }
});
filled_count = count;
// Return true if all cells have a single option (solved grid), false otherwise
return count == grid_list.length;
}

// Function to get the position of a random uncollapsed cell from a grid list
function getRandomUnCollapsedCell(grid_list) {
// Define possible directions for reference (not directly used in this function)
directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

// Filter the grid list to include only cells with at least one option and not fixed
uncollapsed = grid_list.filter(cell => cell.options.length >= 1 && cell.fixed == false);

// Select a random index within the uncollapsed cells
index = Math.floor(Math.random() * uncollapsed.length);

// Return the position of the randomly selected uncollapsed cell
return uncollapsed[index].position;
}

function changeState() {
status_bool = !status_bool;
status_button.html(status_button.html()=='Start' ? 'Reset' : 'Start');
console.log('%cRESET', 'color: green; background: yellow; font-size: 30px');
if (status_bool){
  // if start state
  grid_list = createGrid(bslider.value(),true);
  backtracking = false;
  console.log('prob',prob_distr)
  redraw();

} else{
  grid_list = [];
  tracking = [];
  backtracking=false;
  grid_list = createGrid(bslider.value(),true);
  redraw();
}
}

function createNewNormalisedDistr(options) {
if(tileset.includes('CITY')){
  valid_options = [];
  options.forEach(item => {
    valid_options.push([find_value(prob_distr,item),item])
  })
}
else {
  valid_options = prob_distr.filter(item => options.includes(item[1]) )
}

total_prob = valid_options.reduce((sum, item) => sum + item[0], 0)
new_distr = valid_options.map(item => [item[0] / total_prob, item[1]]);
return new_distr
}

const mostFrequent = arr =>
Object.entries(
  arr.reduce((a, v) => {
    a[v] = a[v] ? a[v] + 1 : 1;
    return a;
  }, {})
).reduce((a, v) => (v[1] >= a[1] ? v : a), [null, 0])[0];

function find_value(data, string) {
if(tileset.includes('CITY')) {
  if(string.includes('W')){
    string = 'G_G_WD_WD_G_G_G_G'
  } else {
  string = mostFrequent(string.split('_'))
  string=string+'_'+string+'_'+string+'_'+string+'_'+string+'_'+string+'_'+string+'_'+string
  }
}
for (const [value, string_value] of data) {
  if (string_value === string) {
    return value;
  }
}
return null; // Indicate value not found using a clear signal

}

function leastEntropy(grid_list) {
entropy_vals=new Array(grid_list.length).fill(0)
grid_list.forEach((tile,index) =>{
  if(tile.options.length==1) {
    entropy_vals[index]=999
  } else{
    entropy_vals[index] = -1*tile.options.reduce((sum, item) => sum +find_value(prob_distr,item)*Math.log(find_value(prob_distr,item)), 0)
  }

})
return grid_list[entropy_vals.indexOf(Math.min.apply(null,entropy_vals))]
}

// Function to reset the "fixed" state of neighboring cells
function reset_neighbours(bad_cell, grid_array) {
// Initialize an empty list to store adjacent cells
adjacent = [];

// Define possible directions to check
directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
if (tileset.includes('CITY')){
  directions = [[0,-1],[0,1],[-1,0],[1,0],[1,-1],[-1,-1],[1,1],[-1,1]]
}

// Iterate through each direction:
directions.forEach(direction => {
  // Check for a valid neighboring cell in that direction
  result = checkDirection(direction, bad_cell, grid_array, [new gridSquare([-100, -100], 'FG')]);

  // If a valid neighbor is found:
  if (result) {
    // Retrieve the neighbor cell from the grid array
    found_cell = grid_array[grid_array.findIndex(cell => JSON.stringify(cell.position) == JSON.stringify(result.position))];

    // Unfix the neighbor cell (make it changeable again)
    found_cell.fixed = false;
  }
});

// Return the updated grid array
return grid_array;
}



function sampleOptionsFromDistribution(options) {
new_distr = createNewNormalisedDistr(options)
rand_sample = Math.random()
var cumulative_sum = 0;
for (item of new_distr) {
  prob = item[0];
  tile = item[1];
  cumulative_sum += prob
  if (cumulative_sum >= rand_sample) {
    return tile
  }

}
return tile
}


function setup() {
//frameRate(10);
svgFilenames.forEach(filename => { 
  gridimages[filename.split('/').at(-1).split('.')[0]] = loadImage(filename);
    });

console.log(gridimages)
var cnv = createCanvas(0.6*w,0.4*h);
cnv.parent("wfc-container");

bslider = createSlider(1, slider_max,2);
bslider.parent("wfc-container")
bslider.position(0,0.41*h);
bslider.size(0.2*w);

slider_text = createP(bslider.value())
slider_text.parent("wfc-container")
slider_text.position(0.21*w,0.4*h)

status_button = createButton("Start");
status_button.parent("wfc-container")
status_button.mousePressed(changeState)
status_button.position(0.3*w,0.41*h)


}

function draw() {
  // check positions
  w = window.innerWidth;
  h = window.innerHeight;
  resizeCanvas(0.6*w,0.4*h)
  bslider.position(0,0.41*h);
  bslider.size(0.2*w);
  slider_text.position(0.21*w,0.4*h)
  status_button.position(0.3*w,0.41*h)
  background(220);
  if(status_bool){
    switch_bool = true;
    if (finishedCollapse(grid_list)==false) {
      //get neighbour to a collapsed cell

      if (switch_bool && filled_count<0.2*grid_list.length) {
        //select randomly
        neighbour_pos = getRandomUnCollapsedCell(grid_list);
        neighbour = grid_list[grid_list.findIndex(cell =>JSON.stringify(cell.position)==JSON.stringify(neighbour_pos))];
        switch_bool = !switch_bool;
      } else {
        //least entropy heuristic
        neighbour = leastEntropy(grid_list);
        switch_bool = !switch_bool;
      }
      // neighbour = leastEntropy(grid_list);
      //collapse it
      collapsed_tile = sampleOptionsFromDistribution(neighbour.options);
      forbacktrack = new trackingObj(neighbour,neighbour.options);
      neighbour.options = [collapsed_tile];
      forbacktrack.indexes.push(collapsed_tile);
      forbacktrack.options = forbacktrack.options.filter(tile => JSON.stringify(tile) != JSON.stringify(collapsed_tile))
      backtracking = true;
      status_bool = !status_bool
  }

  }
  if (backtracking) {
    try {
      // try adjust probabilities
      old_grid_list = JSON.parse(JSON.stringify(grid_list));
      grid_list = adjustPossibilities(neighbour,grid_list);

      // if it doesnt error add it to tracking/oldgrids, fix the cell
      // and end backtracking and try to fix another cell
      tracking.push(forbacktrack);
      old_grids.push(old_grid_list)
      neighbour.fixed = true;
      backtracking = false;
      status_bool = true;
    } catch(error) {
      // Log error details
      console.error(`Error: ${error.name}: ${error.message}`);
      console.error(error.stack);
      // console.log(neighbour.position, neighbour.options, tracking.length);
      // Handle a specific error type (optionsError)
      if (error instanceof optionsError) {
        // Restore previous grid state
        grid_list = old_grid_list;
        // Highlight the problematic cell
        grid_list[grid_list.findIndex(cell => JSON.stringify(cell.position) == JSON.stringify(error.broken_cell.position))].underInspection = true;

        // Initiate backtracking
        backtracking = true;
        var solvable=true;

        // Find a cell with remaining options to retry
        if(tracking.length == 0) {
          solvable=false;
        } else {
          while (true) {

            toretry = tracking.pop();
            // console.log('h1',toretry)
            // console.log('here',toretry.options)
            if (toretry.options.length > 0) {
              break;
            } else if (tracking.length > 0) {
              // move back another grid in history if a cell has no available options left to try
              grid_list = old_grids.pop();
              renderGrid(grid_list);
            } else {
              // Grid is unsolvable
              //grid_list = [];
              solvable=false;
              break;
            }
          }
        }
      }
      if(solvable) {
      // Restore grid state from history
      grid_list = old_grids.pop();
      grid_list = reset_neighbours(error.broken_cell, grid_list);  // Unfix affected neighbors

      // Prepare for retry
      new_tile = sampleOptionsFromDistribution(toretry.options) // Get a new option to try
      // console.log(new_tile)
      toretry.options = toretry.options.filter(element => !element.includes(new_tile))
      toretry.indexes.push(new_tile);    // Track the attempted option
      tracking.push(toretry);            // Add back to tracking for potential future backtracking

      // Update the grid with the new option
      neighbour = grid_list[grid_list.findIndex(cell => JSON.stringify(cell.position) == JSON.stringify(toretry.gridSquare.position))];
      neighbour.options = [new_tile];

      console.log('%cDIDABACKTRACK', 'color: red; background: white; font-size: 30px');
      }
      else {
        old_grids=[];
        grid_list = [];
        tracking = [];
        grid_list = createGrid(bslider.value())
      }
    }
  }

  renderGrid(grid_list)

  //actually do stuff
  slider_text.html(bslider.value())
}
