const square = [
  [1,8,10,15],
  [12,13,3,6],
  [7,2,16,9],
  [14,11,5,4]
]

const squares = [
  [[1,8,10,15],[12,13,3,6],[7,2,16,9],[14,11,5,4]],
  [[9,6,3,16],[4,15,10,5],[14,1,8,11],[7,12,13,2]],
  [[9,4,5,16],[6,15,10,3],[12,1,8,13],[7,14,11,2]],
  [[12,9,6,7],[1,4,15,14],[13,16,3,2],[8,5,10,11]],
  [[16,3,2,13],[5,10,11,8],[9,6,7,12],[4,15,14,1]],
  [[1,8,13,12],[14,11,2,7],[4,5,16,9],[15,10,3,6]]
]


chooseSquare.addEventListener("change", changeCarpet);
let chosenSquare = 0;  // default carpet/dropdown

function changeCarpet() {
  chosenSquare = 0;
  const [...rows] = document.querySelectorAll(".row");
  rows.map(row => row.innerHTML="");
  console.log(rows);

  console.log(event.target);
  console.log(Event.target.selectedIndex - 1);
  chosenSquare = Event.target.selectedIndex - 1;
  console.log(squares[chosenSquare]);
  
  createCarpet(chosenSquare);
}

// generate initial 4x4 carpet
createCarpet(chosenSquare);



// generate carpet from a given square (the index for the squares array)
function createCarpet(chosenSquare) {
  for ( let r=0; r<16; r++ ) {
    let inner = "";
    for ( let c=0; c<16; c++ ) {
      // inner += `<div class="num">${square[r%4][c%4]}</div>`;
      inner += `<div class="num">${squares[chosenSquare][r%4][c%4]}</div>`;
    }
    carpet.insertAdjacentHTML('beforeend',`
      <div class="row">${inner}</div>
    `);
  }
}







// handle frame dragging
const frame = document.querySelector('#frame');
const mc = new Hammer(frame);
mc.get('pan').set({ 
  direction: Hammer.DIRECTION_ALL, 
  threshold: 0 
});
mc.on('pan', handleDrag);
let lastPosX = 0;
let lastPosY = 0;
let isDragging = false;
function handleDrag(ev) {
  frame.style.borderColor = '#0084ff';
  if (frame.children[0]) {
    frame.children[0].style.display = 'none';
  }
  let elem = ev.target;
  if ( ! isDragging ) {
    isDragging = true;
    lastPosX = elem.offsetLeft;
    lastPosY = elem.offsetTop;
  }
  let posX = ev.deltaX + lastPosX;
  let posY = ev.deltaY + lastPosY;
  elem.style.left = posX + 'px';
  elem.style.top = posY + 'px';
  if (ev.isFinal) {
    // TODO snap to suitable position here ?
    // console.log('current pos',posX,posY);
    // // get coords of carpet on current window
    // const winWidth = window.innerWidth;
    // const winHeight = window.innerHeight;
    // // console.log('window w/h',winWidth,winHeight);
    // const carpetWidth = winWidth > 500 ? 30 * 4 * 4 : 30 * 4 * 2.75;
    // const leftMargin = (winWidth - carpetWidth) / 2;
    // const posXWithinCarpet = posX - leftMargin;
    // // console.log('distance between left of carpet and frame',posXWithinCarpet);
    // const topMargin = 80;
    // const posYWithinCarpet = posY - topMargin;
    // console.log('relative pos',posXWithinCarpet,posYWithinCarpet);
    // console.log(posXWithinCarpet % 30);
    isDragging = false;
    getSquare(posX,posY);
  }
}
// get valuesArray from underneath frame
// if suitable selection display magic line
function getSquare(posX,posY) {
  const nums = document.querySelectorAll('.num');
  let valuesArray = [];
  nums.forEach(n => {
    let leftInRange = n.offsetLeft >= posX;
    let rightInRange = n.offsetLeft+30 <= posX+144;
    let topInRange = n.offsetTop >= posY;
    let bottomInRange = n.offsetTop+30 <= posY+144;
    if (leftInRange && rightInRange && topInRange && bottomInRange) {
      valuesArray.push(parseInt(n.innerText));
    }
  });
  if(valuesArray.length < 16) {
    console.log(valuesArray);
    frame.style.borderColor = 'red';
  } else {
    const coordsObject = getCoords(valuesArray);
    // const svgCode = createQuadraticCurveVertices(coordsObject);
    const svgCode = createPolyline(coordsObject);
    frame.innerHTML = '';
    frame.innerHTML = svgCode;
    frame.classList.add('modal');
  }
}

