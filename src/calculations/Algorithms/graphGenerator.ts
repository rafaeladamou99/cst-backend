export const generateWeightedGraph2 = (graphSize, maxWeight) => {
  // Create an graphSize x graphSize matrix filled with zeros
  const graph = Array.from({ length: graphSize }, () =>
    Array.from({ length: graphSize }, () => 0)
  )

  // Generate random weights for each edge
  for (let i = 0; i < graphSize; i++) {
    for (let j = i + 1; j < graphSize; j++) {
      // Generate a random weight between 1 and 10 (inclusive)
      const weight = Math.floor(Math.random() * maxWeight) + 1

      // Assign the weight to both edges (symmetric matrix)
      graph[i][j] = weight
      graph[j][i] = weight
    }
  }

  return graph
}


export const generateWeightedGraph = (graphSize: number, maxWeight: number) => {
  // Create an graphSize x graphSize matrix filled with zeros
  let graph = Array.from({ length: graphSize }, () =>
    Array.from({ length: graphSize }, () => 0)
  )

  // Generate random weights for each edge
  for (let i = 0; i < graphSize - 1; i++) {
    for (let j = i + 1; j < graphSize; j++) {
      // Generate a random weight between 1 and 10 (inclusive)
      const weight =
        Math.floor(Math.random() * 2) *
        (Math.floor(Math.random() * maxWeight) + 1)

      // Assign the weight to both edges (symmetric matrix)
      graph[i][j] = weight
      graph[j][i] = weight
    }
  }

  while (isGraphDisconnected(graph)) {
    graph = generateWeightedGraph(graphSize, maxWeight)
  }

  return graph
}

const isGraphDisconnected = (graph: number[][]) => {
  const visited = new Array(graph.length).fill(false) // Array to track visited vertices

  // Perform depth-first search (DFS) traversal
  function dfs(vertex: number) {
    visited[vertex] = true // Mark current vertex as visited

    // Traverse adjacent vertices
    for (let i = 0; i < graph.length; i++) {
      if (graph[vertex][i] === 1 && !visited[i]) {
        dfs(i) // Recursive call to visit unvisited adjacent vertex
      }
    }
  }

  // Find a starting vertex that has not been visited
  let startVertex = -1
  for (let i = 0; i < graph.length; i++) {
    if (!visited[i]) {
      startVertex = i
      break
    }
  }

  // If no unvisited vertex found, the graph is connected
  if (startVertex === -1) {
    return false
  }

  // Perform DFS from the starting vertex
  dfs(startVertex)

  // Check if any vertex remains unvisited
  for (let i = 0; i < visited.length; i++) {
    if (!visited[i]) {
      return true // Graph is disconnected
    }
  }

  return false // Graph is connected
}
