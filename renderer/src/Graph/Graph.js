import { useState, useEffect, useRef, useMemo, useContext } from 'react'
import { DataContext } from "../App";
import InputLabel from '@mui/material/InputLabel';
import { registerTransform } from 'echarts/core';
import { transform, regression } from 'echarts-stat';
import { styled } from '@mui/material/styles';
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
import Switch from '@mui/material/Switch'
import CustomTabPanel from './CustomTabPanel'
import { AgGridReact } from 'ag-grid-react'
// import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { registerSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import cssSchema from './cssschema.json'
import { JsonEditor as Editor } from 'jsoneditor-react';
import Ajv from 'ajv';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const CustomHeader = ({ dataSources, displayName, isInput, api, column }) => {
    const [name, setName] = useState(displayName)
    const [key, setKey] = useState('');
    const options = dataSources?.map((source, i) => { return { keys: Object.keys(source.data[0]), idx: i } }).flat()
    const onInputFieldChange = (ev) => {
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

    const onDropDownChange = (ev) => {
        setKey(ev.target.value)
        let key = ev.target.value.substring(0, ev.target.value.lastIndexOf(" "))
        let idx = Number.parseInt(ev.target.value.substring(ev.target.value.lastIndexOf(" "), ev.target.value.length))
        let colDefs = api.getColumnDefs();
        let id = column.getColId()
        let editColDef;
        colDefs.forEach(colDef => {
            if (colDef.colId == id) {
                editColDef = colDef;
            }
        })
        editColDef.field = key;
        api.setColumnDefs(colDefs);

        let rowData = [];
        api.forEachNode((node, i) => {
            let currentData = { ...node.data }
            currentData[key] = dataSources[idx].data[i] ? `${dataSources[idx].data[i][key]}` : ''
            node.updateData(currentData)
        });
        // console.log([...rowData])
        // rowData = rowData.map((row, i) => {
        //     let copy = { ...row }
        //     copy[key] = dataSources[idx].data[i] ? dataSources[idx].data[i][key] : ''
        //     return copy

        // })
        // api.applyTransaction({ remove: rowData, add: rowData })
    };
    return (
        <div class="ag-cell-label-container" role="presentation" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {isInput ? dataSources ? <Select
                value={key}
                label="Attribute Name"
                onChange={onDropDownChange}
                sx={{
                    width: "100%"
                }}
            >
                {options.map(opt => {
                    return opt.keys.map((key, i) => {
                        return <MenuItem key={i} idx={opt.idx} value={`${key} ${opt.idx}`}>{key}</MenuItem>
                    }
                    )
                })}
            </Select> : <TextField className="ag-header-cell-text" variant="filled" size="small" label="Attribute Name" margin='none' sx={{ padding: 0 }} onChange={onInputFieldChange} value={name} /> : <span class="ag-header-cell-text" style={{ fontSize: 16 }}>{name}</span>}
        </div>

    )
}

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
        margin: 1,
        padding: 0,
        transform: 'translateX(6px)',
        '&.Mui-checked': {
            color: '#fff',
            transform: 'translateX(22px)',
            '& .MuiSwitch-thumb:before': {
                // position: 'absolute',
                width: '70%',
                height: '70%',
                // top: "'10%",
                // left: '10%',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>code-json</title><path d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" /></svg>')`,
            },
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#cfd8dc',
        width: 32,
        height: 32,
        '&::before': {
            content: "''",
            position: 'absolute',
            width: '70%',
            height: '70%',
            left: "15%",
            top: "15%",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chart-box-multiple-outline</title><path d="M20 16V4H8V16M22 16C22 17.1 21.1 18 20 18H8C6.9 18 6 17.1 6 16V4C6 2.9 6.9 2 8 2H20C21.1 2 22 2.9 22 4M16 20V22H4C2.9 22 2 21.1 2 20V7H4V20M16 11H18V14H16M13 6H15V14H13M10 8H12V14H10Z" /></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 20 / 2,
    },
}));


