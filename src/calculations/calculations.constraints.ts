export enum Constraints {
  Leaves = 'leaves',
  Depth = 'depth',
  DepthV2 = 'depthv2',
  Degree = 'degree',
  DegreeV2 = 'degreev2',
  Kruskal = 'kruskal',
  Prims = 'prims'
}

export type ConstraintsType =
  | Constraints.Degree
  | Constraints.DegreeV2
  | Constraints.Depth
  | Constraints.DepthV2
  | Constraints.Kruskal
  | Constraints.Prims
  | Constraints.Leaves
