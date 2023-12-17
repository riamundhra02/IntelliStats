import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper/Paper'
import './App.css';
import Sheet from './Data/Sheet';
import { theme } from './Theme'
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Graph from './Graph/Graph'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'

function App() {
    const [dataSources, setDataSources] = useState([])
    const [exportt, setExport] = useState('')
    const [regression, setRegression] = useState([])
    const [selectedRect, setSelectedRect] = useState({
        pivotX: 0,
        pivotY: 0,
        width: 0,
        height: 0
    })
    const [mouseDown, setMouseDown] = useState(false)
    const [sheetDrag, setSheetDrag] = useState(false)
    const [currentScroll, setCurrentScroll] = useState(0)
    const [selectedGraphIndexes, setSelectedGraphIndexes] = useState([])
    const [selectedDataIndexes, setSelectedDataIndexes] = useState([])
    const [template, setTemplate] = useState({ graph: [], data: [] })

    function startRect(ev) {
        setSelectedRect({
            pivotX: ev.clientX,
            pivotY: ev.clientY + currentScroll,
            width: 0,
            height: 0
        })
        setMouseDown(true)
    }

    function updateRect(ev) {
        if (mouseDown && !sheetDrag) {
            setSelectedRect({
                pivotX: selectedRect.pivotX,
                pivotY: selectedRect.pivotY,
                width: ev.clientX - selectedRect.pivotX,
                height: ev.clientY - selectedRect.pivotY + currentScroll
            })
        } else if (sheetDrag) {
            setSelectedRect({
                pivotX: 0,
                pivotY: 0,
                width: 0,
                height: 0
            })
            setSelectedDataIndexes([])
            setSelectedGraphIndexes([])
        }
    }

    function finishRect(ev) {
        setMouseDown(false)
        setSelectedRect({
            pivotX: 0,
            pivotY: 0,
            width: 0,
            height: 0
        })
    }


    const graphStates = {
        model: 'linear',
        method: 'ols',
        xdata: [{ data: [], dataset: -1 }],
        ydata: { data: [], dataset: -1 },
        order: 1,
        numberVar: 1,
        regressionExpr: '',
        checked: true
    }

    function removeIdxFromGraphs(idx) {
        let clone = [...regression]
        clone.splice(idx, 1)
        setRegression(clone)
    }

    function addToTemplate(state, idx, type) {
        if (type == 'graph') {
            let copy = [...template.graph]
            copy[idx] = state
            setTemplate({ data: template.data, graph: copy })
        } else {
            let copy = [...template.data]
            copy[idx] = state
            setTemplate({ data: copy, graph: template.graph })
        }
    }

    function updateSelectedIndexes(i, type) {
        let index, copy, setter;
        if (type == 'graph') {
            index = selectedGraphIndexes.indexOf(i)
            copy = [...selectedGraphIndexes]
            setter = setSelectedGraphIndexes
        } else {
            index = selectedDataIndexes.indexOf(i)
            copy = [...selectedDataIndexes]
            setter = setSelectedDataIndexes
        }
        if (index > -1) {
            copy.splice(index, 1)
            setter(copy)
        } else {
            copy.push(i)
            setter(copy)
        }
    }

    useEffect(() => {
        const handleScroll = event => {
            setCurrentScroll(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        window.ipcRenderer.on('Import', (event, m) => {
            setDataSources(
                [
                    ...dataSources,
                    m.data
                ]
            );
        });

        window.ipcRenderer.on('ExportData', (event, m) => {
            if (dataSources.length == 0) {
                alert('No data to export!')
            } else {
                setExport(m)
            }
        });

        window.ipcRenderer.on('importTemplate', (event, m) => {
            let dataCopy = [...dataSources]
            setDataSources([
                ...dataSources,
                ...m.data.map((dataset, i) => { return dataset.data })
            ])

            setRegression(
                [
                    ...regression,
                    ...m.graph
                ])
        });

        window.ipcRenderer.on('Regression', (event, m) => {
            setRegression(
                [
                    ...regression,
                    {
                        idx: m,
                        states: graphStates
                    }
                ]
            )
        })

        window.ipcRenderer.on('SaveAsTemplate', (event, m) => {
            if (selectedGraphIndexes.length == 0) {
                alert('Nothing selected! ')
            } else {
                let conf = window.confirm("Save selection as template?")
                if (conf) {
                    let filteredData = template.data.filter((v, i) => { return selectedDataIndexes.includes(i) })
                    let filteredGraphs = template.graph.filter((v, i) => { return selectedGraphIndexes.includes(i) })
                    let alertNeeded = false
                    let formattedGraphs = filteredGraphs.map((v, i) => {
                        let xdata_new = v.xdata.map((x, j) => {
                            if (selectedDataIndexes.includes(x.dataset)) {
                                return x
                            } else {
                                alertNeeded = true
                                return { data: [], dataset: -1 }
                            }
                        })

                        let ydata_new
                        if (selectedDataIndexes.includes(v.ydata.dataset)) {
                            ydata_new = v.ydata
                        } else {
                            alertNeeded = true
                            ydata_new = { data: [], dataset: -1 }
                        }

                        let copy = { ...v }
                        copy.xdata = xdata_new
                        copy.ydata = ydata_new

                        console.log(copy)
                        return copy
                    })

                    let dataConfirm = true
                    if (alertNeeded) {
                        dataConfirm = window.confirm("At least one regression model selected requires data from outside the selection. If you continue, the model will be saved without the data. Continue?")

                    }

                    if (dataConfirm) {
                        console.log({ graph: filteredGraphs, data: filteredData })
                        window.ipcRenderer.send('saveTemplate', { graph: formattedGraphs, data: filteredData })
                    }
                }
            }
        })
        return function cleanup() {
            window.ipcRenderer.removeAllListeners('Import')
            window.ipcRenderer.removeAllListeners('ExportData')
            window.ipcRenderer.removeAllListeners('Regression')
            window.ipcRenderer.removeAllListeners('SaveAsTemplate')
            window.ipcRenderer.removeAllListeners('importTemplate')

        }
    }, [dataSources, regression, selectedGraphIndexes, template]);

    useEffect(() => {
        setTemplate({ graph: new Array(regression.length), data: new Array(dataSources.length) })
    }, [regression])

    let dict = {}
    regression.forEach((v, i) => {
        dict[i] = <Button key={v.idx} disableRipple onClick={(ev) => { ev.stopPropagation(); if (selectedGraphIndexes.length == 0 || ev.crtlKey || ev.metaKey || (selectedGraphIndexes.length == 1 && selectedGraphIndexes.includes(i))) { updateSelectedIndexes(i, 'graph') } else { setSelectedGraphIndexes([]); setSelectedDataIndexes([]) } }}
            sx={{
                flexDirection: 'column',
                width: '100%',
                bgcolor: selectedGraphIndexes.includes(i) ? '#eceff1' : '',
                border: selectedGraphIndexes.includes(i) ? '1px solid' : '',
                borderColour: '#0d47a1',
                "&.MuiButtonBase-root:hover": {
                    bgcolor: selectedGraphIndexes.includes(i) ? '#eceff1' : ''
                }
            }}
            onMouseMove={
                (ev) => {
                    if (!sheetDrag && mouseDown && selectedGraphIndexes.indexOf(i) == -1) {
                        let copy = [...selectedGraphIndexes]
                        copy.push(i)
                        setSelectedGraphIndexes(copy)
                    }
                }
            }
            // onMouseOut={(ev) => {
            //     if (!sheetDrag && mouseDown) {
            //         updateSelectedIndexes(i, 'graph')

            //     }
            // }}
        >
            <Graph idx={i} setSheetDrag={setSheetDrag} removeIdxFromGraphs={removeIdxFromGraphs} states={v.states} selectedIndexes={selectedGraphIndexes} addToTemplate={addToTemplate} onClick={(ev) => { ev.stopPropagation() }} />
        </Button >
    })

    return (
        <div onMouseMove={updateRect} onMouseDown={startRect} onMouseUp={finishRect} onClick={(ev) => { if (!(ev.crtlKey || ev.metaKey)) { setSelectedGraphIndexes([]); setSelectedDataIndexes([]) } }}>
            <ThemeProvider theme={theme} >
                {selectedRect.width != 0 && selectedRect.height != 0 ? <Box
                    sx={{
                        bgcolor: '#1565c0',
                        color: '#64b5f6',
                        border: '1px solid',
                        borderColor: '#0d47a1',
                        p: 2,
                        position: 'absolute',
                        top: selectedRect.height > 0 ? selectedRect.pivotY + 'px' : (selectedRect.pivotY + selectedRect.height) + 'px',
                        left: selectedRect.width > 0 ? selectedRect.pivotX + 'px' : (selectedRect.pivotX + selectedRect.width) + 'px',
                        zIndex: 'tooltip',
                        height: Math.abs(selectedRect.height) + 'px',
                        width: Math.abs(selectedRect.width) + 'px',
                        opacity: '40%'
                    }}
                    onMouseMove={updateRect}
                    onMouseUp={finishRect}
                /> : <></>}
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={
                            <Paper elevation={3} sx={{ width: 4 / 5, m: 'auto', mt: '3rem', height: 'auto', padding: '1rem', minHeight: 1000 }}>
                                {dataSources.map((m, i) => {
                                    return (
                                        <Button key={i} disableRipple onClick={(ev) => { ev.stopPropagation(); if (!sheetDrag && (selectedDataIndexes.length == 0 || ev.crtlKey || ev.metaKey || (selectedDataIndexes.length == 1 && selectedGraphIndexes.includes(i)))) { updateSelectedIndexes(i, 'data') } else { setSelectedDataIndexes([]); setSelectedGraphIndexes([]) } }}
                                            sx={{
                                                flexDirection: 'column',
                                                width: '100%',
                                                bgcolor: selectedDataIndexes.includes(i) ? '#eceff1' : '',
                                                border: selectedDataIndexes.includes(i) ? '1px solid' : '',
                                                borderColour: '#0d47a1',
                                                "&.MuiButtonBase-root:hover": {
                                                    bgcolor: selectedDataIndexes.includes(i) ? '#eceff1' : ''
                                                }
                                            }}
                                            onMouseMove={
                                                (ev) => {
                                                    if (!sheetDrag && mouseDown && selectedDataIndexes.indexOf(i) == -1) {
                                                        let copy = [...selectedDataIndexes]
                                                        copy.push(i)
                                                        setSelectedDataIndexes(copy)
                                                    }
                                                }
                                            }
                                        >
                                            <Sheet data={m} exportClicked={exportt} setExportClicked={setExport} setSheetDrag={setSheetDrag} index={i} selectedIndexes={selectedDataIndexes} addToTemplate={addToTemplate} onClick={(ev) => { console.log('hello'); ev.stopPropagation() }} />
                                        </Button>
                                    )
                                })
                                }
                                {Object.values(dict)}
                            </Paper>} />


                    </Routes>
                </BrowserRouter>
            </ThemeProvider >
        </div>

    );
}

export default App;