var Extras = function(){
  this.names = [ 'health','acceleration','bullet-speed','life','shield',
                 'shot','shot-angle','shot-length','shot-steangth',
                 'recharge-speed','rotation-speed','rocket'];
  this.levels = {}
  this.costs = {}
  this._costs_values_raw = [
    [ 10, 20, 40, 80, 160 ],
    [ 100, 200, 400, 800, 1000],
    [ 200, 400, 800, 1600, 5000],
    [ 500, 500, 1000, 2000, 10000, 20000, 50000, 100000, 500000, 1000000],
    [ 100, 200, 500, 1000, 5000],
    [ 1000, 2000, 5000, 10000, 20000],
    [ 100, 200, 400, 400, 400],
    [ 400, 800, 1600, 5000, 10000],
    [ 1000, 2000, 5000, 10000, 20000],
    [ 500, 500, 1000, 1000, 5000],
    [ 100, 200, 600, 1000, 5000],
    [ 500, 1000, 4000, 6000, 10000],
  ];

  this.init = function(){
    for(var i=0;i<this.names.length;i++){
      this.levels[this.names[i]] = 0;
      this.costs[this.names[i]] = this._costs_values_raw[i];
    }
  }
  
  this.init();
};