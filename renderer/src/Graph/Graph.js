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
import Draggable from 'react-draggable'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CustomTabPanel from './CustomTabPanel'

export default function Graph({ idx, removeIdxFromGraphs, states, selectedIndexes, addToTemplate, projectSaveClicked }) {
    const [model, setModel] = useState(states.model);
    const [method, setMethod] = useState(states.method);
    const [xdata, setXData] = useState(states.xdata)
    const [ydata, setYData] = useState(states.ydata)
    const [data, setData] = useState([[]])
    const [order, setOrder] = useState(states.order)
    const [numberVar, setNumberVar] = useState(states.numberVar)
    const [regressionExpr, setRegressionExpr] = useState(states.regressionExpr)
    const [checked, setChecked] = useState(states.checked)
    const [mouseDown, setMouseDown] = useState(false)
    const [bannerOpen, setBannerOpen] = useState(false)
    const [tabValue, setTabValue] = useState(states.tabValue)
    const [xAxis, setXAxis] = useState(states.xAxis)
    const [zAxis, setZAxis] = useState(states.zAxis)


    const multipleReg = Array(Number(numberVar)).fill(0)
    registerTransform(transform.regression)

    useEffect(() => {
        if (selectedIndexes.includes(idx) || projectSaveClicked) {
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
                zAxis: zAxis
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
        let dataAux = xdata.map((xd, i) => {
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
        setData(dataAux)
    }, [xdata, ydata])

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

    const component = <>
        <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center' sx={{ width: '100%' }}>
            <Grid item xs={1}>
                <Button onDrop={dropY} onDragOver={allowDrop}>Insert Y Data</Button>
            </Grid>
            <Grid item xs={model == 'multiple' && tabValue == 1 ? 8 : 7} onMouseDown={(ev) => { setMouseDown(true) }} onMouseUp={(ev) => { setMouseDown(false) }}>
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
    return (
        <>
            <div onDoubleClick={(ev) => setBannerOpen(true)} style={{ width: '100%' }} className='graph'>
                <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                    <Grid item xs={8} />
                    <Grid item xs={1}>
                        <IconButton aria-label="delete" onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
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
                {component}
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
            </div>



            <Draggable>
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
                            <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center' sx={{ height: '12%', p:1}}>
                                <Grid item xs={8} />
                                <Grid item xs={1}>
                                    <IconButton aria-label="delete" onClick={(ev) => { setBannerOpen(false) }}>
                                        <CloseIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            <Paper sx={{ height: '88%', overflow: 'scroll', borderWidth: 0}}>
                                {component}
                            </Paper>
                        </Paper>
                    </Fade>
                </TrapFocus>
            </Draggable>
            <br />
            <br />
            <hr />
            <br />
            <br />
        </>

    )
}