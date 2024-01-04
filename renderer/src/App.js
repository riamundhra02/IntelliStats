import React, { useEffect, useState, useRef } from 'react';
import Paper from '@mui/material/Paper/Paper'
import './App.css';
import Sheet from './Data/Sheet';
import { theme } from './Theme'
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Graph from './Graph/Graph'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import TrapFocus from '@mui/material/Unstable_TrapFocus';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid/Grid'
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

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
    const [currentScroll, setCurrentScroll] = useState(0)
    const [selectedGraphIndexes, setSelectedGraphIndexes] = useState([])
    const [selectedDataIndexes, setSelectedDataIndexes] = useState([])
    const [template, setTemplate] = useState({ graph: [], data: [] })
    const [saveClicked, setSaveClicked] = useState(false)
    const [projectSaveClicked, setProjectSaveClicked] = useState(false)
    const [continueClicked, setContinueClicked] = useState(false)
    const pdfRef = useRef()

    const options = {
        method: 'save',
        resolution: Resolution.HIGH,
        page: {
            margin: Margin.SMALL,
            format: 'letter',
            orientation: 'portait',
        }
    };

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
        if (mouseDown && saveClicked) {
            setSelectedRect({
                pivotX: selectedRect.pivotX,
                pivotY: selectedRect.pivotY,
                width: ev.clientX - selectedRect.pivotX,
                height: ev.clientY - selectedRect.pivotY + currentScroll
            })
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
        checked: true,
        tabValue: 0,
        xAxis: 0,
        zAxis: 1
    }

    function removeIdxFromGraphs(idx) {
        let clone = [...regression]
        clone.splice(idx, 1)
        setRegression(clone)
    }

    function removeIdxFromData(idx) {
        let clone = [...dataSources]
        clone.splice(idx, 1)
        setDataSources(clone)
    }

    useEffect(() => {
        console.log(selectedDataIndexes, selectedGraphIndexes)
        if (continueClicked || projectSaveClicked) {
            console.log(selectedDataIndexes, selectedGraphIndexes)
            if (selectedGraphIndexes.length + selectedDataIndexes.length == 0 && !projectSaveClicked) {
                alert('Nothing to save!')
            } else {
                let conf = projectSaveClicked ? true : window.confirm("Save selection as template?")
                if (conf) {
                    setTemplate((template) => {
                        let filteredData = projectSaveClicked ? template.data : template.data.filter((v, i) => { return selectedDataIndexes.includes(i) })
                        let filteredGraphs = projectSaveClicked ? template.graph : template.graph.filter((v, i) => { return selectedGraphIndexes.includes(i) })
                        let alertNeeded = false
                        let formattedGraphs = projectSaveClicked ? filteredGraphs : filteredGraphs.map((v, i) => {
                            let xdata_new = v.xdata.map((x, j) => {
                                if (selectedDataIndexes.includes(x.dataset)) {
                                    return x
                                } else {
                                    alertNeeded = alertNeeded || x.dataset > -1
                                    return { data: [], dataset: -1 }
                                }
                            })

                            let ydata_new
                            if (selectedDataIndexes.includes(v.ydata.dataset)) {
                                ydata_new = v.ydata
                            } else {
                                alertNeeded = alertNeeded || v.ydata.dataset > -1
                                ydata_new = { data: [], dataset: -1 }
                            }

                            let copy = { ...v }
                            copy.xdata = xdata_new
                            copy.ydata = ydata_new

                            return copy
                        })

                        let dataConfirm = alertNeeded ? window.confirm("At least one regression model selected requires data from outside the selection. If you continue, the model will be saved without the data. Continue?") : true

                        if (dataConfirm) {
                            window.ipcRenderer.send('saveTemplate', { graph: formattedGraphs, data: filteredData, save: projectSaveClicked ? 'project' : 'template' })
                        }
                        return { data: [], graph: [] }
                    })
                }
            }
            setSaveClicked(false)
            setContinueClicked(false)
            setProjectSaveClicked(false)
            setSelectedGraphIndexes([])
            setSelectedDataIndexes([])

        }
    }, [selectedGraphIndexes, selectedDataIndexes, saveClicked, continueClicked, projectSaveClicked, template])

    function addToTemplate(state, idx, type) {
        if (saveClicked || projectSaveClicked) {
            if (type == 'graph') {
                setTemplate((ptemplate) => {
                    let copy = [...ptemplate.graph]
                    copy[idx] = state
                    return { data: ptemplate.data, graph: copy }
                })
            } else {
                setTemplate((ptemplate) => {
                    let copy = [...ptemplate.data]
                    copy[idx] = state
                    return { data: copy, graph: ptemplate.graph }
                })
            }
        }
    }

    function updateSelectedIndexes(i, type) {
        console.log(i,type)
        if (saveClicked) {
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
                console.log(copy)
            } else {
                copy.push(i)
                setter(copy)
                console.log(copy)
            }
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
        window.ipcRenderer.send('loaded', 'loaded')
    }, [])

    useEffect(() => {
        window.ipcRenderer.on('Import', (event, m) => {
            setDataSources(
                [
                    ...dataSources,
                    {
                        idx: m.idx,
                        data: m.data
                    }
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

        window.ipcRenderer.on('exportPDF', (event, m) => {
            generatePDF(pdfRef, options)
        });

        window.ipcRenderer.on('importTemplate', (event, m) => {
            setDataSources((dataSources) => {
                return [
                    ...dataSources,
                    ...m.data
                ]
            })

            setRegression((regression) => {
                return [
                    ...regression,
                    ...m.graph
                ]
            })
        });

        window.ipcRenderer.on('openProject', (event, m) => {
            let conf = m.test ? true : window.confirm("Opening a new project will cause any unsaved data in the current window to be lost. Continue?")
            if (conf) {
                setDataSources(m.data)

                setRegression(m.graph)
            }

        });

        window.ipcRenderer.on('Regression', (event, m) => {
            setRegression((regression) => {
                return [
                    ...regression,
                    {
                        idx: m,
                        states: graphStates
                    }
                ]
            })
        })

        window.ipcRenderer.on('SaveAsTemplate', (event, m) => {
            alert("Please select items to save to template, then click Continue")
            setSaveClicked(true)
        })

        window.ipcRenderer.on('SaveProject', (event, m) => {
            setProjectSaveClicked(true)
        })

        return function cleanup() {
            window.ipcRenderer.removeAllListeners('Import')
            window.ipcRenderer.removeAllListeners('ExportData')
            window.ipcRenderer.removeAllListeners('Regression')
            window.ipcRenderer.removeAllListeners('SaveAsTemplate')
            window.ipcRenderer.removeAllListeners('SaveProject')
            window.ipcRenderer.removeAllListeners('importTemplate')
            window.ipcRenderer.removeAllListeners('exportPDF')
            window.ipcRenderer.removeAllListeners('openProject')

        }
    }, [dataSources, regression, selectedGraphIndexes, template]);

    useEffect(() => {
        setTemplate({ graph: new Array(regression.length), data: new Array(dataSources.length) })
    }, [regression])

    let dict = {}
    regression.forEach((v, i) => {
        dict[i] = <Button key={v.idx} disableRipple
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
                    if (saveClicked && mouseDown && selectedGraphIndexes.indexOf(i) == -1) {
                        let copy = [...selectedGraphIndexes]
                        copy.push(i)
                        setSelectedGraphIndexes(copy)
                    }
                }
            }
            onClick={(ev) => { ev.stopPropagation(); if (selectedGraphIndexes.length + selectedDataIndexes.length == 0 || ev.crtlKey || ev.metaKey || (selectedGraphIndexes.length + selectedDataIndexes.length == 1 && selectedGraphIndexes.includes(i))) { updateSelectedIndexes(i, 'graph') } else { setSelectedDataIndexes([]); setSelectedGraphIndexes([]) } }}
        // onMouseOut={(ev) => {
        //     if (mouseDown) {
        //         updateSelectedIndexes(i, 'graph')

        //     }
        // }}
        >
            <Graph idx={i} projectSaveClicked={projectSaveClicked} removeIdxFromGraphs={removeIdxFromGraphs} states={v.states} selectedIndexes={selectedGraphIndexes} addToTemplate={addToTemplate} className="graph"/>
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
                            <Paper ref={pdfRef} elevation={3} sx={{ width: 4 / 5, m: 'auto', mt: '3rem', height: 'auto', padding: '1rem', minHeight: 1000 }}>
                                {dataSources.map((m, i) => {
                                    return (
                                        <Button key={m.idx} disableRipple onClick={(ev) => { ev.stopPropagation(); if (selectedDataIndexes.length + selectedGraphIndexes.length == 0 || ev.crtlKey || ev.metaKey || (selectedDataIndexes.length + selectedGraphIndexes.length == 1 && selectedDataIndexes.includes(i))) { updateSelectedIndexes(i, 'data') } else { setSelectedDataIndexes([]); setSelectedGraphIndexes([]) } }}
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
                                                    if (saveClicked && mouseDown && selectedDataIndexes.indexOf(i) == -1) {
                                                        let copy = [...selectedDataIndexes]
                                                        copy.push(i)
                                                        setSelectedDataIndexes(copy)
                                                    }
                                                }
                                            }
                                        >
                                            <Sheet projectSaveClicked={projectSaveClicked} data={m.data} exportClicked={exportt} setExportClicked={setExport} index={i} selectedIndexes={selectedDataIndexes} addToTemplate={addToTemplate} key={m.idx} removeIdxFromData={removeIdxFromData} className="sheet"/>
                                        </Button>
                                    )
                                })
                                }
                                {Object.values(dict)}
                            </Paper>} />


                    </Routes>
                </BrowserRouter>
            </ThemeProvider >
            <TrapFocus open disableAutoFocus disableEnforceFocus>
                <Fade appear={false} in={saveClicked}>
                    <Paper
                        role="dialog"
                        aria-modal="false"
                        square
                        variant="outlined"
                        tabIndex={-1}
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            right: 0,
                            m: 0,
                            p: 2,
                            borderWidth: 2,
                            width: '100%',
                            zIndex: 10,
                            bgcolor: 'lightgray'
                        }}
                        onClick={(ev) => { ev.stopPropagation()}}
                    >
                        <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center'>
                            <Grid item xs={8} />
                            <Grid item xs={1}>
                                <Button onClick={(ev) => { ev.stopPropagation(); setContinueClicked(true) }}>Continue?</Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Fade>
            </TrapFocus>
        </div>

    );
}

export default App;