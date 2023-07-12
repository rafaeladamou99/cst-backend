// Prims's Algorithm

export const PrimsMST = (graph): [number[][], number, boolean] => {
  // Create a union-find data structure to keep track of connected components

  // const groupsOfConnectedVertices = []

  // FIX THIS. NO NEED TO CALL TWICE
  // const checkToMerge = (vertexA, vertexB, checkOnly = false) => {
  //   if (vertexA === vertexB) {
  //     return false
  //   }
  //   // check if no groupsOfConnectedVertices have been formed
  //   if (groupsOfConnectedVertices.length === 0) {
  //     !checkOnly && groupsOfConnectedVertices.push(new Set([vertexA, vertexB]))
  //   } else {
  //     // find the index of each vertice's set. If it doesn't belong to a set then -1 is returned.
  //     const indexOfSetContainingA = groupsOfConnectedVertices.indexOf(
  //       groupsOfConnectedVertices.find((set) => set.has(vertexA))
  //     )
  //     const indexOfSetContainingB = groupsOfConnectedVertices.indexOf(
  //       groupsOfConnectedVertices.find((set) => set.has(vertexB))
  //     )
  //     // check whether the vertices belong to the same set. If the set index is anything but -1 then exit the function.
  //     if (indexOfSetContainingA === indexOfSetContainingB) {
  //       if (indexOfSetContainingA !== -1) {
  //         return false
  //       }
  //       // Create a new Set containing both vertices.
  //       !checkOnly &&
  //         groupsOfConnectedVertices.push(new Set([vertexA, vertexB]))
  //     }
  //     // if the vertices set's indices are not the same then
  //     else if (!checkOnly) {
  //       // if a vertice does not belong to a set then add it to the other's set
  //       if (indexOfSetContainingA === -1) {
  //         !checkOnly &&
  //           groupsOfConnectedVertices[indexOfSetContainingB].add(vertexA)
  //       } else if (indexOfSetContainingB === -1) {
  //         !checkOnly &&
  //           groupsOfConnectedVertices[indexOfSetContainingA].add(vertexB)
  //       }
  //       // else add the set of the vertice with the lowest length to the other vertice's set
  //       else {
  //         const tempSet = new Set([
  //           ...groupsOfConnectedVertices[indexOfSetContainingA],
  //           ...groupsOfConnectedVertices[indexOfSetContainingB]
  //         ])
  //         if (
  //           groupsOfConnectedVertices[indexOfSetContainingA].size >=
  //           groupsOfConnectedVertices[indexOfSetContainingB]
  //         ) {
  //           groupsOfConnectedVertices[indexOfSetContainingA] = new Set(tempSet)
  //           groupsOfConnectedVertices.splice(indexOfSetContainingB, 1)
  //         } else {
  //           groupsOfConnectedVertices[indexOfSetContainingB] = new Set(tempSet)
  //           groupsOfConnectedVertices.splice(indexOfSetContainingA, 1)
  //         }
  //       }
  //     }
  //   }
  //   return true
  // }

  const createMatrix = (minimumSpanningTree): [number[][], number, boolean] => {
    let matrix = []
    let edgeCount = 0
    let weigthSum = 0
    const graphSize = graph.length
    for (let i = 0; i < graphSize; i++) {
      matrix[i] = []
      for (let j = 0; j < graphSize; j++) {
        matrix[i][j] = 0
      }
    }
    for (let k = 0; k < minimumSpanningTree.length; k++) {
      let node1 = minimumSpanningTree[k].from
      let node2 = minimumSpanningTree[k].to
      let weight = minimumSpanningTree[k].weight
      weigthSum += weight
      edgeCount += 1
      matrix[node1][node2] = weight
      matrix[node2][node1] = weight
    }
    return [matrix, weigthSum, edgeCount + 1 === graphSize]
  }

  // Create an array to store the edgesGroups of the minimum spanning tree
  const minimumSpanningTree = []

  // Sort the edgesGroups by weight and remove self loops
  const edgesGroups = Array.from({ length: graph.length }, () => [])
  for (let i = 0; i < graph.length; i++) {
    for (let j = i + 1; j < graph.length; j++) {
      if (graph[i][j] !== 0) {
        const e = { from: i, to: j, weight: graph[i][j] }
        edgesGroups[i].push(e)
        edgesGroups[j].push(e)
      }
    }
  }

  const randomNumber: number = Math.floor(Math.random() * graph.length)
  let edgesPQ = [...edgesGroups[randomNumber]]
  const visited = new Set([randomNumber])

  const sortPQ = () => {
    edgesPQ.sort((a, b) => a.weight - b.weight)
  }

  while (
    edgesPQ.length !== 0 &&
    minimumSpanningTree.length + 1 !== graph.length
  ) {
    sortPQ()
    let counter = 0
    edgesPQ.some((e) => {
      if (!(visited.has(e.from) && visited.has(e.to))) {
        minimumSpanningTree.push(e)
        // if (visited.indexOf(e.from) === -1) {
        visited.add(e.from)
        edgesPQ.push(...edgesGroups[e.from])
        // } else {
        visited.add(e.to)
        edgesPQ.push(...edgesGroups[e.to])
        // }
        counter += 1
        return true
      }
      counter += 1
      return false
    })
    edgesPQ = edgesPQ.slice(counter)
  }
  return createMatrix(minimumSpanningTree)
}
