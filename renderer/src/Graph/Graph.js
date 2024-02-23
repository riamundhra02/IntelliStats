import { useState, useEffect, useRef, useMemo } from 'react'
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
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import CustomTabPanel from './CustomTabPanel'
import { AgGridReact } from 'ag-grid-react'
// import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { registerSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import cssSchema from './cssschema.json'
import { JsonEditor as Editor } from 'jsoneditor-react';
import Ajv from 'ajv';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CustomHeader = ({ displayName, isInput, api, column }) => {
    const [name, setName] = useState(displayName)

    const onChange = (ev) => {
        setName(ev.target.value)
        let colDefs = api.getColumnDefs();
        let id = column.getColId()
        let editColDef;
        colDefs.forEach(colDef => {
            if (colDef.colId == id) {
                editColDef = colDef;
            }
        })
        editColDef.field = ev.target.value;
        api.setColumnDefs(colDefs);
    }
    return (
        <div class="ag-cell-label-container" role="presentation" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isInput ? <TextField className="ag-header-cell-text" variant="filled" size="small" label="Attribute Name" margin='none' sx={{ padding: 0 }} onChange={onChange} value={name} /> : <span class="ag-header-cell-text" style={{ fontSize: 16 }}>{name}</span>}
        </div>

    )
}


const NodesModal = ({ nodesOpen, setNodesOpen, node, setNode }) => {
    const gridRef = useRef()
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'label',
            editable: true,
            resizable: true,
            headerComponentParams: { isInput: false },
        },
        {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            pinned: 'left',
            width: 50,
            headerComponentParams: { isInput: false }

        }])
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        if (columnDefs) {
            setColumnDefs(pColDefs => {
                let copy = [...pColDefs]
                Object.keys(node?.length > 0 ? node[0] : {}).forEach((key, i) => {
                    let add = true
                    pColDefs.forEach(col => {
                        if (col.field == key) {
                            add = false
                        }
                    })
                    if (add && key != 'id') {
                        copy.push({
                            field: key,
                            editable: true,
                            resizable: true,
                            headerComponentParams: { isInput: false },
                        })
                        console.log(copy)
                    }

                })
                console.log(copy)
                return copy
            })
        }

    }, [node])

    const autoSizeStrategy = {
        type: 'fitGridWidth',

    };

    const components = useMemo(() => {
        return {
            agColumnHeader: CustomHeader,
        };
    }, []);

    const getRowData = () => {
        const rowData = [];
        gridRef?.current?.api?.forEachNode(function (node) {
            console.log(node.data)
            rowData.push(node.data);
        });
        return rowData
    };

    const handleClose = (ev) => {
        let tableData = getRowData()
        tableData = tableData.map(data => {
            console.log(data)
            data.id = data.label
            return data
        })
        console.log([...tableData])
        setNode(pdata => {
            let copy = { ...pdata }
            copy.data = tableData
            return copy
        })
        setNodesOpen(false)
    }

    return (
        <Modal
            open={nodesOpen}
            onClose={(ev) => setNodesOpen(false)}
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2"> Add Nodes</Typography>
                <Button onClick={() => gridRef?.current.api.applyTransaction({ add: [{}] })}>
                    Add row
                </Button>
                <Button onClick={() => {
                    const rows = gridRef?.current.api.getSelectedRows()
                    gridRef?.current.api.applyTransaction({ remove: rows })
                }}>
                    Delete selected rows
                </Button>
                <Button onClick={() => {
                    let colDefs = gridRef?.current?.api?.getColumnDefs()
                    colDefs.push({
                        field: "",
                        editable: true,
                        resizable: true,
                        headerComponentParams: { isInput: true }
                    })
                    gridRef?.current?.api?.setColumnDefs(colDefs);
                }}>
                    Add Attribute
                </Button>
                <div className="ag-theme-alpine" style={{ height: 500 }}>
                    <AgGridReact style={{ width: '100%' }} ref={gridRef}
                        rowData={node ? node.map((row, i) => {
                            let copy = { ...row }
                            copy.label = row.id
                            return copy
                        }) : []}
                        columnDefs={columnDefs} rowSelection='multiple'
                        singleClickEdit
                        suppressRowClickSelection
                        autoSizeStrategy={autoSizeStrategy}
                        components={components}
                        headerHeight={65} />
                </div>
                <Button color="success" variant="contained" sx={{ m: 2 }} onClick={handleClose}>Continue?</Button>
            </Box>
        </Modal>
    )
}