function getCoords(valuesArray) {
  const coordsObject = {};
  let offset = 0;
  for (let row=0; row < 4; row++) {
    for (let col=0; col < 4; col++) {
      coordsObject[valuesArray[col+offset]] = [col,row];  // x,y
    }
    offset += 4; // increase offset by one row every 4 columns
  }
  return coordsObject;
}

function createPolyline(coordsObject) {
  const sizeInc = 100;
  const w = 4 * sizeInc;
  let coords = 'M';
  for (let i in coordsObject) {
    coords += `${coordsObject[i][0] * sizeInc},${coordsObject[i][1] * sizeInc} `;
  }
  coords += `${coordsObject[1][0] * sizeInc},${coordsObject[1][1] * sizeInc} `;
  return `<svg viewBox='${-2} ${-2} ${w-sizeInc+4} ${w-sizeInc+4}'><path d='${coords}'/></svg>`;
}

function createQuadraticCurveVertices(coordsObject) {
  const sizeInc = 100;
  const w = 4 * sizeInc;
  let fstx = coordsObject[1][0] * sizeInc;
  let fsty = coordsObject[1][1] * sizeInc;
  let sndx = coordsObject[2][0] * sizeInc;
  let sndy = coordsObject[2][1] * sizeInc;
  let fstmx = (fstx + sndx) / 2;
  let fstmy = (fsty + sndy) / 2;
  let coords = `M ${fstmx},${fstmy} `;
  for (let a=1; a <= Object.keys(coordsObject).length; a++) {
    let c1x = coordsObject[a][0] * sizeInc;
    let c1y = coordsObject[a][1] * sizeInc;
    let c2x, c2y, c3x, c3y;
    // next to last
    if (a == (Object.keys(coordsObject).length)) {
      c2x = coordsObject[1][0] * sizeInc;
      c2y = coordsObject[1][1] * sizeInc;
      c3x = coordsObject[2][0] * sizeInc;
      c3y = coordsObject[2][1] * sizeInc;
    // last
    } else if (a == (Object.keys(coordsObject).length - 1)) {
      c2x = coordsObject[a+1][0] * sizeInc;
      c2y = coordsObject[a+1][1] * sizeInc;
      c3x = coordsObject[1][0] * sizeInc;
      c3y = coordsObject[1][1] * sizeInc;
    // all previous
    } else {
      c2x = coordsObject[a+1][0] * sizeInc;
      c2y = coordsObject[a+1][1] * sizeInc;
      c3x = coordsObject[a+2][0] * sizeInc;
      c3y = coordsObject[a+2][1] * sizeInc;
    }
    let m1x = (c1x + c2x) / 2;
    let m1y = (c1y + c2y) / 2;
    let m2x = (c2x + c3x) / 2;
    let m2y = (c2y + c3y) / 2;
    // console.log(c1x, c1y, m1x, m1y, c2x, c2y, m2x, m2y, c3x, c3y);
    coords += `Q ${c2x},${c2y} ${m2x},${m2y} `;
  }
  return `<svg viewBox='${-2} ${-2} ${w-sizeInc+4} ${w-sizeInc+4}'><path d='${coords}'/></svg>`;
}