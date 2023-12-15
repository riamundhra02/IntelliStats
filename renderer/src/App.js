import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper/Paper'
import './App.css';
import Sheet from './Data/Sheet';
import { theme } from './Theme'
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Graph from './Graph/Graph'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    let [dataSources, setDataSources] = useState([])
    let [exportt, setExport] = useState('')
    let [regression, setRegression] = useState([])

    const graphStates = {
        model: 'linear',
        method: 'ols',
        xdata: [[]],
        ydata: [],
        order: 1,
        numberVar: 1,
        regressionExpr: '',
        checked: true
    }

    function removeIdxFromGraphs(idx) {
        let clone = [...regression]
        console.log(clone)
        clone.splice(idx, 1)
        setRegression(clone)
    }

    useEffect(() => {
        let data = false
        window.ipcRenderer.on('Import', (event, m) => {
            setDataSources(
                [
                    ...dataSources,
                    m.data
                ]
            );
            data = true
        });

        window.ipcRenderer.on('ExportData', (event, m) => {
            if (!data) {
                alert('No data to export!')
            } else {
                setExport(m)
            }
        });

        window.ipcRenderer.on('Regression', (event, m) => {
            if (regression.length == 0) {
                setRegression([m])
            } else {
                setRegression(
                    [
                        ...regression,
                        m
                    ]
                )
            }
        })
        return function cleanup() {
            window.ipcRenderer.removeAllListeners('Import')
            window.ipcRenderer.removeAllListeners('ExportData')
            window.ipcRenderer.removeAllListeners('Regression')

        }
    }, [dataSources, regression]);

    let dict = {}
    regression.forEach((v, i) => {
        dict[i] = <Graph key={v} idx={i} removeIdxFromGraphs={removeIdxFromGraphs} states={graphStates}/>
    })

    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={
                        <Paper elevation={3} sx={{ width: 4 / 5, m: 'auto', mt: '3rem', height: 'auto', padding: '1rem', minHeight: 1000 }}>
                            {dataSources.map((m, i) => {
                                return (
                                    <Sheet data={m} key={i} exportClicked={exportt} setExportClicked={setExport} />
                                )
                            })
                            }
                            {Object.values(dict)}
                        </Paper>} />
        

                </Routes>
            </BrowserRouter>
        </ThemeProvider >


    );
}

export default App;