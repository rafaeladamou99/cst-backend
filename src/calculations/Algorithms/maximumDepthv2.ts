type Edge = { from: number; to: number; weight: number }

export const MaximumDepthV2 = (
  graph,
  maxDepth
): [number[][], number, boolean] => {
  const nodesAmount = graph.length

  const createMatrix = (minimumSpanningTree): [number[][], number, boolean] => {
    let matrix = []
    let edgeCount = 0
    let weigthSum = 0
    const graphSize = nodesAmount
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

  const findLongestPath = (spanningTree, startNode) => {
    // Create an adjacency list to represent the undirected spanning tree
    const adjacencyList = {}

    // Build the adjacency list from the spanning tree
    for (const edge of spanningTree) {
      const { from, to } = edge
      adjacencyList[from] = adjacencyList[from] || []
      adjacencyList[to] = adjacencyList[to] || []
      adjacencyList[from].push(to)
      adjacencyList[to].push(from)
    }

    let longestPath = []

    // Recursive DFS function to find the longest path
    const dfs = (node, parent, path) => {
      path.push(node)

      if (path.length > longestPath.length) {
        longestPath = [...path]
      }

      for (const neighbor of adjacencyList[node]) {
        if (neighbor !== parent) {
          dfs(neighbor, node, path)
        }
      }

      path.pop()
    }

    // Start the DFS from the given startNode
    dfs(startNode, null, [])

    return longestPath.length - 1
  }

  // Loop through the nodes of the graph.
  // Find the two with the most connections and the lowest avg weight and merge them.
  // push into the pq the nodes they connect to. Get the cheapest for each possible node.

  //   graph.forEach((node, index) => {})

  let startingNode1: number = -1
  let startingNode2: number = -1
  let maxConnectionsAvgWeight = Number.MAX_SAFE_INTEGER
  let maxConnections = 0

  if (maxDepth > 2) {
    for (let i = 0; i < nodesAmount - 1; i++) {
      let iNode = [...graph[i]]
      for (let j = i + 1; j < nodesAmount; j++) {
        let arrayOfEdges = []
        console.log(arrayOfEdges.length)
        let jNode = [...graph[j]]
        if (iNode[j] > 0 && jNode[i] > 0) {
          // get the cheapest, non-zero edge from each node.
          iNode.forEach((edge, index) => {
            if (edge > 0 || jNode[index] > 0) {
              if (edge > 0 && jNode[index] > 0) {
                arrayOfEdges.push(Math.min(edge, jNode[index]))
              } else {
                arrayOfEdges.push(Math.max(edge, jNode[index]))
              }
            }
          })
          // if maxConnections are equal or less do the below
          const sizeOfCombinedEdges = arrayOfEdges.length
          if (sizeOfCombinedEdges >= maxConnections) {
            if (
              sizeOfCombinedEdges > maxConnections ||
              maxConnectionsAvgWeight >
                arrayOfEdges.reduce((acc, edge) => acc + edge, 0) /
                  maxConnections
            ) {
              startingNode1 = i
              startingNode2 = j
              maxConnections = sizeOfCombinedEdges
              maxConnectionsAvgWeight =
                arrayOfEdges.reduce((acc, edge) => acc + edge, 0) /
                maxConnections
            }
          }
        }
      }
    }
  }

  let PQ: Edge[] = []
  const spanningTree: Edge[] = []
  const visited = new Set()
  const leaves = new Set()
  const branches = new Set()

  // adds edges to the PQ
  const addToPQ = (nodes: number[] | number) => {
    if (Array.isArray(nodes)) {
      graph[nodes[0]].forEach((edge1, index) => {
        const edge2 = graph[nodes[1]][index]
        if (
          (edge1 > 0 || edge2 > 0) &&
          nodes[0] !== index &&
          nodes[1] !== index
        ) {
          if (edge1 > 0 && edge1 < edge2) {
            const e: Edge = { from: nodes[0], to: index, weight: edge1 }
            PQ.push(e)
          } else if (edge2 > 0) {
            const e: Edge = { from: nodes[1], to: index, weight: edge2 }
            PQ.push(e)
          }
        }
      })
    } else {
      graph[nodes].forEach((edge, index) => {
        if (edge > 0 && nodes !== index) {
          const e: Edge = { from: nodes, to: index, weight: edge }
          PQ.push(e)
        }
      })
    }
  }

  // cleans PQ from edges that connect already connected nodes
  const cleanPQ = () => {
    PQ = PQ.filter((edge) => !visited.has(edge.from) || !visited.has(edge.to))
  }

  const sortPQ = () => {
    PQ = PQ.sort((a, b) => a.weight - b.weight)
  }

  const mergeEdge = (edge: Edge) => {
    spanningTree.push(edge)
    if (visited.has(edge.to)) {
      addToPQ(edge.from)
      visited.add(edge.from)
      leaves.add(edge.from)
      // remove from leaves if its a leave and add it to branches
      if (leaves.delete(edge.to)) {
        branches.add(edge.to)
      }
    } else {
      addToPQ(edge.to)
      visited.add(edge.to)
      leaves.add(edge.to)
      // remove from leaves if its a leave and add it to branches
      if (leaves.delete(edge.from)) {
        branches.add(edge.from)
      }
    }
    cleanPQ()
    sortPQ()
  }

  addToPQ([startingNode1, startingNode2])
  // add the edge connecting the starting nodes to the spanning Tree
  if (
    graph[startingNode1][startingNode2] < graph[startingNode2][startingNode1]
  ) {
    spanningTree.push({
      from: startingNode1,
      to: startingNode2,
      weight: graph[startingNode1][startingNode2]
    })
  } else {
    spanningTree.push({
      from: startingNode1,
      to: startingNode2,
      weight: graph[startingNode2][startingNode1]
    })
  }
  // add them to the visited nodes set
  visited.add(startingNode1)
  visited.add(startingNode2)
  leaves.add(startingNode1)
  leaves.add(startingNode2)
  cleanPQ()
  sortPQ()

  while (PQ.length > 0 && spanningTree.length + 1 !== nodesAmount) {
    const edge = PQ.shift()

    if (branches.has(edge.to) || branches.has(edge.from)) {
      mergeEdge(edge)
    } else if (leaves.has(edge.to) || leaves.has(edge.from)) {
      if (leaves.has(edge.to)) {
        findLongestPath(spanningTree, edge.to) < maxDepth && mergeEdge(edge)
      } else {
        findLongestPath(spanningTree, edge.from) < maxDepth && mergeEdge(edge)
      }
    }
  }

  return createMatrix(spanningTree)
}