const EdgesModal = ({ edgesOpen, setEdgesOpen, source, target, label, setLabel, setSource, setTarget }) => {
    const gridRef = useRef()
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'source',
            editable: true,
            resizable: true,
            headerComponentParams: { isInput: false },
            cellDataType: 'text'
        },
        {
            field: 'label',
            editable: true,
            resizable: true,
            headerComponentParams: { isInput: false },
            cellDataType: 'text'
        },
        {
            field: 'target',
            editable: true,
            resizable: true,
            headerComponentParams: { isInput: false },
            cellDataType: 'text'
        },
        {
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            pinned: 'left',
            width: 50,
            headerComponentParams: { isInput: false },


        }])
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        if (columnDefs) {
            setColumnDefs(pColDefs => {
                let copy = [...pColDefs]
                Object.keys(label?.length > 0 ? label[0] : {}).forEach((key, i) => {
                    let add = true
                    pColDefs.forEach(col => {
                        if (col.field !== key) {
                            add = false
                        }
                    })
                    if (add) {
                        copy.push({
                            field: key,
                            editable: true,
                            resizable: true,
                            headerComponentParams: { isInput: false },
                        })
                    }

                })
                return copy
            })
        }

    }, [label])

    const autoSizeStrategy = {
        type: 'fitGridWidth',

    };

    const components = useMemo(() => {
        return {
            agColumnHeader: CustomHeader,
        };
    }, []);

    const getRowData = () => {
        const rowData = [];
        gridRef?.current?.api?.forEachNode(function (node) {
            rowData.push(node.data);
        });
        return rowData
    };

    const handleClose = (ev) => {
        let tableData = getRowData()
        tableData = tableData.map(data => {
            console.log(data)
            data.id = data.label
            return data
        })
        setLabel(plabel => {
            console.log(plabel)
            let copy = tableData.map(data => data.label)
            console.log(plabel, copy)
            return { data: copy, dataset: plabel.dataset }

        })

        setSource(psource => {
            let copy = tableData.map(data => { return { id: data.source } })
            console.log(psource, copy)
            return { data: copy, dataset: psource.dataset }

        })

        setTarget(ptarget => {
            let copy = tableData.map(data => { return { id: data.target } })
            return { data: copy, dataset: ptarget.dataset }

        })

        setEdgesOpen(false)
    }

    return (
        <Modal
            open={edgesOpen}
            onClose={(ev) => setEdgesOpen(false)}
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2"> Add Nodes</Typography>
                <Button onClick={() => gridRef?.current.api.applyTransaction({ add: [{}] })}>
                    Add row
                </Button>
                <Button onClick={() => {
                    const rows = gridRef?.current.api.getSelectedRows()
                    gridRef?.current.api.applyTransaction({ remove: rows })
                }}>
                    Delete selected rows
                </Button>
                <Button onClick={() => {
                    let colDefs = gridRef?.current?.api?.getColumnDefs()
                    colDefs.push({
                        field: "",
                        editable: true,
                        resizable: true,
                        headerComponentParams: { isInput: true }
                    })
                    gridRef?.current?.api?.setColumnDefs(colDefs);
                }}>
                    Add LaTeX
                </Button>
                <div className="ag-theme-alpine" style={{ height: 500 }}>
                    <AgGridReact style={{ width: '100%' }} ref={gridRef}
                        rowData={label ? label.map((edge, i) => {
                            let copy = {}
                            copy.label = edge
                            copy.source = source[i]?.id
                            copy.target = target[i]?.id
                            // console.log(copy.source !== undefined && copy.target !== undefined)
                            return (copy.source !== undefined && copy.target !== undefined) ? copy : null
                        }).filter((v, i) => v) : []}
                        columnDefs={columnDefs} rowSelection='multiple'
                        singleClickEdit
                        suppressRowClickSelection
                        autoSizeStrategy={autoSizeStrategy}
                        components={components}
                        headerHeight={65} />
                </div>
                <Button color="success" variant="contained" sx={{ m: 2 }} onClick={handleClose}>Continue?</Button>
            </Box>
        </Modal>
    )
}