const NodesModal = ({ nodesOpen, setNodesOpen, node, setNode }) => {
    const getRowId = (params) => params.data.id;
    const dataSources = useContext(DataContext)
    const gridRef = useRef()
    const [labelNum, setLabelNum] = useState(0)
    const [rowData, setRowData] = useState([])
    const [numRows, setNumRows] = useState(1)
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'id',
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
                    if (add && key != 'label') {
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
        setRowData(node ? node : [])

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
            rowData.push(node.data);
        });
        return rowData
    };

    const handleClose = (ev) => {
        let tableData = getRowData()
        tableData = tableData.map(data => {
            data.label = data.id
            return data
        })
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
                <TextField label="Add Rows" type="number" value={numRows} onChange={(ev) => { setNumRows(ev.target.valueAsNumber) }} sx={{ mt: 2, width: '24%' }} InputProps={{
                    endAdornment: <Button onClick={() => { gridRef?.current.api.applyTransaction({ add: new Array(numRows).fill().map(u => { let a = {}; setLabelNum(labelNum => { a.id = `Node_${labelNum}`; return labelNum + 1 }); return a }) }) }}>
                        Add
                </Button>
                }}></TextField>

                <Button sx={{ width: "24%" }} onClick={() => {
                    const rows = gridRef?.current.api.getSelectedRows()
                    gridRef?.current.api.applyTransaction({ remove: rows })
                }}>
                    Delete selected rows
                </Button>
                <Button sx={{ width: "24%" }} onClick={() => {
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
                <Button sx={{ width: "24%" }} onClick={() => {
                    let colDefs = gridRef?.current?.api?.getColumnDefs()
                    colDefs.push({
                        field: "",
                        editable: true,
                        resizable: true,
                        headerComponentParams: { isInput: true, dataSources: dataSources }
                    })
                    gridRef?.current?.api?.setColumnDefs(colDefs);
                }}>
                    Add Attribute From Data
                </Button>
                <div className="ag-theme-alpine" style={{ height: 500 }}>
                    <AgGridReact style={{ width: '100%' }} ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs} rowSelection='multiple'
                        singleClickEdit
                        suppressRowClickSelection
                        autoSizeStrategy={autoSizeStrategy}
                        components={components}
                        headerHeight={65}
                        getRowId={getRowId} />
                </div>
                <Button color="success" variant="contained" sx={{ m: 2 }} onClick={handleClose}>Continue?</Button>
            </Box>
        </Modal>
    )
}

