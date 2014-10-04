(function(global){
  var PP = {};

  // length of each pulse
  PP.pulseLength = 1000 / 7; // from pixelphones

  // pause between messages
  PP.pulseDelay  = 2000;


  // returns a function that will tell us if a pixel should be on/off at
  // a given timestamp

  // TODO - add padding, '0' indistinguishable from '1'
  PP.pulser = function(id){
    var pulses = manchester(padding(binary(id))),
        delay  = PP.pulseDelay,
        length = PP.pulseLength,
        span   = delay + (length * pulses.length);

    console.log(id, pulses.map(function(d){return d? '*' : '_'}).join(''))

    return function(t){
      var n = t % span;
      if(n < delay){
        return false
      } else {
        var i = Math.floor( (n - delay) / length );
        return pulses[i]
      }

    }
  }


  // todo - checksum

  // add a leading 1, so starts with a pulse
  function padding(digits){
    return digits.unshift(1), digits
  }

  function binary(i){
    return i.toString(2).split('').map(function(d){return parseInt(d)})
  }

  function manchester(digits){
    var encoded = new Array(digits.length*2)
    for(var i = 0; i < digits.length*2; i++){
      encoded[i] = (i%2) ^ digits[Math.floor(i/2)]
    }
    return encoded
  }

  global.PP = PP;
})(this)

// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);



// Blob Detection JS
//
// blog.acipo.com/blob-detection-js/
//
function FindBlobs(src, offset) {

  var xSize = src.width,
      ySize = src.height,
      srcPixels = src.data,
      x, y, pos;

  // This will hold the indecies of the regions we find
  var blobMap = [];
  var label = 1;

  // The labelTable remembers when blobs of different labels merge
  // so labelTabel[1] = 2; means that label 1 and 2 are the same blob
  var labelTable = [0];

  // Start by labeling every pixel as blob 0
  for(y=0; y<ySize; y++){
    blobMap.push([]);
    for(x=0; x<xSize; x++){
      blobMap[y].push(0);
    }
  }

  // Temporary variables for neighboring pixels and other stuff
  var nn, nw, ne, ww, ee, sw, ss, se, minIndex;
  var luma = 0;
  var isVisible = 0;

  // We're going to run this algorithm twice
  // The first time identifies all of the blobs candidates the second pass
  // merges any blobs that the first pass failed to merge
  var nIter = 2;
  while( nIter-- ){

    // We leave a 1 pixel border which is ignored so we do not get array
    // out of bounds errors
    for( y=1; y<ySize-1; y++){
      for( x=1; x<xSize-1; x++){

        pos = (y*xSize+x)*4;

        // We're only looking at the alpha channel in this case but you can
        // use more complicated heuristics
        isVisible = (srcPixels[pos+offset] > 127);

        if( isVisible ){

          // Find the lowest blob index nearest this pixel
          nw = blobMap[y-1][x-1] || 0;
          nn = blobMap[y-1][x-0] || 0;
          ne = blobMap[y-1][x+1] || 0;
          ww = blobMap[y-0][x-1] || 0;
          ee = blobMap[y-0][x+1] || 0;
          sw = blobMap[y+1][x-1] || 0;
          ss = blobMap[y+1][x-0] || 0;
          se = blobMap[y+1][x+1] || 0;
          minIndex = ww;
          if( 0 < ww && ww < minIndex ){ minIndex = ww; }
          if( 0 < ee && ee < minIndex ){ minIndex = ee; }
          if( 0 < nn && nn < minIndex ){ minIndex = nn; }
          if( 0 < ne && ne < minIndex ){ minIndex = ne; }
          if( 0 < nw && nw < minIndex ){ minIndex = nw; }
          if( 0 < ss && ss < minIndex ){ minIndex = ss; }
          if( 0 < se && se < minIndex ){ minIndex = se; }
          if( 0 < sw && sw < minIndex ){ minIndex = sw; }
  
          // This point starts a new blob -- increase the label count and
          // and an entry for it in the label table
          if( minIndex === 0 ){
            blobMap[y][x] = label;
            labelTable.push(label);
            label += 1;
  
          // This point is part of an old blob -- update the labels of the
          // neighboring pixels in the label table so that we know a merge
          // should occur and mark this pixel with the label.
          }else{
            if( minIndex < labelTable[nw] ){ labelTable[nw] = minIndex; }
            if( minIndex < labelTable[nn] ){ labelTable[nn] = minIndex; }
            if( minIndex < labelTable[ne] ){ labelTable[ne] = minIndex; }
            if( minIndex < labelTable[ww] ){ labelTable[ww] = minIndex; }
            if( minIndex < labelTable[ee] ){ labelTable[ee] = minIndex; }
            if( minIndex < labelTable[sw] ){ labelTable[sw] = minIndex; }
            if( minIndex < labelTable[ss] ){ labelTable[ss] = minIndex; }
            if( minIndex < labelTable[se] ){ labelTable[se] = minIndex; }

            blobMap[y][x] = minIndex;
          }

        // This pixel isn't visible so we won't mark it as special
        }else{
          blobMap[y][x] = 0;
        }
  
      }
    }
  
    // Compress the table of labels so that every location refers to only 1
    // matching location
    var i = labelTable.length;
    while( i-- ){
      label = labelTable[i];
      while( label !== labelTable[label] ){
        label = labelTable[label];
      }
      labelTable[i] = label;
    }
  
    // Merge the blobs with multiple labels
    for(y=0; y<ySize; y++){
      for(x=0; x<xSize; x++){
        label = blobMap[y][x];
        if( label === 0 ){ continue; }
        while( label !== labelTable[label] ){
          label = labelTable[label];
        }
        blobMap[y][x] = label;
      }
    }
  }

  // The blobs may have unusual labels: [1,38,205,316,etc..]
  // Let's rename them: [1,2,3,4,etc..]
  var uniqueLabels = unique(labelTable);
  var i = 0;
  for( label in uniqueLabels ){
    labelTable[label] = i++;
  }

  // convert the blobs to the minimized labels
  for(y=0; y<ySize; y++){
    for(x=0; x<xSize; x++){
      label = blobMap[y][x];
      blobMap[y][x] = labelTable[label];
    }
  }

  // Return the blob data:
  return blobMap;

};


function unique(arr){
/// Returns an object with the counts of unique elements in arr
/// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

    var value, counts = {};
    var i, l = arr.length;
    for( i=0; i<l; i+=1) {
        value = arr[i];
        if( counts[value] ){
            counts[value] += 1;
        }else{
            counts[value] = 1;
        }
    }

    return counts;
}