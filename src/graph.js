/**
 * This is how the graph is currently setup to link together: 
 * BOX1
 *  |
 * BOX2 - BOX3
 *         |
 *        BOX4 - BOX5
 *                |
 *               BOX6
 */
export default function generateRandomMaze(squareSize) {
    const NUMBER_OF_FACES = 6;
    const CELLS_IN_FACE = squareSize * squareSize;

    const vertices = [];
    for (let face = 0; face < NUMBER_OF_FACES; face++) {
        for (let cell = 0; cell < CELLS_IN_FACE; cell++) {
            const trueCell = cell + face * CELLS_IN_FACE;
            const edges = calculateEdges(face, trueCell, squareSize);
            const cellVertix = new vertix(trueCell, edges, face, squareSize); 
            vertices.push(cellVertix);
        }
    }
    return randomizeMaze(vertices, squareSize);
}

function randomizeMaze(vertices, squareSize) {
    const verticeStack = [];
    const visitedEdges = new Array(vertices.length).fill(false);
    let previousVertixIndex  
    verticeStack.push({to: 0/*Math.floor(Math.random() * vertices.length)*/, from: null});
    while(verticeStack.length) {
        const stackPop = verticeStack.pop();
        const currentVertixIndex = stackPop.to;
        previousVertixIndex = stackPop.from;

        if (currentVertixIndex > vertices.length -1 || visitedEdges[currentVertixIndex]) {
          continue;
        }
        
        const currentVertix = vertices[currentVertixIndex];
        visitedEdges[currentVertix.index] = true;

        if (typeof(previousVertixIndex) == 'number') {
          if (shouldRemoveWall(currentVertix.face, currentVertix.index, previousVertixIndex, squareSize) || true) {
            currentVertix.toggleWallWithVertix(previousVertixIndex, squareSize);
            vertices[previousVertixIndex].toggleWallWithVertix(currentVertix.index, squareSize);
          }
        }

        const totalEdges = currentVertix.edges.length;
        const edges = currentVertix.edges.slice();

        for (let edge = 0; edge < totalEdges; edge++) {
          const randomEdge = Math.floor(Math.random() * edges.length);
          if (visitedEdges[edges[randomEdge]]) {
            edges.splice(randomEdge, 1); 
          } else {
            const removedEdge = edges.splice(randomEdge, 1);
            verticeStack.push({to: removedEdge[0], from: currentVertix.index});
          }
        }
    } 
    return vertices;
}

function shouldRemoveWall(face, index, previousVertixIndex, squareSize) {
  if (face === 0) {
    return true;
  } else if (face === 1) {
    return true;
  } else if (face === 2) {
    return true;//!isFirstRow(index, face, squareSize) && !isRowStart(index, face, squareSize);
  } else if (face === 3) {
    return true;//!isFirstRow(index, face, squareSize) && !isRowStart(index, face, squareSize);
  } else if (face === 4) {
    return true;//!isFirstRow(index, face, squareSize)  && !isRowStart(index, face, squareSize)  && !isRowEnd(index, face, squareSize);
  } else {
    return true;//!isFirstRow(index, face, squareSize) && !isLastRow(index, face, squareSize) && !isRowStart(index, face, squareSize) && !isRowEnd(index, face, squareSize);
  } 
}

function isFirstRow(index, face, squareSize) {
  return index - face * squareSize * squareSize < squareSize;
}

function isLastRow(index, face, squareSize) {
  return index - face * squareSize * squareSize >= squareSize * squareSize - squareSize;
}

function isRowStart(index, face, squareSize) {
  return index % squareSize === 0;
}

function isRowEnd(index, face, squareSize) {
  return (index + 1) % squareSize === 0;
}

function calculateLeftIndex(index, squareSize) {
  const corespondingIndex = index - (squareSize * squareSize);
  const colPosition = index % squareSize;
  const oppositePosition = squareSize - colPosition - 1;

  return corespondingIndex - colPosition + oppositePosition;
}

function calculateRightIndex(index, squareSize) {
  const corespondingIndex = index + (squareSize * squareSize);
  const colPosition = index % squareSize;
  const oppositePosition = squareSize - colPosition - 1;

  return corespondingIndex - colPosition + oppositePosition;
}

