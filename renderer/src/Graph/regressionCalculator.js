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

function inverse(matrix) {
    const size = matrix.length;
    const augmentedMatrix = matrix.map((row, rowIndex) => [...row, ...Array(size).fill(0).map((_, colIndex) => rowIndex === colIndex ? 1 : 0)]);

    for (let i = 0; i < size; i++) {
        let maxElementIndex = i;
        for (let j = i + 1; j < size; j++) {
            if (Math.abs(augmentedMatrix[j][i]) > Math.abs(augmentedMatrix[maxElementIndex][i])) {
                maxElementIndex = j;
            }
        }
        if (Math.abs(augmentedMatrix[maxElementIndex][i]) === 0) {
            return;
        }

        [augmentedMatrix[i], augmentedMatrix[maxElementIndex]] = [augmentedMatrix[maxElementIndex], augmentedMatrix[i]];

        for (let j = i + 1; j < size * 2; j++) {
            augmentedMatrix[i][j] /= augmentedMatrix[i][i];
        }

        for (let j = 0; j < size; j++) {
            if (j !== i) {
                const factor = augmentedMatrix[j][i];
                for (let k = i; k < size * 2; k++) {
                    augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
                }
            }
        }
    }

    return augmentedMatrix.map(row => row.slice(size));
}

export function regressionCalculator(X, y, intercept) {
    if (intercept) {
        X.push(Array(X[0].length).fill(1))
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