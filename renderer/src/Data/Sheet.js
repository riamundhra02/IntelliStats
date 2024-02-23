import React, { useEffect, useState, useRef, useCallback } from 'react';
import Grid from '@mui/material/Grid/Grid'
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { AgGridReact} from 'ag-grid-react'
import { RangeSelectionModule } from "ag-grid-enterprise";
import { ModuleRegistry } from "ag-grid-community/";
import { ClientSideRowModelModule } from "ag-grid-community";
import { GridChartsModule } from "ag-grid-enterprise/chartsModule";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);

const Renderer = (props) => {
    const [child, setChild] = useState(null)
    const inRange = () => {
        let ret = false
        if (props.range) {
            props.range.every(function (r) {
                // get starting and ending row, remember end could be before start
                var startRow = Math.min(r.startRow.rowIndex, r.endRow.rowIndex);
                var endRow = Math.max(r.startRow.rowIndex, r.endRow.rowIndex);
                if (r.columns.includes(props.column) && props.node.rowIndex >= startRow && props.node.rowIndex <= endRow) {
                    ret = true
                    return false
                }
                return true
            })
        }
        return ret
    };
    const isInRange = inRange()
    if (props?.eGridCell?.children[0]?.children.length == 2 && !isInRange) {
        setChild(props?.eGridCell?.children[0]?.children[0])
        props?.eGridCell?.children[0]?.removeChild(props?.eGridCell?.children[0]?.children[0])
    } else if (props?.eGridCell?.children[0]?.children.length == 1 && isInRange) {
        props?.eGridCell?.children[0]?.insertAdjacentElement('afterbegin', child)

    }

    return <span unselectable={isInRange ? "on" : "off"}>{props.value}</span>
}

export default function Sheet({ setTotalHeight, data, exportClicked, setExportClicked, i, idx, selectedIndexes, addToTemplate, removeIdxFromData, projectSaveClicked }) {
    const [range, setRange] = useState()
    const [height, setHeight] = useState(500)


    const gridRef = useRef()

    const setDynamicDomLayout = (api) => {
        // get the rendered rows
        const renderedRowCount = api.getDisplayedRowCount();
        const maxHeight = 500;

        const size = api.getSizesForCurrentTheme();

        const calculatedGridHeight = ((renderedRowCount * size.rowHeight)
            + size.headerHeight);

        if (calculatedGridHeight > maxHeight
            && renderedRowCount > 0
            && maxHeight !== 0) {
            api.setDomLayout('normal');
            setHeight(560)
            setTotalHeight(pheight => {
                return pheight + 608
            })
        }
        else {
            api.setDomLayout('autoHeight');
            api.resetRowHeights();
            setHeight(null)
            setTotalHeight(pheight => {
                return pheight + calculatedGridHeight + 108
            })
        }
    }

    const removeHeight = (api) => {
        // get the rendered rows
        const renderedRowCount = api.getDisplayedRowCount();
        const maxHeight = 500;

        const size = api.getSizesForCurrentTheme();

        const calculatedGridHeight = ((renderedRowCount * size.rowHeight)
            + size.headerHeight);

        if (calculatedGridHeight > maxHeight
            && renderedRowCount > 0
            && maxHeight !== 0) {
            setTotalHeight(pheight => {
                return pheight - 608
            })
        }
        else {
            setTotalHeight(pheight => {
                return pheight - calculatedGridHeight - 108
            })
        }
    }

    const onGridReady = useCallback((params) => {
        setDynamicDomLayout(params.api)
    }, []);

    const onGridPreDestroyed = useCallback((params) => {
        removeHeight(params.api)
    }, []);


    function handleClose(ev) {
        let conf = window.confirm('Delete data source?')
        if (conf) {
            removeIdxFromData(i, idx)
        }
    }

    useEffect(() => {
        if (selectedIndexes.includes(i) || projectSaveClicked) {
            addToTemplate({
                data: data
            }, i, 'data')
        }
    }, [selectedIndexes, i, data, projectSaveClicked])

    useEffect(() => {
        const exportt = async () => {
            if (exportClicked == 'xlsx') {
                gridRef.current?.api?.exportDataAsExcel();
                setExportClicked('')
            }
            if (exportClicked == 'csv') {
                gridRef.current?.api?.exportDataAsCsv();
                setExportClicked('')
            }
            if (exportClicked == 'test_xlsx') {
                let blob = gridRef.current?.api?.getDataAsExcel();
                const string = await new Response(blob).arrayBuffer();
                window.ipcRenderer.send('test_export', { data: string, save: 'xlsx' })
                setExportClicked('')

            }
            if (exportClicked == 'test_csv') {
                let blob = gridRef.current?.api?.getDataAsCsv();
                const string = await new Response(blob).arrayBuffer();
                window.ipcRenderer.send('test_export', { data: string, save: 'csv' })
                setExportClicked('')

            }
        }
        exportt()
    }, [exportClicked])

    function rangeSelectionChanged(event) {
        setRange(event.api?.getCellRanges())


    }

    const onRowDrag = (params) => {
        var api = gridRef.current?.api;
        var e = params.dragEvent
        var data = []
        var columns = new Set()
        if (range) {
            range.forEach(function (r) {
                // get starting and ending row, remember end could be before start
                var startRow = Math.min(r.startRow.rowIndex, r.endRow.rowIndex);
                var endRow = Math.max(r.startRow.rowIndex, r.endRow.rowIndex);
                r.columns.forEach(function (column) {
                    columns.add(column.colId)
                    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                        var rowModel = api.getModel();
                        var rowNode = rowModel.getRow(rowIndex);
                        var value = api.getValue(column, rowNode);
                        data.push(value)
                    }
                })
            });
        }
        columns = Array.from(columns)
        var jsonData = JSON.stringify({ data: data, dataset: i });
        e.dataTransfer.setData('application/json', jsonData);
        e.dataTransfer.setData('text/plain', jsonData);
    };

    function getColumns(arr) {
        let res = []
        for (const [key, value] of Object.entries(arr[0])) {
            res.push({
                field: key,
                dndSource: true,
                dndSourceOnRowDrag: onRowDrag,
                cellRenderer: Renderer,
                cellRendererParams: {
                    range: range
                }
            })
        }
        return res
    }
    const columns = getColumns(data)

    return (
        <>
            <div className="ag-theme-alpine" style={{ height: height, width: '100%' }}>
                <Grid container columns={9} columnSpacing={2} alignItems="center" alignContent='center' sx={{height: 60}}>
                    <Grid item xs={8} />
                    <Grid item xs={1}>
                        <IconButton aria-label="delete" onClick={handleClose} sx={{height: 50, width: 50}}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
                <AgGridReact ref={gridRef} onGridReady={onGridReady} onGridPreDestroyed={onGridPreDestroyed} enableCharts={true} rowDragManaged={true} suppressRowClickSelection={true} rowData={data} columnDefs={columns} enableRangeSelection={true} onRangeSelectionChanged={rangeSelectionChanged} keepLastSelected={false}></AgGridReact>
            </div>

        </>
    )

}