function calculateEdges(face, index, squareSize) {
  // Odd indexed faces will have vertices above and to the right
  // Even indexed faces will have vertices below and to the left 

  // Cell above: index - column > 0 && 
  // Cell below: index + column < 
  const TOTAL_VERTICES = squareSize * squareSize * 6;
  const edges = [];
  if (face === 0) {
    // Cell left: index - 1 && 
    if (!isRowStart(index, face, squareSize)) {
      edges.push(index - 1);
    } 
    // Cell right: only connected if not end of row
    if (!isRowEnd(index, face, squareSize)) {
      edges.push(index + 1); 
    }
    // Cell above: only connected if not zero
    if (!isFirstRow(index, face, squareSize)) {
      edges.push(index - squareSize); 
    }
    // Cell down: always happens)
    edges.push(index + squareSize); 
  } else if (face === 5) {
    if (!isRowStart(index, face, squareSize)) {
      edges.push(index - 1);
    } 
    if (!isRowEnd(index, face, squareSize)){
      edges.push(index + 1); 
    }
    edges.push(index - squareSize);
    if (!isLastRow(index, face, squareSize)) {
      edges.push(index + squareSize);
    }
  } else if (face % 2 === 0) {
    // Special config here not linear anymore
    if (!isRowStart(index, face, squareSize)) {
      edges.push(index - 1);
    } else {
      edges.push(calculateLeftIndex(index, squareSize));
    }
    if (!isRowEnd(index, face, squareSize)) {
      edges.push(index + 1);
    } 
    if (!isFirstRow(index, face, squareSize)) {
      edges.push(index - squareSize); 
    }
    edges.push(index + squareSize);
  } else {
    // UP AND RIGHT 
    if (!isRowStart(index, face, squareSize)) {
      edges.push(index - 1);
    }
    if (!isRowEnd(index, face, squareSize)) {
      edges.push(index + 1);
    } else {
      edges.push(calculateRightIndex(index, squareSize));
    }
    edges.push(index - squareSize);
    if (!isLastRow(index, face, squareSize)) {
      edges.push(index + squareSize);
    }
  }
  return edges;
}

class vertix {
  constructor(index, edges, face, squareSize) {
    this.index = index;
    this.edges = edges || []; 
    this.face = face;

    let up = true, down = true, right = true, left = true;

    /*if (face === 1) {
      up = index - squareSize*squareSize*face > squareSize ? true : false; 
    } else if (face == 2) {
      up = index - squareSize*squareSize*face > squareSize ? true : false;  
      left = index % squareSize !== 0 ? true : false;
    } else if (face === 3) {
      up = index - squareSize*squareSize*face > squareSize ? true : false;  
      left = index % squareSize !== 0 ? true : false;
    } else if (face === 4) {
      up = index - squareSize*squareSize*face > squareSize ? true : false;  
      right = (index + 1 % squareSize) !== 0 ? true : false; 
      left = index % squareSize !== 0 ? true : false;
    } else if (face === 5) {
      up = true;
      down = true;
      right = false;
      left = false;
      }*/

    this.walls = {
      up: up,
      down: down,
      right: right,
      left: left
    };
  }

  getEdges = () => {
    return this.edges; 
  } 
  getIndex = () => {
    return this.index; 
  }
  addEdge = (edge) => {
    if (edges.indexOf(edge) < 0) {
      this.edges.push(edge); 
      return true;
    }
    else {
      return false
    }
  }
  toggleWallWithVertix = (absoluteIndex, squareSize) => {
    if (this.index === 109) {
      debugger
    }
    if (absoluteIndex - squareSize === this.index) {
      this.walls.down = false;
    } else if (absoluteIndex + squareSize === this.index) {
      this.walls.up = false;
    } else if (absoluteIndex - 1 === this.index) {
      this.walls.right = false;
    } else if (absoluteIndex + 1 === this.index){
      this.walls.left = false;
    } else if (absoluteIndex - (squareSize - 1)  + (squareSize * squareSize) - this.index === 0) {
      this.walls.left = false; 
    } else if (absoluteIndex + (squareSize - 1) - (squareSize * squareSize) - this.index === 0) {
      this.walls.right = false; 
    }
  }
}

