"use strict";

// set_pixel colors a pixel for given x, y coordinates. ImageData (as returned
// by ctx.createImageData()) is a one dimensional array of numbers that's 4
// times longer than the total number of pixels. That is, it's a linear
// representation of the RGBA values for all pixels.
var set_pixel = function(image_data, x, y, color) {
  if (y > image_data.height || x > image_data.width) {
    console.log(`Invalid coordinates x: ${x} y:${y}`);
    return;
  }
  const ix = (y * image_data.width + x) * 4;
  image_data.data[ix] = color[0];
  image_data.data[ix + 1] = color[1];
  image_data.data[ix + 2] = color[2];
  image_data.data[ix + 3] = color[3];
};


// pixel_to_math_range returns a scale function that maps a pixel coordinate
// (e.g. 620) to the mathematical value at that point as defined by the range
// between `start` and `end`.
// start: lowest mathematical value in the dimension (e.g. -1.5)
// end: greatest mathematical value in the dimension (e.g. 1.5)
// pixels: the number of pixels across which to map the mathematical range
// scaler: optional scaler. Set to -1 to flip the mapping. Useful because
// graphs tend to put lower y values at the bottom of the graph whereas
// computer graphics systems tend to put the lower y values at the top of
// the screen.
var pixel_to_math_range = function(start, end, pixels, scaler = 1) {
  const range = Math.max(start, end) - Math.min(start, end);
  return function(pixel_coord){
    return start + scaler * (range/pixels * pixel_coord);
  };
};


var iter_pop_func = function(lambda) {
  let f = function(lambda, x) {
    return lambda * x * (1 - x);
  };

  // Burn the first n values to let the population settle.
  let burn_count = 500;
  let step = 0.5;  // Arbitrary initial pop where 0 < pop < 1
  for (let i = 0; i < burn_count; ++i) {
    step = f(lambda, step)
  }

  // Collect population iterations until the values repeat or some arbitrarily
  // high number. Seems that some lambda values yield infinite population
  // numbers.
  let pops = new Set();
  let pop = step;
  for (let j = 0; j < 480; ++j) {
    pop = f(lambda, pop);
    if (pops.has(pop)) {
      break;
    }
    pops.add(pop);
  }
  return pops;
};

const vert_px = 480;
const vert_top = 4;
const vert_bottom = 0;
const imag_scale = pixel_to_math_range(vert_top, vert_bottom, vert_px, -1);

const horiz_px = 640;
const horiz_right = 4;
const horiz_left = 0;
const horiz_scale = pixel_to_math_range(horiz_left, horiz_right, horiz_px);

const draw_canvas = document.querySelector('#canvas');
draw_canvas.width = horiz_px;
draw_canvas.height = vert_px;
const ctx = draw_canvas.getContext('2d');
const img_data = ctx.createImageData(horiz_px, vert_px);

const GREEN = [0, 255, 0, 255];

// for (let x = 0; x < horiz_px; ++x) {
//   set_pixel(img_data, x, 0, GREEN);
// }
ctx.fillStyle = "black";
ctx.fillRect(0, 0, draw_canvas.width, draw_canvas.height);

var pop;
var lambda;
for (let x = 0; x < horiz_px; ++x) {
  lambda = horiz_scale(x);
  pop = iter_pop_func(lambda);
  pop.forEach(p => {
    set_pixel(img_data, x, Math.round(p * vert_px), GREEN);
  });
}
console.log("finished");
ctx.putImageData(img_data, 0, 0);