export default function Graph({ setTotalHeight, template, type, i, idx, removeIdxFromGraphs, states, selectedIndexes, addToTemplate, projectSaveClicked }) {
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
    const divRef = useRef()
    const [nodesOpen, setNodesOpen] = useState(false)
    const [edgesOpen, setEdgesOpen] = useState(false)

    const schema = {
        // $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: 'schema',
        title: 'schema',
        type: 'object',
        properties: {
            model: { enum: ["linear", 'multiple', "polynomial", 'logarithmic'] },
            method: { enum: ['ols'] },
            xdata: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        data: { type: "array" },
                        dataset: {
                            type: "integer",
                            minimum: -1
                        }
                    }
                }
            },
            ydata: {
                type: "object",
                properties: {
                    data: { type: "array" },
                    dataset: {
                        type: "integer",
                        minimum: -1
                    }
                }
            },
            source: {
                type: "object",
                properties: {
                    data: { type: "array" },
                    dataset: {
                        type: "integer",
                        minimum: -1
                    }
                }
            },
            target: {
                type: "object",
                properties: {
                    data: { type: "array" },
                    dataset: {
                        type: "integer",
                        minimum: -1
                    }
                }
            },
            label: {
                type: "object",
                properties: {
                    data: { type: "array" },
                    dataset: {
                        type: "integer",
                        minimum: -1
                    }
                }
            },
            order: { type: "integer" },
            numberVar: { type: "integer" },
            regressionExpr: { type: "string" },
            checked: { type: "boolean" },
            tabValue: {
                type: "integer",
                minimum: 0,
                maximum: 1
            },
            xAxis: {
                type: "integer",
                minimum: 0
            },
            zAxis: {
                type: "integer",
                minimum: 0
            },
            directed: { type: "boolean" },
            stylesheet: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        "selector": { type: "string" },
                        "style": {
                            type: "object"
                        },
                    },
                    "required": ["selector", "style"]
                }

            }
        }
    }

    useEffect(() => {
        setTotalHeight(pheight => {
            return pheight + divRef.current.offsetHeight + 35
        })
        return () => {
            setTotalHeight(pheight => {
                return pheight - divRef.current.offsetHeight - 35
            })
        }
    }, [divRef])

    useEffect(() => {
        if (template) {
            setStylesheet(pstylesheet => {
                let copy = [...states.stylesheet]
                copy.forEach(style => {
                    Object.keys(style.style).forEach(key => {
                        if (style.style[key].isFunction) {
                            var func = new Function(`return ${style.style[key]?.str}`)
                            style.style[key] = func()
                        } else {
                            style.style[key] = style.style[key].str
                        }
                    })

                })
                return copy
            })
        } else {
            setStylesheet(states.stylesheet)
        }
    }, [template, states])

    const multipleReg = Array(Number(numberVar)).fill(0)
    registerTransform(transform.regression)

    useEffect(() => {
        if (selectedIndexes.includes(i) || projectSaveClicked) {
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
            }, i, 'graph')
        }

    }, [selectedIndexes, i, model, method, order, numberVar, regressionExpr, checked, xdata, ydata, tabValue, xAxis, zAxis, projectSaveClicked])
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
            let newLabel = label.data.slice(0, i)
            let nodes = new Set([...source.data, ...target.data])
            nodes = Array.from(nodes.values())
            nodes = nodes.map((v, i) => { return { data: v } })
            newLabel = newLabel.map((v, i) => { return { data: { source: source.data[i].id, target: target.data[i].id, label: `${v}` } } })
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

    const handleSourceNodes = (ev) => {
        setNodesOpen(true)

    }

    const handleLabels = (ev) => {
        setEdgesOpen(true)

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
        setSource({ data: data.data.map((v, i) => { return ({ id: v }) }), dataset: data.dataset })

    }

    function dropTarget(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.dataTransfer.getData('application/json'))
        if (data.data.length == 0) {
            alert('Please select target data!')
            return
        }

        setTarget({ data: data.data.map((v, i) => { return ({ id: v }) }), dataset: data.dataset })

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
            removeIdxFromGraphs(i, idx)
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

    const guiComponent = type == 'regression' ? <>
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
            <NetworkGraph elements={data} directed={directed} stylesheet={stylesheet} setStylesheet={setStylesheet} setSource={setSource} setTarget={setTarget} />
            <Grid container alignItems="center" justifyContent="center" alignContent='center' direction='row' columns={4}>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropSource(ev) }} onDragOver={allowDrop} onClick={handleSourceNodes}>Source Nodes</Button></Grid>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropTarget(ev) }} onDragOver={allowDrop} onClick={handleSourceNodes}>Target Nodes</Button></Grid>
                <Grid item xs={1} alignItems="center" alignContent='center'><Button alignItems="center" alignContent='center' onDrop={(ev) => { dropLabel(ev) }} onDragOver={allowDrop} onClick={handleLabels}>Edge Labels</Button></Grid>
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

    const handleCliChange = (value, event) => {
        console.log(value)
    }

    const ajv = new Ajv({ allErrors: true, verbose: true });

    const cliComponent = <Editor
        value={states}
        onChange={handleCliChange}
        ajv={ajv}
        schema={schema}
    />;


    return (
        <>
            <NodesModal nodesOpen={nodesOpen} setNodesOpen={setNodesOpen} type="source" node={[...source.data, ...target.data].filter((v, i, a) => a.findIndex(v2 => (v2.id == v.id)) === i)} setNode={setSource} />
            <EdgesModal edgesOpen={edgesOpen} setEdgesOpen={setEdgesOpen} label={label.data} source={source.data} target={target.data} setLabel={setLabel} setSource={setSource} setTarget={setTarget} />
            <div ref={divRef} onDoubleClick={(ev) => setBannerOpen(true)} style={{ width: '100%', position: 'relative' }} className='graph'>
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
                {cliComponent}
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
                            {guiComponent}
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