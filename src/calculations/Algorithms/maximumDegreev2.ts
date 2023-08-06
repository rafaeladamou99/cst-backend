// Maximum degree V2 based on Kruskal's Algorithm

export const MaximumDegreeV2 = (
  graph,
  maxDegree
): [number[][], number, boolean] => {
  const groupOfConnections: Set<number>[] = []
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

  const graphSize = graph.length

  // Create an array to store the edges of the minimum spanning tree
  const minimumSpanningTree = []

  // PQ
  let PQ = []

  //Degree per node
  const degreePerNode = new Array(graphSize).fill(0)

  //Edges per node
  const edgesPerNode = []

  // Create a union-find data structure to keep track of connected components
  const parent = []
  for (let k = 0; k < graphSize; k++) {
    edgesPerNode.push({ node: k, edges: [] })
    groupOfConnections.push(new Set([k]))
    parent[k] = k
  }

  // create a structure {node: index, edges: [{from: index, to: index, weight: number}]}

  for (let i = 0; i < graphSize - 1; i++) {
    for (let j = i + 1; j < graphSize; j++) {
      if (graph[i][j] > 0) {
        const edge = { from: i, to: j, weight: graph[i][j] }
        edgesPerNode[i].edges.push(edge)
        edgesPerNode[j].edges.push(edge)
      }
    }
  }

  edgesPerNode.sort((a, b) => a.edges.length - b.edges.length)

  const sortPQ = () => {
    PQ = PQ.sort((a, b) => a.weight - b.weight)
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

  while (
    edgesPerNode.length > 0 &&
    minimumSpanningTree.length + 1 !== graphSize
  ) {
    const newNodes = edgesPerNode
      .shift()
      .edges.sort((a, b) => a.weight - b.weight)
    sortPQ()
    PQ = [...newNodes, ...PQ]
    PQ.some((e, index) => {
      if (
        degreePerNode[e.to] < maxDegree &&
        degreePerNode[e.from] < maxDegree &&
        find(e.from) !== find(e.to)
      ) {
        minimumSpanningTree.push(e)
        degreePerNode[e.to] += 1
        degreePerNode[e.from] += 1
        merge(e.from, e.to)
        PQ.splice(0, index + 1)
        return true
      }
      return false
    })
  }
  return createMatrix(minimumSpanningTree, graph)
}
