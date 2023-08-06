export const MaximumDepth = (
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

  // Sort the edgesGroups by weight and remove self loops
  const edgesGroups = Array.from({ length: nodesAmount }, () => [])
  let minAvgWeight = Number.MAX_VALUE
  let maxAmountOfEdges = 0
  let startingNode = 0
  let startingNode2 = 0

  // select starting node and construct the edgesGroups
  for (let i = 0; i < nodesAmount; i++) {
    // set starting vertex according to the lowest avg cost per node

    // filtered Edges that have weight more than 0 in the form of filteredEdges = [{index: i, weight: X}]
    const filteredEdges = graph[i]
      .map((weight, index) => {
        if (weight > 0) {
          const edge = { from: i, to: index, weight: weight }
          const unique = edgesGroups[i].findIndex(
            (e) =>
              e.weight === edge.weight &&
              ((e.from === edge.from && e.to === edge.to) ||
                (e.to === edge.from && e.from === edge.to))
          )
          if (unique === -1) {
            edgesGroups[i].push(edge)
            edgesGroups[index].push(edge)
          }
          return { index, weight }
        }
      })
      .filter((e) => e !== undefined)

    const filteredEdgesAmount = filteredEdges.length

    // set as starting node the node with the most edge connections
    if (maxDepth <= 2) {
      if (filteredEdgesAmount > maxAmountOfEdges) {
        minAvgWeight =
          filteredEdges.reduce((acc, edge) => acc + edge.weight, 0) /
          filteredEdgesAmount
        startingNode = i
        maxAmountOfEdges = filteredEdgesAmount
      } else if (filteredEdgesAmount === maxAmountOfEdges) {
        const tempAvg =
          filteredEdges.reduce((acc, edge) => acc + edge.weight, 0) /
          filteredEdgesAmount
        if (minAvgWeight > tempAvg) {
          minAvgWeight = tempAvg
          maxAmountOfEdges = filteredEdgesAmount
          startingNode = i
        }
      }
    } else if (i < nodesAmount - 1) {
      for (let j = i + 1; j < nodesAmount; j++) {
        if (graph[i][j] > 0) {
          const combinedConnections = []
          graph[i].forEach((e: number, index: number) => {
            if (e > 0 || graph[j][index] > 0) {
              if (e > 0 && graph[i][index] > 0) {
                combinedConnections.push(Math.min(e, graph[j][index]))
              } else {
                combinedConnections.push(Math.max(e, graph[j][index]))
              }
            }
          })
          const combinedConnectionsLength = combinedConnections.length
          if (combinedConnectionsLength >= maxAmountOfEdges) {
            const combinedConnectionsSum = combinedConnections.reduce(
              (acc, edge) => acc + edge,
              0
            )
            if (
              combinedConnectionsLength > maxAmountOfEdges ||
              combinedConnectionsSum < minAvgWeight
            ) {
              startingNode = i
              startingNode2 = j
              minAvgWeight = combinedConnectionsSum
              maxAmountOfEdges = combinedConnectionsLength
            }
          }
        }
      }
    }
  }

  // counts the amount of edges connected to each node. Index = node, value = amount of Connected edges
  const nodeConnections = new Array(nodesAmount).fill(0)
  let nodeLongestPaths = new Array(nodesAmount).fill(-1)

  const resetNodeLongestParths = () => {
    nodeLongestPaths = new Array(nodesAmount).fill(-1)
  }

  if (maxDepth > 2) {
    nodeConnections[startingNode] += 1
    nodeConnections[startingNode2] += 1
  }
  // MST edges pushed
  const minimumSpanningTree =
    maxDepth <= 2
      ? []
      : [
          {
            from: startingNode,
            to: startingNode2,
            weight: graph[startingNode][startingNode2]
          }
        ]

  let PQ =
    maxDepth <= 2
      ? [...edgesGroups[startingNode]]
      : [...edgesGroups[startingNode], ...edgesGroups[startingNode2]]

  const sortPQ = () => {
    PQ = PQ.sort((a, b) => a.weight - b.weight)
  }

  const deepFlatten = (array) => {
    return array.flatMap((element) =>
      Array.isArray(element) ? deepFlatten(element) : element
    )
  }

  const checkReachability = (leafIndex: number): [boolean, number[]] => {
    const orphanNodesSet = new Set()
    const notLeafNodes: number[] = []

    nodeConnections.forEach((node, index) => {
      if (node === 0) {
        orphanNodesSet.add(index)
      } else if (node > 1) {
        notLeafNodes.push(index)
      }
    })

    const canBeReachedNodes = []
    edgesGroups[leafIndex].forEach((edge) => {
      if (orphanNodesSet.has(edge.to)) {
        canBeReachedNodes.push(edge.to)
      } else if (orphanNodesSet.has(edge.from)) {
        canBeReachedNodes.push(edge.from)
      }
    })

    notLeafNodes.forEach((index) => {
      const nodeReachability = []
      edgesGroups[index].forEach((edge) => {
        if (orphanNodesSet.has(edge.to)) {
          nodeReachability.push(edge.to)
        } else if (orphanNodesSet.has(edge.from)) {
          nodeReachability.push(edge.from)
        }
      })
      canBeReachedNodes.push(nodeReachability)
    })

    const setOfReachable = new Set(deepFlatten(canBeReachedNodes))
    if (orphanNodesSet.size !== setOfReachable.size) {
      return [false, []]
    }

    for (const element of orphanNodesSet) {
      if (!setOfReachable.has(element)) {
        return [false, []]
      }
    }

    return [true, notLeafNodes]
  }

  const findLongestPath = (spanningTree, startNode) => {
    // Create an adjacency list to represent the undirected spanning tree
    if (nodeLongestPaths[startNode] !== -1) {
      return nodeLongestPaths[startNode]
    }
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

    const longestPathDistance = longestPath.length - 1
    nodeLongestPaths[startNode] = longestPathDistance

    return longestPathDistance
  }

  if (maxDepth > 2) {
    while (PQ.length !== 0 && minimumSpanningTree.length + 1 !== nodesAmount) {
      sortPQ()
      while (PQ.length > 0) {
        const edge = PQ.shift()
        // check if they don't create a loop by checking if either of them is orphan
        if (
          nodeConnections[edge.from] === 0 ||
          nodeConnections[edge.to] === 0
        ) {
          // index of node that is already connected to the graph
          const alreadyConnectedNodeIndex =
            minimumSpanningTree.length === 0
              ? startingNode
              : nodeConnections[edge.from] === 0
              ? edge.to
              : edge.from
          const toBeConnectedNodeIndex =
            edge.to === alreadyConnectedNodeIndex ? edge.from : edge.to
          // if currentDepth is 1 below maximum and the edge will connect to a current leaf then
          // if nodes connected to the already connected node are not equal to 1 (meaning that they are more)
          // OR the maximum depth from our that node + 1 is less than maxDepth then
          if (
            nodeConnections[alreadyConnectedNodeIndex] !== 1 ||
            findLongestPath(minimumSpanningTree, alreadyConnectedNodeIndex) +
              1 <
              maxDepth
          ) {
            edgesGroups[toBeConnectedNodeIndex] = edgesGroups[
              toBeConnectedNodeIndex
            ].filter((e) => JSON.stringify(e) !== JSON.stringify(edge))
            PQ.push(...edgesGroups[toBeConnectedNodeIndex])
            minimumSpanningTree.push(edge)
            nodeConnections[edge.to] += 1
            nodeConnections[edge.from] += 1
            resetNodeLongestParths()
            break
          } else if (
            nodeConnections[alreadyConnectedNodeIndex] === 1 &&
            findLongestPath(minimumSpanningTree, alreadyConnectedNodeIndex) +
              1 ===
              maxDepth
          ) {
            // check if all nodes can be accessed from the already connected Not leaves nodes AND from the leaf node that will stop being a leaf node.
            // create a function for this.
            const [reachable, notLeafNodes] = checkReachability(
              alreadyConnectedNodeIndex
            )
            if (reachable) {
              notLeafNodes.forEach((index) => {
                PQ.push(...edgesGroups[index])
              })
              minimumSpanningTree.push(edge)
              nodeConnections[edge.to] += 1
              nodeConnections[edge.from] += 1
              resetNodeLongestParths()
              break
            }
          }
        }
      }
    }
  } else {
    minimumSpanningTree.push(...PQ)
  }
  return createMatrix(minimumSpanningTree)
}
