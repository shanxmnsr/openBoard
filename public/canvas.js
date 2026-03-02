// let canvas = document.querySelector("canvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// let pencilColor = document.querySelectorAll(".pencil-color");
// let pencilWidthElem = document.querySelector(".pencil-width");
// let eraserWidthElem = document.querySelector(".eraser-width");
// let download = document.querySelector(".download");
// let redo = document.querySelector(".redo");
// let undo = document.querySelector(".undo");

// let penColor = "red";
// let eraserColor = "white";
// let penWidth = pencilWidthElem.value;
// let eraserWidth = eraserWidthElem.value;

// let undoRedoTracker = []; // Data
// let track = 0; // represent which action from tracker array

// let mouseDown = false;

// // API
// let tool = canvas.getContext("2d");

// tool.strokeStyle = penColor;
// tool.lineWidth = penWidth;

// // mousedown -> start new path, mousedown -> path fill (graphics)
// canvas.addEventListener("mousedown", (e) => {
//   mouseDown = true;
//   let data = {
//     x: e.clientX,
//     y: e.clientY,
//   }

//   // send data to server
//   socket.emit("beginPath", data);
// });

// canvas.addEventListener("mousemove", (e) => {
//   if (mouseDown) {
//     let data = {
//       x: e.clientX,
//       y: e.clientY,
//       color: eraserFlag ? eraserColor : penColor,
//       width: eraserFlag ? eraserWidth : penWidth,
//     }
//     socket.emit("drawStroke", data);
//   }
    
// });

// canvas.addEventListener("mouseup", (e) => {
//   mouseDown = false;

//   let url = canvas.toDataURL();
//   undoRedoTracker.push(url);
//   track = undoRedoTracker.length - 1;
// });

// // UNDONE
// undo.addEventListener("click", (e) => {
//   if (track > 0) track--;
//   // track action
//   let data = {
//     trackValue: track,
//     undoRedoTracker,
//   };
//   socket.emit("redoUndo", data);
  
// });

// // REDONE
// redo.addEventListener("click", (e) => {
//   if (track < undoRedoTracker.length - 1) track++;
//   // track action
//   let data = {
//     trackValue: track,
//     undoRedoTracker,
//   };
//   socket.emit("undoRedo", data);
// });

// function undoRedoCanvas(trackObj) {
//   track = trackObj.trackValue;
//   undoRedoTracker = trackObj.undoRedoTracker;

//   let url = undoRedoTracker[track];
//   let img = new Image(); //new image reference element
//   img.src = url;
//   img.onload = (e) => {
//     tool.drawImage(img, 0, 0, canvas.width, canvas.height);
//   };
// }

// function beginPath(strokeObj) {
//   tool.beginPath();
//   tool.moveTo(strokeObj.x, strokeObj.y);
// }

// function drawStroke(strokeObj) {
//   tool.strokeStyle = strokeObj.color;
//   tool.lineWidth = strokeObj.width;
//   tool.lineTo(strokeObj.x, strokeObj.y);
//   tool.stroke();
// }

// // PENCIL COLOR
// pencilColor.forEach((colorElem) => {
//   colorElem.addEventListener("click", (e) => {
//     let color = colorElem.classList[0];
//     penColor = color;
//     tool.strokeStyle = penColor;
//   });
// });

// // PENCIL WIDTH
// pencilWidthElem.addEventListener("change", (e) => {
//   penWidth = pencilWidthElem.value;
//   tool.lineWidth = penWidth;
// });

// // ERASER
// eraserWidthElem.addEventListener("change", (e) => {
//   eraserWidth = eraserWidthElem.value;
//   tool.lineWidth = eraserWidth;
// });
// eraser.addEventListener("click", (e) => {
//   if (eraserFlag) {
//     tool.strokeStyle = eraserColor;
//     tool.lineWidth = eraserWidth;
//   } else {
//     tool.strokeStyle = penColor;
//     tool.lineWidth = penWidth;
//   }
// });

// // DOWNLOAD
// download.addEventListener("click", (e) => {
//   let url = canvas.toDataURL();

//   let a = document.createElement("a");
//   a.href = url;
//   a.download = "board.jpg";
//   a.click();
// });

// // we need to know that whether the server is connected to every computer or not 
// // including me
// socket.on("beginPath", (data) => {
//   // data -> data from server
//   beginPath(data);

// })
// socket.on("drawStroke", (data) => {
//   drawStroke(data);
// })
// socket.on("redoUndo", (data) => {
//   undoRedoCanvas(data);
// })









let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tool = canvas.getContext("2d");
tool.lineCap = "round";
tool.lineJoin = "round";

let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let mouseDown = false;

let strokes = [];        // All strokes
let undoneStrokes = [];  // Redo stack
let currentStroke = null;

// =============================
// MOUSE EVENTS
// =============================

canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;

  currentStroke = {
    points: [{ x: e.clientX, y: e.clientY }],
    color: penColor,
    width: eraserFlag ? eraserWidth : penWidth,
    isEraser: eraserFlag,
  };
});

canvas.addEventListener("mousemove", (e) => {
  if (!mouseDown) return;

  let point = { x: e.clientX, y: e.clientY };
  currentStroke.points.push(point);

  drawLineSegment(
    currentStroke.points[currentStroke.points.length - 2],
    point,
    currentStroke
  );
});

canvas.addEventListener("mouseup", () => {
  if (!mouseDown) return;

  mouseDown = false;
  strokes.push(currentStroke);
  undoneStrokes = []; // clear redo stack
});

// =============================
// DRAW FUNCTION
// =============================

function drawLineSegment(from, to, stroke) {
  if (stroke.isEraser) {
    tool.globalCompositeOperation = "destination-out";
  } else {
    tool.globalCompositeOperation = "source-over";
  }

  tool.strokeStyle = stroke.color;
  tool.lineWidth = stroke.width;

  tool.beginPath();
  tool.moveTo(from.x, from.y);
  tool.lineTo(to.x, to.y);
  tool.stroke();
}

// =============================
// REDRAW WHOLE CANVAS
// =============================

function redrawCanvas() {
  tool.clearRect(0, 0, canvas.width, canvas.height);

  strokes.forEach((stroke) => {
    for (let i = 1; i < stroke.points.length; i++) {
      drawLineSegment(
        stroke.points[i - 1],
        stroke.points[i],
        stroke
      );
    }
  });
}

// =============================
// UNDO
// =============================

undo.addEventListener("click", () => {
  if (strokes.length === 0) return;

  let lastStroke = strokes.pop();
  undoneStrokes.push(lastStroke);

  redrawCanvas();
});

// =============================
// REDO
// =============================

redo.addEventListener("click", () => {
  if (undoneStrokes.length === 0) return;

  let stroke = undoneStrokes.pop();
  strokes.push(stroke);

  redrawCanvas();
});

// =============================
// PENCIL COLOR
// =============================

pencilColor.forEach((colorElem) => {
  colorElem.addEventListener("click", () => {
    penColor = colorElem.classList[0];
  });
});

// =============================
// WIDTH CONTROLS
// =============================

pencilWidthElem.addEventListener("change", () => {
  penWidth = pencilWidthElem.value;
});

eraserWidthElem.addEventListener("change", () => {
  eraserWidth = eraserWidthElem.value;
});

// =============================
// DOWNLOAD
// =============================

download.addEventListener("click", () => {
  let url = canvas.toDataURL();
  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});
