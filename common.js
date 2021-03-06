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
    return [1].concat(digits)
  }

  function binary(i){
    return i.toString(2).split('').map(function(d){return parseInt(d)})
  }

  function manchester(digits){
    var encoded = new Array(digits.length*2)
    for(var i = 0; i < digits.length*2; i++){
      encoded[i] = ((i+1)%2) ^ digits[Math.floor(i/2)]
    }
    return encoded
  }

  function unpadding(digits){
    return digits.slice(1)
  }

  function unbinary(digits){
    var str = digits.map(function(d){return d ? '1': '0'}).join('');
    return parseInt(str, 2)
  }

  function unmanchester(digits){
    var decoded = new Array(digits.length/2)
    for(var i = 0; i < digits.length/2; i++){
      decoded[i] = !digits[i*2]
    }
    return decoded
  }

  // expose for testing
  PP.encodingHelpers = {
    padding : padding,
    binary : binary,
    manchester : manchester,
    unpadding : unpadding,
    unbinary : unbinary,
    unmanchester : unmanchester
  }


  // Detection functions

  PP.Transitions = function(threshold){
    this.prior = this.priorT = null;
    this.threshold = threshold;
  }

  PP.Transitions.prototype.add = function(value, timestamp){
    var state = value > this.threshold;
    if(this.prior !== state){
      if(this.prior === null){
        this.prior = state;
        this.priorT = timestamp;
      } else {
        var t = this.priorT + ((timestamp - this.priorT)/2);
        this.prior = state;
        this.priorT = timestamp;
        return [state ? 1: 0, ~~t]
      }
    }

    this.priorT = timestamp;
  }


  // deltas are either short, long, or weird,
  // would be much cooler if it used FFT
  PP.PhaseDetector = function(){
    this.period = null;
    this.lastTime = null;
    this.total = 0;
    this.count = 0;
  }

  // detects the period length of a manchester 
  // encoded signal.  Not very robust or correct
  // deltas are either short, long, or weird
  PP.PhaseDetector.prototype.add = function(value, timestamp){
    if(this.lastTime === null){
      this.lastTime = timestamp;
      return;
    }

    var time = timestamp - this.lastTime;
    this.total += ~~(time + (time/2))
    this.count += 2;
    this.period = this.total / this.count;

    this.lastTime = timestamp;
  }


  
  PP.BinaryDecoder = function(period){
    this.period = period;
    this.lastTime = null;
    this.result = [];
  }

  PP.BinaryDecoder.prototype.add = function(value, timestamp){
    if(this.lastTime === null) {
      this.lastTime = timestamp;
      return
    }

    var time = timestamp - this.lastTime;
    var lastVal = value ? 0 : 1;

    var digits = Math.round(time/this.period);

    for(var i = 0; i < digits; i++){
      this.result.push(lastVal)
    }

    this.lastTime = timestamp;
  }



  // full on decoder, takes the grey values and outputs 
  // the id
  PP.Decoder = function(threshold, period){
    this.transitionDetector = new PP.Transitions(threshold);
    this.phaseDetector = new PP.PhaseDetector();
    this.binaryDecoder = new PP.BinaryDecoder(1000/7);// TODO - dynamic
  }

  PP.Decoder.prototype.add = function(value, timestamp){
    var t = this.transitionDetector.add(value, timestamp)
    if(t){
      this.phaseDetector.add(t[0], t[1])
      // console.log("detected phase", this.phaseDetector.period)

      this.binaryDecoder.add(t[0], t[1])
      // console.log("binary code",this.binaryDecoder.result)
    }
  }

  global.PP = PP;
})(this)

// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);




// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());