const EdgesModal = ({ nodes, edgesOpen, setEdgesOpen, source, target, label, setLabel, setSource, setTarget }) => {
    const gridRef = useRef()
    const [rowData, setRowData] = useState([])
    const dataSources = useContext(DataContext)
    const [numRows, setNumRows] = useState(1)
    const [labelNum, setLabelNum] = useState(0)
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'id',
            editable: true,
            resizable: true,
            headerComponentParams: { isInput: false },
            cellDataType: 'text'
        },
        {
            field: 'source',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: nodes.map(n => n.id),
            },
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
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: nodes.map(n => n.id),
            },
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
                        if (col.field == key) {
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
        setRowData(label ? label.map((edge, i) => {
            let copy = {...edge}
            copy.source = source[i]?.id
            copy.target = target[i]?.id
            return (copy.source !== undefined && copy.target !== undefined) ? copy : null
        }).filter((v, i) => v) : [])

    }, [label])

    useEffect(() => {
        setColumnDefs(pColDefs => {
            let copy = [...pColDefs]
            let index_source = pColDefs.findIndex(col => col.field == "source")
            copy[index_source].cellEditorParams = { values: nodes.map(n => n.id)}
            let index_target = pColDefs.findIndex(col => col.field == "target")
            copy[index_target].cellEditorParams = { values: nodes.map(n => n.id)}
            return copy
        })
    }, [nodes])

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
        setLabel(plabel => {
            let copy = tableData.map(data => { return {...data}})
            return { data: copy, dataset: plabel.dataset }

        })

        setSource(psource => {
            let copy = tableData.map(data => { return { id: data.source } })
            let res = copy
            psource.data.forEach(node => {
                let idx = res.findIndex(snode => snode.id == node.id )
                if(idx < 0){
                    res.push(node)
                } else{
                    res[idx] = node
                }
            })
            return { data: res, dataset: psource.dataset }

        })

        setTarget(ptarget => {
            let copy = tableData.map(data => { return { id: data.target } })
            let res = copy
            ptarget.data.forEach(node => {
                let idx = res.findIndex(snode => snode.id == node.id )
                if(idx < 0){
                    res.push(node)
                } else{
                    res[idx] = node
                }
            })
            return { data: res, dataset: ptarget.dataset }

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
                <TextField label="Add Rows" type="number" value={numRows} onChange={(ev) => { setNumRows(ev.target.valueAsNumber) }} sx={{ mt: 2, width: '24%' }} InputProps={{
                    endAdornment: <Button onClick={() => { gridRef?.current.api.applyTransaction({ add: new Array(numRows).fill().map(u => { let a = {}; setLabelNum(labelNum => { a.id = `Edge_${labelNum}`; return labelNum + 1 }); return a }) }) }}>
                        Add
                </Button>
                }}></TextField>
                <Button sx={{ width: "24%" }} onClick={() => {
                    const rows = gridRef?.current.api.getSelectedRows()
                    gridRef?.current.api.applyTransaction({ remove: rows })
                }}>
                    Delete selected rows
                </Button>
                <Button sx={{ width: "24%" }} onClick={() => {
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
                <Button sx={{ width: "24%" }} onClick={() => {
                    let colDefs = gridRef?.current?.api?.getColumnDefs()
                    colDefs.push({
                        field: "",
                        editable: true,
                        resizable: true,
                        headerComponentParams: { isInput: true, dataSources: dataSources }
                    })
                    gridRef?.current?.api?.setColumnDefs(colDefs);
                }}>
                    Add Attribute From Data
                </Button>
                <div className="ag-theme-alpine" style={{ height: 500 }}>
                    <AgGridReact style={{ width: '100%' }} ref={gridRef}
                        rowData={rowData}
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
    const [savedHeight, setSavedHeight] = useState(0)
    const [mode, setMode] = useState(true)

    const currentStates = {
        model: model,
        method: method,
        order: order,
        numberVar: numberVar,
        regressionExpr: regressionExpr,
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
        stylesheet: stylesheet
    }

    const setters = {
        model: setModel,
        method: setMethod,
        order: setOrder,
        numberVar: setNumberVar,
        regressionExpr: setRegressionExpr,
        checked: setChecked,
        xdata: setXData,
        ydata: setYData,
        tabValue: setTabValue,
        xAxis: setXAxis,
        zAxis: setZAxis,
        source: setSource,
        target: setTarget,
        label: setLabel,
        directed: setDirected,
        stylesheet: setStylesheet
    }

    const subset = type == "regression" ? ["model", "method", "xdata", "ydata", "order", "numberVar", "regressionExpr", "checked", "xAxis", "zAxis"] : ["source", "target", "label", "directed", "stylesheet"]

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
        },
        required: subset
    }

    useEffect(() => {

        if (divRef.current.offsetHeight != savedHeight) {
            setSavedHeight(divRef.current.offsetHeight)
            setTotalHeight(pheight => {
                return pheight + divRef.current.offsetHeight + 45
            })
        }
        return () => {
            if (savedHeight != 0) {
                setTotalHeight(pheight => {
                    return pheight - savedHeight - 45
                })
                setSavedHeight(0)
            }
        }

    }, [divRef, savedHeight])

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
            let nodes = Array.from([...source.data, ...target.data].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i))
            nodes = nodes.map((v, i) => { return { data: v } })
            newLabel = newLabel.map((v, i) => { return { data: { source: source.data[i].id, target: target.data[i].id, ...v } } })
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
        setLabel({ data: data.data.map((v, i) => { return ({ label: v }) }), dataset: data.dataset })

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
            <NetworkGraph elements={data} directed={directed} stylesheet={stylesheet} setStylesheet={setStylesheet} setSource={setSource} setTarget={setTarget} setLabel={setLabel}/>
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

    const getDiff = (a, b) => {
        if (a === b) return [];
        let keys = Object.keys(a);
        return keys.reduce((prev, current, i) => {
            let toAdd;
            if (typeof a[current] == 'object' || typeof a[current] == 'array') {
                toAdd = (getDiff(a[current], b[current]).length ? [current] : [])
            } else {
                toAdd = a[current] !== b[current] ? [current] : []
            }
            return [...prev, ...toAdd]


        }, [])
    }

    const handleCliChange = (value, event) => {
        const filteredStates = subset.reduce((obj, key) => { obj[key] = currentStates[key]; return obj }, {})
        let diff = getDiff(value, filteredStates)
        diff.forEach(key => {
            (setters[key])(value[key])
        })
    }

    const ajv = new Ajv({ allErrors: true, verbose: true });

    const cliComponent = <Editor
        value={subset.reduce((obj, key) => { obj[key] = currentStates[key]; return obj }, {})}
        onChange={handleCliChange}
        ajv={ajv}
        schema={schema}
        allowModes={true}
    />;

    return (
        <>
            <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1">GUI</Typography>
                <MaterialUISwitch checked={mode} onChange={(ev) => setMode(ev.target.checked)} />
                <Typography variant="body1">CLI</Typography>
            </FormControl>
            <NodesModal nodesOpen={nodesOpen} setNodesOpen={setNodesOpen} type="source" node={Array.from([...source.data, ...target.data].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i))} setNode={setSource} />
            <EdgesModal edgesOpen={edgesOpen} setEdgesOpen={setEdgesOpen} label={label.data} source={source.data} target={target.data} setLabel={setLabel} setSource={setSource} setTarget={setTarget} nodes={Array.from([...source.data, ...target.data].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i))}/>
            <div ref={divRef} onDoubleClick={(ev) => setBannerOpen(true)} style={{ width: '100%', position: 'relative', height: 'max-content' }} className='graph'>
                <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                    <Grid item xs={8} />
                    <Grid item xs={1}>
                        <IconButton aria-label="delete" onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                {type == 'regression' && !mode ? <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
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
                {mode ? cliComponent : guiComponent}
                <br />
                <br />
                {type == 'regression' && !mode ?
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
                            {mode ? cliComponent : guiComponent}
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