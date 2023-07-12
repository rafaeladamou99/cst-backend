// Maximum leaves based on Kruskal's Algorithm
// FINAL SOLUTION

export const MaximumLeaves = (
  graph,
  maxLeaves
): [number[][], number, boolean] => {
  // Create a union-find data structure to keep track of connected components

  const groupsOfConnectedVertices = []

  // FIX THIS. NO NEED TO CALL TWICE
  const checkToMerge = (vertexA, vertexB, checkOnly = false) => {
    if (vertexA === vertexB) {
      return false
    }
    // check if no groupsOfConnectedVertices have been formed
    if (groupsOfConnectedVertices.length === 0) {
      !checkOnly && groupsOfConnectedVertices.push(new Set([vertexA, vertexB]))
    } else {
      // find the index of each vertice's set. If it doesn't belong to a set then -1 is returned.
      const indexOfSetContainingA = groupsOfConnectedVertices.indexOf(
        groupsOfConnectedVertices.find((set) => set.has(vertexA))
      )
      const indexOfSetContainingB = groupsOfConnectedVertices.indexOf(
        groupsOfConnectedVertices.find((set) => set.has(vertexB))
      )
      // check whether the vertices belong to the same set. If the set index is anything but -1 then exit the function.
      if (indexOfSetContainingA === indexOfSetContainingB) {
        if (indexOfSetContainingA !== -1) {
          return false
        }
        // Create a new Set containing both vertices.
        !checkOnly &&
          groupsOfConnectedVertices.push(new Set([vertexA, vertexB]))
      }
      // if the vertices set's indices are not the same then
      else if (!checkOnly) {
        // if a vertice does not belong to a set then add it to the other's set
        if (indexOfSetContainingA === -1) {
          !checkOnly &&
            groupsOfConnectedVertices[indexOfSetContainingB].add(vertexA)
        } else if (indexOfSetContainingB === -1) {
          !checkOnly &&
            groupsOfConnectedVertices[indexOfSetContainingA].add(vertexB)
        }
        // else add the set of the vertice with the lowest length to the other vertice's set
        else {
          const tempSet = new Set([
            ...groupsOfConnectedVertices[indexOfSetContainingA],
            ...groupsOfConnectedVertices[indexOfSetContainingB]
          ])
          if (
            groupsOfConnectedVertices[indexOfSetContainingA].size >=
            groupsOfConnectedVertices[indexOfSetContainingB]
          ) {
            groupsOfConnectedVertices[indexOfSetContainingA] = new Set(tempSet)
            groupsOfConnectedVertices.splice(indexOfSetContainingB, 1)
          } else {
            groupsOfConnectedVertices[indexOfSetContainingB] = new Set(tempSet)
            groupsOfConnectedVertices.splice(indexOfSetContainingA, 1)
          }
        }
      }
    }
    return true
  }

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

  // Create an array to store the edges of the minimum spanning tree
  const minimumSpanningTree = []

  // Sort the edges by weight and remove self loops
  let edges = []
  const currentLeaves = Array.from({ length: graph.length }, () => 0)
  for (let i = 0; i < graph.length; i++) {
    const nodesEdgesCount = graph[i].filter((e) => e !== 0).length
    if (nodesEdgesCount === 0) {
      // BREAKKKKKKKK
      // return 'Graph is disconnected'
      return [[], 0, false]
    } else if (nodesEdgesCount === 1) {
      const index = graph[i].findIndex((e) => e !== 0)
      minimumSpanningTree.push({ from: i, to: index, weight: graph[i][index] })
      currentLeaves[i] = 1
      continue
    }
    for (let j = i + 1; j < graph.length; j++) {
      if (graph[i][j] !== 0) {
        edges.push({ from: i, to: j, weight: graph[i][j] })
      }
    }
  }
  edges.sort((a, b) => a.weight - b.weight)

  const countLeaves = (arr) => {
    let leaves = 2
    arr.forEach((element) => {
      if (element > 2) {
        leaves += element - 2
      }
    })
    return leaves
  }

  if (countLeaves(currentLeaves) > maxLeaves) {
    // return 'Graph leaves more than the constraint'
    return [[], 0, false]
  }

  // Iterate through the edges and add them to the minimum spanning tree if they connect two disjoint sets
  for (let i = 0; i < edges.length; i++) {
    const { from, to, weight } = edges[i]
    // check if merging them does not create a cycle. If it does not, then add them to the same set of connected vertices.
    if (checkToMerge(from, to, true)) {
      // Push it to the minimumSpanningTree object
      if (countLeaves(currentLeaves) < maxLeaves) {
        minimumSpanningTree.push({ from, to, weight })
        currentLeaves[from] += 1
        currentLeaves[to] += 1
        checkToMerge(from, to)
      } else if (countLeaves(currentLeaves) === maxLeaves) {
        if (currentLeaves[from] <= 1 && currentLeaves[to] <= 1) {
          minimumSpanningTree.push({ from, to, weight })
          currentLeaves[from] += 1
          currentLeaves[to] += 1
          checkToMerge(from, to)
        }
      }
    }
  }
  return createMatrix(minimumSpanningTree)
}
