
import React from "react";
import Script from 'next/script'




export default function WFCCONTAINER() {
  
    

  return (
    <div>
    <div>
    <link rel="stylesheet" type="text/css" href="/WFC_code/wfc.css" />
    <Script src="https://cdn.jsdelivr.net/npm/p5@1.8.0/lib/p5.js" />
    <Script type="text/javascript" src="/WFC_code/wfc.js" />
    <Script type="text/javascript"  src="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css" />
  </div>
  <div className="box-container" id="box-c" style={{margin:'auto',}}>
      <div id="start-page">
        <p className="title" style={{fontSize: "2rem", fontWeight:"800"}}>WAVE FUNCTION COLLAPSE DEMO</p>
        <button id="goButton">Go</button>

      </div>
      <div id="tileselect" style={{display:'none'}}>
        <p className="" style={{fontSize: "1.6rem", fontWeight:"800", margin:'2%'}} >SELECT TILESET</p>
          <div className="images">
          </div>
          <a className="title header" style={{fontSize: "0.8rem", fontWeight:"800", margin:'2%'}} href='#tilesets'>Tileset Info</a>
      </div>
      <div id='prob_graph' style={{display: 'none'}}>
        <div id="jxgbox"  className="jxgbox" style={{width:'60vw', height:'40vh'}}></div>
        </div>
        <main id="wfc-container" style={{display:'none'}}>
        </main>
      <br></br>
      <div id="wfc-footer">
      <button className="resetButton"  id="resetButton">↺ Reset</button>
      </div>
    </div>
    <Script type="text/javascript" src="/WFC_code/wfc_flow.js" />
    <br/>
    <br/>
  </div>
  
    );
  }