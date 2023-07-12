// Maximum degree based on Kruskal's Algorithm

export const MaximumDegree = (
  graph,
  maxDegree
): [number[][], number, boolean] => {
  // Create a union-find data structure to keep track of connected components
  const parent = []
  for (let i = 0; i < graph.length; i++) {
    parent[i] = i
  }

  // Create a function to find the parent of a vertex in the union-find data structure
  // e.g. parent of [2] = 1, hence parent[2] = 1
  const find = (vertex) => {
    if (parent[vertex] !== vertex) {
      parent[vertex] = find(parent[vertex])
    }
    return parent[vertex]
  }

  // Create a function to merge two connected components in the union-find data structure
  const merge = (vertex1, vertex2) => {
    const root1 = find(vertex1)
    const root2 = find(vertex2)
    parent[root2] = root1
  }

  const getDegree = (edges, vertex) => {
    let degree = 0
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].from === vertex || edges[i].to === vertex) {
        degree++
      }
    }
    return degree
  }

  const createMatrix = (
    minimumSpanningTree,
    graph
  ): [number[][], number, boolean] => {
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
  const edges = []
  for (let i = 0; i < graph.length; i++) {
    for (let j = i + 1; j < graph.length; j++) {
      if (graph[i][j] !== 0) {
        edges.push({ from: i, to: j, weight: graph[i][j] })
      }
    }
  }
  edges.sort((a, b) => a.weight - b.weight)

  // Iterate through the edges and add them to the minimum spanning tree if they connect two disjoint sets
  for (let i = 0; i < edges.length; i++) {
    const { from, to, weight } = edges[i]
    if (
      // Check if they end up to the same parent to avoid creating loops
      find(from) !== find(to) &&
      // Check if the maximum degree of either of the nodes has not been reached yet
      getDegree(minimumSpanningTree, from) < maxDegree &&
      getDegree(minimumSpanningTree, to) < maxDegree
    ) {
      // Create an edge linking the two edges
      merge(from, to)
      // Push it to the minimumSpanningTree object
      minimumSpanningTree.push({ from, to, weight })
    }
  }
  return createMatrix(minimumSpanningTree, graph)
}
