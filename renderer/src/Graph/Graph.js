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

export default function Graph({ idx, removeIdxFromGraphs, states, selectedIndexes, addToTemplate, setSheetDrag}) {
    const [model, setModel] = useState(states.model);
    const [method, setMethod] = useState(states.method);
    const [xdata, setXData] = useState(states.xdata)
    const [ydata, setYData] = useState(states.ydata)
    const [order, setOrder] = useState(states.order)
    const [numberVar, setNumberVar] = useState(states.numberVar)
    const [regressionExpr, setRegressionExpr] = useState(states.regressionExpr)
    const [checked, setChecked] = useState(states.checked)
    const [mouseDown, setMouseDown] = useState(false)
    

    const multipleReg = Array(Number(numberVar)).fill(0)
    registerTransform(transform.regression)

    useEffect(() => {
        if(selectedIndexes.includes(idx)){
            addToTemplate({
                model: model,
                method: method,
                order: order,
                numberVar: numberVar,
                regressionExpr: '',
                checked: checked,
                xdata: xdata,
                ydata: ydata
            }, idx, 'graph')
        }
        
    }, [selectedIndexes])
    useEffect(() => {
        if (model != "multiple") {
            setNumberVar(1)
        }
    }, [model])

    useEffect(() => {
        setXData(xdata.length > Number(numberVar) ? xdata.toSpliced(Number(numberVar), xdata.length - Number(numberVar)) : [...xdata, ...Array(Number(numberVar) - xdata.length).fill({data: [], dataset: -1})])
    }, [model, numberVar])

    const data = xdata.map((xd, i) => {
        let data_helper = []
        if (xd.data.length == 0) {
            data_helper = ydata.data.map((value, i) => [0, value])
        }
        else if (ydata.data.length == 0) {
            data_helper = xd.data.map((value, i) => [0, value])
        } else if (xd.data.length <= ydata.data.length) {
            for (let i = 0; i < xd.data.length; i++) {
                data_helper.push([xd.data[i], ydata.data[i]])
            }
            for (let i = xd.data.length; i < ydata.data.length; i++) {
                data_helper.push([0, ydata.data[i]])
            }
        } else if (ydata.data.length <= xd.data.length) {
            for (let i = 0; i < ydata.length; i++) {
                data_helper.push([xd.data[i], ydata.data[i]])
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
        xDataCopy[i] = data

        setXData(xDataCopy)

    }

    function dropY(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select numerical data!')
            return
        }

        setYData(data)

    }

    function handleClose(ev) {
        ev.stopPropagation()
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
                    if (xdata.reduce((prev, current) => { return (prev && current.data.length > 0) }, true)) {
                        let alerted = false
                        xdata.forEach((x_iv, i) => {
                            if (x_iv.data.reduce((prev, current) => { return prev && current == 0 }, true)) {
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
                    <Typography variant="h5" onClick={(ev) => {ev.stopPropagation()}}>{regressionExpr.replaceAll("_", "").replaceAll('\\', '').replaceAll("{", "(").replaceAll("}", ")")} <Typography variant='overline'><Checkbox checked={checked}
                        onChange={(ev) => setChecked(ev.target.checked)} onClick={(ev) => {ev.stopPropagation()}}/> Include intercept?</Typography></Typography>
                    {model == 'polynomial' ? <TextField label='Order' value={order} type="number" onChange={(ev) => {
                        setOrder(ev.target.value) 
                    }} onClick={(ev) => {ev.stopPropagation()}}></TextField>
                        :
                        model == "multiple" ? <TextField label='Number of Variables' value={numberVar} type="number" onChange={(ev) => {
                            setNumberVar(ev.target.value)
                        }} onClick={(ev) => {ev.stopPropagation()}}></TextField> :
                            <></>}
                </Grid>
                <Grid item xs={1}>
                    <Button onDrop={dropY} onDragOver={allowDrop} onClick={(ev) => {ev.stopPropagation()}}>Insert Y Data</Button>
                </Grid>
                <Grid item xs={7} onClick={(ev) => {ev.stopPropagation()}} onMouseDown={(ev) =>{setMouseDown(true)}} onMouseUp={(ev) =>{setSheetDrag(false); setMouseDown(false)}} onMouseMove={(ev) => {if(mouseDown){setSheetDrag(true)}}}>
                    {data[0] ? 
                        data.length > 1 ?
                            // <PcaGraph data={data} key={data} />
                            <ScatterPlotChart expr={regressionExpr} points = {data} onClick={(ev) => {ev.stopPropagation()}}/>
                        : <ScatterPlotChart expr={regressionExpr} points = {data} onClick={(ev) => {ev.stopPropagation()}}/> 
                    : <></>}
                </Grid>
                <Grid item xs={1} />
                <Grid container alignItems="center" alignContent='center' direction='row' columns={multipleReg.length + 8}>
                    <Grid item xs={4} />
                    {multipleReg.map((v, i) => {
                        return <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropX(ev, i) }} onDragOver={allowDrop} onClick={(ev) => {ev.stopPropagation()}}>Insert X{i + 1} Data</Button></Grid>
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
                            onClick={(ev) => {console.log('hello'); ev.stopPropagation()}}
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
                            onClick={(ev) => {console.log('hello'); ev.stopPropagation()}}
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