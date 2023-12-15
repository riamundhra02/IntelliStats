import { useState, useEffect } from 'react'
import InputLabel from '@mui/material/InputLabel';
import { registerTransform } from 'echarts/core';
import { transform, regression } from 'echarts-stat';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid/Grid'
import Button from '@mui/material/Button/Button'
import { ScatterPlotChart } from './ScatterPlot'
import { TextField, Typography } from '@mui/material';
import { regressionCalculator } from './regressionCalculator'
import PcaGraph from './pcaGraph';
import Checkbox from '@mui/material/Checkbox';

export default function Graph({ idx, removeIdxFromGraphs, states }) {
    const [model, setModel] = useState(states.model);
    const [method, setMethod] = useState(states.method);
    const [xdata, setXData] = useState(states.xdata)
    const [ydata, setYData] = useState(states.ydata)
    const [order, setOrder] = useState(states.order)
    const [numberVar, setNumberVar] = useState(states.numberVar)
    const [regressionExpr, setRegressionExpr] = useState(states.regressionExpr)
    const [checked, setChecked] = useState(states.checked)

    const multipleReg = Array(Number(numberVar)).fill(0)
    registerTransform(transform.regression)

    useEffect(() => {
        if (model != "multiple") {
            setNumberVar(1)
        }
    }, [model])

    useEffect(() => {
        setXData(xdata.length > Number(numberVar) ? xdata.toSpliced(Number(numberVar), xdata.length - Number(numberVar)) : [...xdata, ...Array(Number(numberVar) - xdata.length).fill([])])
    }, [model, numberVar])

    const data = xdata.map((xd, i) => {
        let data_helper = []
        if (xd.length == 0) {
            data_helper = ydata.map((value, i) => [0, value])
        }
        else if (ydata.length == 0) {
            data_helper = xd.map((value, i) => [0, value])
        } else if (xd.length <= ydata.length) {
            for (let i = 0; i < xd.length; i++) {
                data_helper.push([xd[i], ydata[i]])
            }
            for (let i = xd.length; i < ydata.length; i++) {
                data_helper.push([0, ydata[i]])
            }
        } else if (ydata.length <= xd.length) {
            for (let i = 0; i < ydata.length; i++) {
                data_helper.push([xd[i], ydata[i]])
            }
        }
        return data_helper

    })

    const handleChangeModel = (event) => {
        setModel(event.target.value);
    };

    const handleChangeMethod = (event) => {
        setMethod(event.target.value);
    };

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function dropX(ev, i) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select numerical data!')
            return
        }
        let xDataCopy = [...xdata]
        xDataCopy[i] = data.data

        setXData(xDataCopy)

    }

    function dropY(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select numerical data!')
            return
        }

        setYData(data.data)

    }

    function handleClose(ev) {
        let conf = window.confirm('Delete model?')
        if (conf) {
            removeIdxFromGraphs(idx)
        }
    }

    useEffect(() => {
        if (model == "linear" || model == "multiple") {
            if (data[0].length > 0) {
                let res = regressionCalculator(data.map((iv, i) => iv.map((point, i) => {
                    return point[0]
                })), [data[0].map((point, i) => {
                    return point[1]
                })], checked)
                if (!res) {
                    if (xdata.reduce((prev, current) => { return (prev && current.length > 0) }, true)) {
                        let alerted = false
                        xdata.forEach((x_iv, i) => {
                            if (x_iv.reduce((prev, current) => { return prev && current == 0 }, true)) {
                                alert(`Unable to carry out regresion analysis as all observations of independant variable X${i + 1} are 0`)
                                setRegressionExpr('')
                                alerted = true
                                return
                            }
                        })
                        if (!alerted) {
                            alert("Unable to carry out regresion analysis as some independant variables are colinear.")
                            setRegressionExpr('')
                        }

                    }
                } else {
                    let expr = "y = "
                    for (let i = 0; i < res.length - checked; i++) {
                        const beta = res[i]
                        expr += `${parseFloat(beta).toFixed(2)}x_${i + 1} + `
                    }
                    if (checked) {
                        expr += `${parseFloat(res[res.length - 1]).toFixed(2)}`
                    } else {
                        expr = expr.slice(0, -3)
                    }
                    setRegressionExpr(expr)
                }
            }
        } else if (model == 'polynomial') {
            let reg = regression(model, data[0], order)
            setRegressionExpr(reg.expression.replaceAll("(", "{").replaceAll(")", "}").replaceAll("x", "x_1").replaceAll('ln', '\\ln'))
        } else {
            let reg = regression(model, data[0])
            setRegressionExpr(reg.expression.replaceAll("(", "{").replaceAll(")", "}").replaceAll("x", "x_1").replaceAll('ln', '\\ln'))

        }
    }, [model, numberVar, order, data, checked])

    return (
        <>
            <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                <Grid item xs={8} />
                <Grid item xs={1}>
                    <IconButton aria-label="delete" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>
                <Grid item xs={9}>
                    <Typography variant="h5">{regressionExpr.replaceAll("_", "").replaceAll('\\', '').replaceAll("{", "(").replaceAll("}", ")")} <Typography variant='overline'><Checkbox checked={checked}
                        onChange={(ev) => setChecked(ev.target.checked)} /> Include intercept?</Typography></Typography>
                    {model == 'polynomial' ? <TextField label='Order' value={order} type="number" onChange={(ev) => {
                        setOrder(ev.target.value)
                    }}></TextField>
                        :
                        model == "multiple" ? <TextField label='Number of Variables' value={numberVar} type="number" onChange={(ev) => {
                            setNumberVar(ev.target.value)
                        }}></TextField> :
                            <></>}
                </Grid>
                <Grid item xs={1}>
                    <Button onDrop={dropY} onDragOver={allowDrop}>Insert Y Data</Button>
                </Grid>
                <Grid item xs={7}>
                    {data[0] ? 
                        data.length > 1 ?
                            // <PcaGraph data={data} key={data} />
                            <ScatterPlotChart expr={regressionExpr} points = {data}/>
                        : <ScatterPlotChart expr={regressionExpr} points = {data}/> 
                    : <></>}
                </Grid>
                <Grid item xs={1} />
                <Grid container alignItems="center" alignContent='center' direction='row' columns={multipleReg.length + 8}>
                    <Grid item xs={4} />
                    {multipleReg.map((v, i) => {
                        return <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropX(ev, i) }} onDragOver={allowDrop}>Insert X{i + 1} Data</Button></Grid>
                    })}
                    <Grid item xs={4} />
                </Grid>


            </Grid>
            <br />
            <br />
            <Grid container columns={8} columnSpacing={2} alignItems="center" alignContent='center'>
                <Grid item xs={2} />
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Regression Model</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={model}
                            label="Regression Model"
                            onChange={handleChangeModel}
                        >
                            <MenuItem value={'linear'}>Single Linear</MenuItem>
                            <MenuItem value={'multiple'}>Multiple Linear</MenuItem>
                            <MenuItem value={'exponential'}>Single Exponential</MenuItem>
                            <MenuItem value={'polynomial'}>Single Polynomial</MenuItem>
                            <MenuItem value={'logarithmic'}>Single Logarithmic</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Estimation Method</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={method}
                            label="Estimation Method"
                            onChange={handleChangeMethod}
                        >
                            <MenuItem value={'ols'}>Ordinary Least Squares (Maximum Likelihood)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <br />
            <br />
            <hr />
            <br />
            <br />
        </>

    )
}