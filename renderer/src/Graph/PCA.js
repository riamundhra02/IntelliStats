import * as PCA from 'pca-js'

const test_data = [[4,2,3,1,7], [2,2,2,2, 3], [6,4,5,1,19], [7, 6, 8, 4, 1], [9, 10, 5, 4, 3], [1,2,1,2,1]]

let vectors = PCA.getEigenVectors(test_data)
let first = PCA.computePercentageExplained(vectors,vectors[0])
let topTwo = PCA.computePercentageExplained(vectors,vectors[0],vectors[1])
let adjusted = PCA.computeAdjustedData(test_data, vectors[0], vectors[1], vectors[2])
