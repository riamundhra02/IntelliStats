import * as PCA from 'pca-js'
import { useState, useEffect, useRef } from 'react'
import * as Plotly from 'plotly.js-dist'
import Plot from 'react-plotly.js';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid/Grid';
import { MenuItem, Typography } from '@mui/material';

export default function PcaGraph({ data, xAxis, zAxis, setXAxis, setZAxis }) {
    const xdata = data.map((xi, i) => { return xi.map((pair, i) => { return pair[0] }) })
    const ydata = data[0].map((pair, i) => { return pair[1] })
    const xdata_transpose = PCA.transpose(xdata)
    const [adjusted, setAdjusted] = useState(xdata)
    const [variances, setVariances] = useState([])
    const gridRef = useRef()


    useEffect(() => {
        let hasData = xdata.reduce((acc, v) => { return v.length > 0 && acc }, true)
        if (hasData && xdata.length > 2) {
            let vectors = PCA.getEigenVectors(xdata_transpose)
            let varianceExplained = vectors.map((vector, i) => { return [vector, PCA.computePercentageExplained(vectors, vector)] })
            setVariances(varianceExplained)
            setAdjusted(PCA.computeAdjustedData(xdata_transpose, vectors[xAxis], vectors[zAxis]).formattedAdjustedData)
        }
    }, [])

    function handleXChange(ev) {
        setXAxis(ev.target.value)
        if (xdata.length > 2) {
            setAdjusted(PCA.computeAdjustedData(xdata_transpose, variances[ev.target.value][0], variances[zAxis][0]).formattedAdjustedData)
        } else {
            setAdjusted([xdata[ev.target.value], xdata[zAxis]])
        }
    }

    function handleZChange(ev) {
        setZAxis(ev.target.value)
        if (xdata.length > 2) {
            setAdjusted(PCA.computeAdjustedData(xdata_transpose, variances[xAxis][0], variances[ev.target.value][0]).formattedAdjustedData)
        } else {
            setAdjusted([xdata[xAxis], xdata[ev.target.value]])
        }
    }

    return (
        <Grid container columns={12} columnSpacing={2}>
            <Grid item xs={10} ref={gridRef}>
                <Plot
                    data={[
                        {
                            x: adjusted[0], y: ydata, z: adjusted[1],
                            mode: 'markers',
                            type: 'scatter3d'
                        }
                    ]}
                    layout={{ height: 500, width: gridRef.current ? gridRef.current.offsetWidth : 500 }}
                />
            </Grid>
            <Grid item xs={2} alignContent='center'>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">X axis</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={xAxis}
                        label="X axis"
                        onChange={handleXChange}
                    >
                        {xdata.length > 2 ? variances.map((vector, i) => {
                            return <MenuItem key={i} value={i}>Vector {i} - <Typography variant="overline">  Variance Explained: {Math.round(vector[1] * 1000) / 10}%</Typography></MenuItem>
                        }) : xdata.map((vector, i) => {
                            return <MenuItem key={i} value={i}>X{i + 1}</MenuItem>
                        })}
                    </Select>
                </FormControl>
                <br />
                <br />
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Z axis</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={zAxis}
                        label="Z axis"
                        onChange={handleZChange}
                    >
                        {xdata.length > 2 ? variances.map((vector, i) => {
                            return <MenuItem key={i} value={i}>Vector {i} - <Typography variant="overline">  Variance Explained: {Math.round(vector[1] * 1000) / 10}%</Typography></MenuItem>
                        }) : xdata.map((vector, i) => {
                            return <MenuItem key={i} value={i}>X{i + 1}</MenuItem>
                        })}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    )
}