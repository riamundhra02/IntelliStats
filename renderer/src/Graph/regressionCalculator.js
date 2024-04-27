function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function multiply(matrixA, matrixB) {
    const result = Array(matrixA.length).fill(0).map(() => Array(matrixB[0].length).fill(0));

    for (let i = 0; i < matrixA.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            for (let k = 0; k < matrixA[0].length; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }

    return result;
}

function areRowsLinearlyIndependent(matrix) {
    const rank = getRank(matrix);
    return rank === matrix.length;
}

// Function to compute the rank of a matrix
function getRank(matrix) {
    // Use Gaussian elimination to find the row echelon form
    const clonedMatrix = matrix.map(row => [...row]);
    const n = clonedMatrix.length;
    let rank = n;
    for (let i = 0; i < n; i++) {
        // Find the pivot
        let pivotRow = i;
        while (pivotRow < n && clonedMatrix[pivotRow][i] === 0) {
            pivotRow++;
        }
        if (pivotRow === n) {
            rank--;
            continue;
        }
        // Swap rows
        [clonedMatrix[i], clonedMatrix[pivotRow]] = [clonedMatrix[pivotRow], clonedMatrix[i]];
        // Perform row operations to eliminate other elements in the current column
        for (let j = i + 1; j < n; j++) {
            const factor = clonedMatrix[j][i] / clonedMatrix[i][i];
            for (let k = i; k < n; k++) {
                clonedMatrix[j][k] -= factor * clonedMatrix[i][k];
            }
        }
    }
    return rank;
}

// Function to compute the adjugate (adjoint) of a matrix
function adjugate(matrix) {
    const n = matrix.length;
    return matrix.map((row, i) =>
        row.map((_, j) =>
            Math.pow(-1, i + j) * determinant(minor(matrix, i, j))
        )
    );
}

// Function to compute the determinant of a matrix (assuming it's square)
function determinant(matrix) {
    const n = matrix.length;
    if (n === 1) {
        return matrix[0][0];
    }
    let det = 0;
    for (let j = 0; j < n; j++) {
        det += matrix[0][j] * cofactor(matrix, 0, j);
    }
    return det;
}

// Function to compute the cofactor of a matrix element
function cofactor(matrix, row, col) {
    return Math.pow(-1, row + col) * determinant(minor(matrix, row, col));
}

// Function to compute the minor of a matrix element
function minor(matrix, row, col) {
    return matrix.filter((_, i) => i !== row).map(row => row.filter((_, j) => j !== col));
}

function inverse(matrix) {
    const adj = adjugate(matrix);
    const det = determinant(matrix);
    return adj.map(row => row.map(element => element / det));
}

export function regressionCalculator(X, y, intercept) {
    if (intercept) {
        X.push(Array(X[0].length).fill(1))
    }
    if(!areRowsLinearlyIndependent(X)){
        return 0
    }
    let Xt = transpose(X)
    let yt = transpose(y)
    const X_Xt = multiply(X, Xt);
    const X_Xt_inv = inverse(X_Xt);
    if (!X_Xt_inv) {
        return 0
    }
    const X_yt = multiply(X, yt);
    const beta = multiply(X_Xt_inv, X_yt);

    return beta;

}

function G_w(G) {
    return G.map((row, i) =>{
        return row.map((ele, j) => {
            return ele ? ele/(row.reduce((aggregate, current, k) => {
                return k!=i ? aggregate + current : aggregate
            })) : 0
        })
    })
}

export function KatzBonacichCentrality(G, alpha, delta) {
    let Gw = G_w(G)
    let delta_Gw = Gw.map(row => {
        return row.map(ele =>{
            return delta * ele
        })
    })

    let matrix = delta_Gw.map((row,i) =>{
        return row.map((ele, j) => {
            return i==j ? 1- ele : -ele
        })
    })

    let inverse_matrix = inverse(matrix)

    return inverse_matrix.map(row => {
        return row.reduce((aggregate,ele) => {
            return aggregate + alpha * ele
        }, 0)
    })

}

export function LinearInMeans(G, X, alpha, beta, gamma, delta) {
    let Gw = G_w(G)
    let delta_Gw = Gw.map(row => {
        return row.map(ele =>{
            return delta * ele
        })
    })

    let matrix1 = delta_Gw.map((row,i) =>{
        return row.map((ele, j) => {
            return i==j ? 1- ele : -ele
        })
    })

    let inverse_matrix1 = inverse(matrix1)


    let beta_X = X.map(row => {
        return row.map(ele => {
            return beta * ele
        })
    })

    let Gw_X = multiply(Gw, X)


    let gamma_Gw_X = Gw_X.map(row => {
        return row.map(ele => {
            return gamma * ele
        })
    })

    let matrix2 = gamma_Gw_X.map((row,i) => {
        return row.map((ele,j) => {
            return alpha + ele + beta_X[i][j]
        })
    })


    return multiply(inverse_matrix1, matrix2)

}