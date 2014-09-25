(function(global){
  var PP = {};

  // length of each pulse
  PP.pulseLength = 250;

  // pause between messages
  PP.pulseDelay  = 2000;


  // returns a function that will tell us if a pixel should be on/off at
  // a given timestamp

  // TODO - add padding, '0' indistinguishable from '1'
  PP.pulser = function(id){
    var pulses = manchester(binary(id)),
        delay  = PP.pulseDelay,
        length = PP.pulseLength,
        span   = delay + (length * pulses.length);

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