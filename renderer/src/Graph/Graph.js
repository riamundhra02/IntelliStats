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
import TrapFocus from '@mui/material/Unstable_TrapFocus';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import NetworkGraph from './NetworkGraph'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CustomTabPanel from './CustomTabPanel'


export default function Graph({ template, type, idx, removeIdxFromGraphs, states, selectedIndexes, addToTemplate, projectSaveClicked }) {
    const [model, setModel] = useState(states.model);
    const [method, setMethod] = useState(states.method);
    const [xdata, setXData] = useState(states.xdata)
    const [ydata, setYData] = useState(states.ydata)
    const [source, setSource] = useState(states.source)
    const [target, setTarget] = useState(states.target)
    const [label, setLabel] = useState(states.label)
    const [data, setData] = useState(type == 'regression' ? [[]] : [])
    const [order, setOrder] = useState(states.order)
    const [numberVar, setNumberVar] = useState(states.numberVar)
    const [regressionExpr, setRegressionExpr] = useState(states.regressionExpr)
    const [checked, setChecked] = useState(states.checked)
    const [bannerOpen, setBannerOpen] = useState(false)
    const [tabValue, setTabValue] = useState(states.tabValue)
    const [xAxis, setXAxis] = useState(states.xAxis)
    const [zAxis, setZAxis] = useState(states.zAxis)
    const [directed, setDirected] = useState(states.directed)
    const [stylesheet, setStylesheet] = useState([])

    useEffect(() => {
        if (template) {
            setStylesheet(pstylesheet => {
                let copy = [...states.stylesheet]
                // console.log(copy)
                copy.forEach(style => {
                    Object.keys(style.style).forEach(key => {
                        console.log(style.style[key])
                        if (style.style[key].isFunction) {
                            var func = new Function(`return ${style.style[key]?.str}`)
                            // console.log(func(), "hello")
                            style.style[key] = func()
                        } else {
                            // console.log("hello")
                            style.style[key] = style.style[key].str
                        }
                        console.log(style.style)
                    })

                })
                // console.log(copy)
                return copy
            })
        } else {
            setStylesheet(states.stylesheet)
        }
    }, [template, states])

    const multipleReg = Array(Number(numberVar)).fill(0)
    registerTransform(transform.regression)

    useEffect(() => {
        if (selectedIndexes.includes(idx) || projectSaveClicked) {
            let copy = [...stylesheet]
            copy.forEach(style => {
                Object.keys(style.style).forEach(key => {
                    if (typeof (style.style[key]) == "function") {
                        style.style[key] = { isFunction: true, str: style.style[key].toString() }
                    } else {
                        style.style[key] = { isFunction: false, str: style.style[key] }
                    }
                })
            })
            console.log(copy)
            addToTemplate({
                model: model,
                method: method,
                order: order,
                numberVar: numberVar,
                regressionExpr: '',
                checked: checked,
                xdata: xdata,
                ydata: ydata,
                tabValue: tabValue,
                xAxis: xAxis,
                zAxis: zAxis,
                source: source,
                target: target,
                label: label,
                directed: directed,
                stylesheet: copy,
                type: type
            }, idx, 'graph')
        }

    }, [selectedIndexes, idx, model, method, order, numberVar, regressionExpr, checked, xdata, ydata, tabValue, xAxis, zAxis, projectSaveClicked])
    useEffect(() => {
        if (model != "multiple") {
            setNumberVar(1)
        }
    }, [model])

    useEffect(() => {
        setXData(xdata.length > Number(numberVar) ? xdata.toSpliced(Number(numberVar), xdata.length - Number(numberVar)) : [...xdata, ...Array(Number(numberVar) - xdata.length).fill({ data: [], dataset: -1 })])
    }, [model, numberVar])

    useEffect(() => {
        let dataAux = []

        if (type == 'regression') {
            dataAux = xdata.map((xd, i) => {
                let data_helper = []
                if (xd.data.length == 0) {
                    data_helper = ydata.data.map((value, i) => [0, value])
                } else if (xd.data.length <= ydata.data.length) {
                    for (let i = 0; i < xd.data.length; i++) {
                        data_helper.push([xd.data[i], ydata.data[i]])
                    }
                    for (let i = xd.data.length; i < ydata.data.length; i++) {
                        data_helper.push([0, ydata.data[i]])
                    }
                } else if (ydata.data.length <= xd.data.length) {
                    for (let i = 0; i < ydata.data.length; i++) {
                        data_helper.push([xd.data[i], ydata.data[i]])
                    }
                }
                return data_helper

            })
        } else {
            let i = Math.min(source.data.length, target.data.length, label.data.length)
            let newSource = source.data.slice(0, i)
            let newTarget = target.data.slice(0, i)
            let newLabel = label.data.slice(0, i)
            let nodes = new Set([...newSource, ...newTarget])
            nodes = Array.from(nodes.values())
            nodes = nodes.map((v, i) => { return { data: { id: v } } })
            newLabel = newLabel.map((v, i) => { return { data: { source: newSource[i], target: newTarget[i], label: `${v}` } } })
            dataAux = [...nodes, ...newLabel]
        }
        setData(dataAux)
    }, [xdata, ydata, type, source, target, label])

    const handleChangeModel = (event) => {
        setModel(event.target.value);
    };

    const handleChangeMethod = (event) => {
        setMethod(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function dropX(ev, i) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        data.data = data.data.filter((v, i) => typeof v == 'number')
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
        data.data = data.data.filter((v, i) => typeof v == 'number')
        if (data.data.length == 0) {
            alert('Please select numerical data!')
            return
        }

        setYData(data)

    }

    function dropSource(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select source data!')
            return
        }

        setSource(data)

    }

    function dropTarget(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select target data!')
            return
        }

        setTarget(data)

    }

    function dropLabel(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select edge labels!')
            return
        }
        setLabel(data)

    }

    function handleClose(ev) {
        let conf = window.confirm('Delete model?')
        if (conf) {
            removeIdxFromGraphs(idx)
        }
    }

    useEffect(() => {
        if (model == "linear" || model == "multiple") {
            if (data[0]?.length > 0) {
                let res = regressionCalculator(data.map((iv, i) => iv.map((point, i) => {
                    return point[0]
                })), [data[0].map((point, i) => {
                    return point[1]
                })], checked)
                if (!res) {
                    setRegressionExpr('')
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
                        expr += `${parseFloat(parseFloat(beta).toPrecision(3))}x_${i + 1} + `
                    }
                    if (checked) {
                        expr += `${parseFloat(parseFloat(res[res.length - 1]).toPrecision(3))}`
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

    const component = type == 'regression' ? <>
        <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center' sx={{ width: '100%' }}>
            <Grid item xs={1}>
                <Button onDrop={dropY} onDragOver={allowDrop}>Insert Y Data</Button>
            </Grid>
            <Grid item xs={model == 'multiple' && tabValue == 1 ? 8 : 7} >
                {data[0] ?
                    data.length > 1 ?
                        <>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label="Slider Graph" />
                                <Tab label="PCA" />
                            </Tabs>
                            <CustomTabPanel value={tabValue} index={0}>
                                <ScatterPlotChart expr={regressionExpr} points={data} />
                            </CustomTabPanel>
                            <CustomTabPanel value={tabValue} index={1}>
                                <PcaGraph data={data} key={data} setXAxis={setXAxis} setZAxis={setZAxis} xAxis={xAxis} zAxis={zAxis} />
                            </CustomTabPanel>
                        </>
                        : <ScatterPlotChart expr={regressionExpr} points={data} sx={{ width: '100%' }} />
                    : <></>}
            </Grid>
            {model == 'multiple' && tabValue == 1 ? <></> : <Grid item xs={1} />}
        </Grid>
        <Grid container alignItems="center" justifyContent="center" alignContent='center' direction='row' columns={12}>
            {multipleReg.map((v, i) => {
                return <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropX(ev, i) }} onDragOver={allowDrop}>Insert X{i + 1} Data</Button></Grid>
            })}
        </Grid>

    </>
        :
        <>
            <NetworkGraph elements={data} directed={directed} stylesheet={stylesheet} setStylesheet={setStylesheet} />
            <Grid container alignItems="center" justifyContent="center" alignContent='center' direction='row' columns={4}>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropSource(ev) }} onDragOver={allowDrop}>Source Nodes</Button></Grid>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropTarget(ev) }} onDragOver={allowDrop}>Target Nodes</Button></Grid>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropLabel(ev) }} onDragOver={allowDrop}>Edge Labels</Button></Grid>
                <Grid item xs={1} alignItems='center' alignContent='center'>
                    <Typography variant='overline'>
                        <Checkbox checked={directed} onChange={(ev) => {
                            setDirected(ev.target.checked); setStylesheet(pstylesheet => {
                                let copy = [...pstylesheet]
                                let indexes = copy.map((obj, index) => { if (obj.selector.includes('edge')) return index }).filter(item => item !== undefined);
                                if (indexes.length >= 0) {
                                    indexes.forEach((index) => {
                                        let style = { ...copy[index]["style"] }
                                        let selector = copy[index]["selector"]
                                        style["target-arrow-shape"] = ev.target.checked ? "triangle" : "none"
                                        copy[index] = {
                                            selector: selector,
                                            style: style
                                        }
                                    })
                                } else {
                                    copy.push({
                                        selector: 'edge',
                                        style: {
                                            'target-arrow-shape': ev.target.checked ? "triangle" : "none"
                                        }
                                    })
                                }
                                return copy
                            })
                        }} /> Directed?
                        </Typography>
                </Grid>

            </Grid>
        </>


    return (
        <>
            <div onDoubleClick={(ev) => setBannerOpen(true)} style={{ width: '100%', position: 'relative' }} className='graph'>
                <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                    <Grid item xs={8} />
                    <Grid item xs={1}>
                        <IconButton aria-label="delete" onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                {type == 'regression' ? <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                    <Grid item xs={9}>
                        <Typography variant="h5">{regressionExpr.replaceAll("_", "").replaceAll('\\', '').replaceAll("{", "(").replaceAll("}", ")")} {model == 'linear' || model == 'multiple' ? <Typography variant='overline'><Checkbox checked={checked}
                            onChange={(ev) => setChecked(ev.target.checked)} /> Include intercept?</Typography> : <></>}</Typography>
                        {model == 'polynomial' ? <><br /><br /><TextField label='Order' value={order} type="number" onChange={(ev) => {
                            setOrder(ev.target.value)
                        }}></TextField></>
                            :
                            model == "multiple" ? <><br /><br /><TextField label='Number of Variables' value={numberVar} type="number" onChange={(ev) => {
                                setNumberVar(ev.target.value)
                            }}></TextField></> :
                                <></>}
                    </Grid>
                </Grid>
                    : <></>}
                {component}
                <br />
                <br />
                {type == 'regression' ?
                    <>
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
                    </> : <></>}
            </div>


            <TrapFocus open disableAutoFocus disableEnforceFocus>
                <Fade appear={false} in={bannerOpen}>
                    <Paper
                        role="dialog"
                        aria-modal="false"
                        aria-label="Cookie banner"
                        square
                        variant="outlined"
                        tabIndex={-1}
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            right: 0,
                            m: 1,
                            p: 0,
                            borderWidth: 2,
                            width: '50%',
                            height: '59%',
                            zIndex: 10,
                        }}
                    >
                        <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center' sx={{ height: '12%', p: 1 }}>
                            <Grid item xs={8} />
                            <Grid item xs={1}>
                                <IconButton aria-label="delete" onClick={(ev) => { setBannerOpen(false) }}>
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Paper sx={{ height: '88%', overflow: 'scroll', borderWidth: 0 }}>
                            {component}
                        </Paper>
                    </Paper>
                </Fade>
            </TrapFocus>
            <br />
            <br />
            <hr />
            <br />
            <br />
        </>

    )
}