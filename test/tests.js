describe('encoding stuff', function(){

  var h = PP.encodingHelpers;

  it('binaries', function(){
    var from = 42,
        to   = [1, 0, 1, 0, 1, 0];

    h.binary(from)
     .should.eql(to)

    h.unbinary(to)
     .should.eql(from)
  })

  it('paddings', function(){
    var from = [0, 0, 0],
        to   = [1, 0, 0, 0];

    h.padding(from)
     .should.eql(to)

    h.unpadding(to)
     .should.eql(from)
  })

  it('manchesters', function(){
    var from = [1, 1, 0],
        to   = [0, 1, 0, 1, 1, 0];

    h.manchester(from)
     .should.eql(to)

    h.unmanchester(to)
     .should.eql(from)

  })

  it('everythings', function(){
    with(h){
      unbinary(
        unpadding(
          unmanchester(
            manchester(
              padding(
                binary(123456789456123)
              )
            )
          )
        )
      ).should.eql(123456789456123)
    }
  })

})




describe('transitions', function(){
  var transitions, results;
  before(function(){
    transitions = new PP.Transitions(150);
    results = [
      transitions.add(200, 0),
      transitions.add(100, 1),
      transitions.add(100, 2),
      transitions.add(200, 3),
      transitions.add(200, 4),
      transitions.add(100, 5),
      transitions.add(100, 6),
      transitions.add(100, 7),
      transitions.add(200, 8),
      transitions.add(200, 9)
    ];
  })

  it('works', function(){
    results.
      filter(function(f){
        return f
      })
      .should
      .eql([
        // floats
        // [0,0.5],
        // [1,2.5],
        // [0,4.5],
        // [1,7.5]

        // integers
        [0,0],
        [1,2],
        [0,4],
        [1,7]
      ])
  })
})


describe('phase detector', function(){
  var decoder;
  before(function(){

    decoder = new PP.PhaseDetector();

    decoder.add(1, 100)
    decoder.add(0, 200)
  //decoder.add(1, 300)
    decoder.add(1, 400)
    decoder.add(0, 500)
  //decoder.add(0, 600)
    decoder.add(0, 700)
    decoder.add(1, 800)

  })

  it('found the period', function(){
    console.log("---")
    decoder.period.should.be.approximately(100, 5);
  })
})


// generates [1,0,...]
describe('binary decoder', function(){

  var decoder;
  before(function(){

    decoder = new PP.BinaryDecoder(100);

    decoder.add(1, 100)
    decoder.add(0, 200)
  //decoder.add(0, 300)
    decoder.add(1, 400)
    decoder.add(0, 500)
  //decoder.add(0, 600)
  //decoder.add(0, 700)
    decoder.add(1, 800)

  })

  it('decoded the data', function(){
    decoder.result.should.eql([1,0,0,1,0,0,0])
  })

})


xdescribe('decoder', function(){

  var decoder;

  before(function(){
    decoder = new PP.Decoder(150);

    time = 0;

    // repeat signal 3 times
    times(3, function(){

      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        0,1, // markers 01 / 10
        1,0,

        1,0, // 1
        0,1, // 1
        0,1, // 0
        0,1, // 1


        ].forEach(function(digit, i){

        // 10 observations 
        times(10, function(){
          console.log("adding")
          decoder.add(digit ? 200 : 100, time)

          time+=10;
        })
        console.log("T", time)
      })
    })
  })


  xit('finds the min/max values', function(){
    decoder.min.should.approximately(100,2)
    decoder.max.should.approximately(200,2)
  })

  xit('can find the period', function(){

    decoder.period.should.approximately(10,1)

  })


  it("was all cool", function(){
    decoder.result.should.eql([1,1,0,1])
  })


})



function times(i, fn){
  var arr = [];
  while(i > 0){
    arr.unshift(i--)
  }
  return arr.forEach(fn);
}



