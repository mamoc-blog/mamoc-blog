var startpage = document.getElementById("start-page");
      var tileselect = document.getElementById("tileselect");
      var wfcp5 = document.getElementById("wfc-container");
      var goButton = document.getElementById("goButton");
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
      img_array = ['G_G_G_G_G_G_G_G_H1.png','DRLT.svg','DR.svg']
      images.forEach(image => {
        const imageSrc = image.getAttribute("src");
        const lastIndex = imageSrc.lastIndexOf("/");
        var folderPath = imageSrc.substring(0, lastIndex);
        image_list.push(imageSrc)
        if (folderPaths.indexOf(folderPath) === -1 && folderPath!='/posts/WFC') { // Check if not already present
            folderPaths.push(folderPath)
            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            const label = document.createElement("p");
            label.style.fontWeight = 800
            label.style.fontSize = '0.8rem'
            label.innerHTML = `${folderPath.split("/").pop()}`

            const button = document.createElement("button");
            button.addEventListener("click", () => {
              setupProbGraph(folderPath)

            });
            button.textContent = 'Select';


            

            // Choose a representative image from the folder (modify as needed)
            const image = document.createElement("img");
            
            image.src = `${folderPath}/`.concat(img_array.shift()); // Assuming DR.svg exists in each folder
            image.alt = `Tileset ${folderPath.split("/").pop()}`;
            image.style.height = '10vh'
            imageContainer.appendChild(label)
            imageContainer.appendChild(image);
            imageContainer.appendChild(button);

            imagesContainer.appendChild(imageContainer);
        }
      });




      goButton.addEventListener("click", () => {
        startpage.style.display = 'none';
        tileselect.style.display = 'block';

      });
      resetButton.addEventListener("click", () => {
        startpage.style.display = 'block';
        tileselect.style.display = 'none';
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

      function setupProbGraph(folder) {
        folder_subset = image_list.filter(string => string.includes(folder))
        console.log('IMAGE_list',folder_subset)
        if(folder.includes('CITY')) {
          folder_subset=['./WFC/CITY/G_G_G_G_G_G_G_G.png',
          './WFC/CITY/Y_Y_Y_Y_Y_Y_Y_Y.png',
          './WFC/CITY/LB_LB_LB_LB_LB_LB_LB_LB.png',
          './WFC/CITY/DB_DB_DB_DB_DB_DB_DB_DB.png',
          './WFC/CITY/G_G_WD_WD_G_G_G_G.png',]
        } 
        console.log('IMAGE_list',folder_subset)
        
        tileselect.style.display = 'none';
        prob_graph.style.display = 'block';
        var var_length = folder_subset.length
        footer = document.getElementById('wfc-footer')
        tileset = folder;
        var button = document.createElement("button");
            button.addEventListener("click", () => {
              startWFC()
              showWFC()

            });
        button.id = 'STARTWFC'
        button.textContent = `Start WFC`;
        footer.append(button)


        const brd = JXG.JSXGraph.initBoard('jxgbox', {
            boundingbox: [-1, 1.2, folder_subset.length + 1, -0.2], axis:true,
            defaultAxes: {
                x: {
                  name: '',
                  withLabel: true,
                  label: {
                    position: 'lrt',
                    offset: [0,-20],
                    anchorX: 'right'
                  }
                },
                y: {
                  withLabel: true,
                  name: 'Pr(x)',
                  label: {
                    position: 'rt',
                    offset: [0,-5],
                    fontSize: 14,
                    anchorY: 'top'
                  }
                }

            },
            showZoom: false,
            showNavigation: false,
        });
        brd.attr.pan.enabled = false;
        brd.options.dragEdges = false;


        var points = [];
        var images = [];
        var selected_tile;
        if(folder.includes('CITY')) {
          strings = ['Grass','Sand','Lagoon','Ocean','Wall']
          folder_subset.forEach((string,index) => {
          points.push(brd.create('point', [1 + index, 1/folder_subset.length], {name: strings[index],label: {position:'bot',offset:[0,10],fixed:true,rotate: 90}}))
        })
        }
        else{
        folder_subset.forEach((string,index) => {
          points.push(brd.create('point', [1 + index, 1/folder_subset.length], {name: string.split('/').at(-1).split('.')[0],label: {position:'bot',offset:[0,10],fixed:true,rotate: 90}}))
        })}
        sumvar =  points.reduce((sum, item) => sum + item.Y(), 0);
        // var title_text = brd.create('text', [0.75*(folder_subset.length)/2, 1.1, "SELECT YOUR TILE DISTRIBUTION:"],{fixed:true, strokeColor:'black',fontSize: 16,});
        var sum_text = brd.create('text', [0, 0.8, "Sum: " + sumvar.toFixed(2)],{fixed:true,digits: 2,});
        var oldys = new Array(folder_subset.length).fill(1/folder_subset.length);
        prob_distr = oldys.map((item1, index) => [item1, folder_subset[index].split('/').at(-1).split('.')[0]]);
         brd.create('polygon',[
          brd.create('point', [0.8*(folder_subset.length) , 0.8], { size: 0,name: '',fixed:true }),
          brd.create('point', [(0.8+0.1)*(folder_subset.length) , 0.8], { size: 0,name: '',fixed:true }),
          brd.create('point', [(0.8+0.1)*(folder_subset.length) , 1], { size: 0,name: '',fixed:true }),
          brd.create('point', [(0.8)*(folder_subset.length) , 1], { size: 0,name: '',fixed:true })

          ])
        points.forEach((point,index)=>{
          point.on('down', function(e) {
            oldys[index] = point.Y()
            brd.removeObject(selected_tile)
            selected_tile = brd.create('image',[folder_subset[index],[0.8*(folder_subset.length),0.8],[0.1*(folder_subset.length),0.2]],{borders: {strokeWidth:1, strokeColor:'DarkGrey'}})
            point.label.setAttribute({strokeColor:'red',cssClass: 'bold-label'})
          })
          point.on('up', function(e) {
            point.label.setAttribute({strokeColor:'black',cssClass: 'normal-label'})
            button.dataset.array = JSON.stringify(oldys);
          })

        })
        var pol = brd.create('polygon',
        [brd.create('point', [1 , 0], { size: 0,name: '',fixed:true })].concat(points).concat([brd.create('point', [ folder_subset.length, 0], { size: 0,name: '',fixed:true })])
        ,{fixed:true,frozen:true, borders : {fixed:true,frozen:true}});
        pol.isDraggable = false;
        points.forEach((point,pointindex) =>{
          point.on('drag', function(e) {
            notthispoint = points.filter(otherpoint => otherpoint.getName()!=point.getName())
            adjustment = (point.Y()-oldys[pointindex])*-1/(notthispoint.length)
            var bad_adj
            notthispoint.forEach((point2,index) => {
                if (point2.Y()+ adjustment< 0 || point2.Y()+ adjustment >1 ) {
                  bad_adj = true;
                }
                point2.moveTo([point2.X(),point2.Y() + adjustment])

            })
            if(bad_adj || point.Y() < 0 || point.Y()>1) {
              points.forEach((pointn,index) => {
                pointn.moveTo([1+index,oldys[index]])
              })
            } else {
              point.moveTo([1+pointindex,point.Y()])
              points.forEach((point,index) => {
                oldys[index] = point.Y();
                prob_distr = oldys.map((item1, index) => [item1, folder_subset[index].split('/').at(-1).split('.')[0]]);
              })
            }

          sumvar = points.reduce((sum, item) => sum + item.Y(), 0); // Update the variable
          sum_text.setText("Sum: " + sumvar.toFixed(2));
          })
        })
      }
