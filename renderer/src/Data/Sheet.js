import React, { useEffect, useState, useRef, useCallback } from 'react';
import { makeStyles } from "@mui/styles";
import { AgGridReact, grid } from 'ag-grid-react'
import { RangeSelectionModule } from "ag-grid-enterprise";
import { ModuleRegistry } from "ag-grid-community/";
import { ClientSideRowModelModule } from "ag-grid-community";
import { GridChartsModule } from "ag-grid-enterprise/chartsModule";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule]);

export const defaultHeight = 500;
const minHeight = 250;
const maxHeight = 1000;

const useStyles = makeStyles(theme => ({
    dragger: {
        height: "5px",
        cursor: "ns-resize",
        borderTop: "1px solid #ddd",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        backgroundColor: "#f4f7f9"
    }
}));

export default function Sheet({ data, exportClicked, setExportClicked }) {
    const [range, setRange] = useState()
    const classes = useStyles();
    const [height, setHeight] = React.useState(defaultHeight);

    const gridRef = useRef()
    const draggerRef= useRef()

    useEffect(() => {
        if (exportClicked == 'xlsx') {
            gridRef.current.api.exportDataAsExcel();
            setExportClicked('')
        }
        if (exportClicked == 'csv') {
            gridRef.current.api.exportDataAsCsv();
            setExportClicked('')
        }
    }, [exportClicked])

    function rangeSelectionChanged(event) {
        if (event.finished) {
            setRange(event.api.getCellRanges())
        }

    }

    const onRowDrag = (params) => {
        var api = gridRef.current.api;
        var e = params.dragEvent
        var data = []
        var columns = new Set()
        if (range) {
            range.forEach(function (r) {
                // get starting and ending row, remember rowEnd could be before rowStart
                var startRow = Math.min(r.startRow.rowIndex, r.endRow.rowIndex);
                var endRow = Math.max(r.startRow.rowIndex, r.endRow.rowIndex);
                r.columns.forEach(function (column) {
                    columns.add(column.colId)
                    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                        var rowModel = api.getModel();
                        var rowNode = rowModel.getRow(rowIndex);
                        var value = api.getValue(column, rowNode);
                        if (typeof value === 'number') {
                            data.push(value)
                        }
                    }
                })
            });
        }
        columns = Array.from(columns)
        var jsonData = JSON.stringify({ data: data, cols: columns });
        e.dataTransfer.setData('application/json', jsonData);
        e.dataTransfer.setData('text/plain', jsonData);
    };

    function getColumns(arr) {
        let res = []
        for (const [key, value] of Object.entries(arr[0])) {
            res.push({
                field: key,
                dndSource: true,
                dndSourceOnRowDrag: onRowDrag
            })
        }
        return res
    }

    const handleMouseDown = e => {
        document.addEventListener("mouseup", handleMouseUp, true);
        document.addEventListener("mousemove", handleMouseMove, true);
        console.log("mousedown")
    };

    const handleMouseUp = () => {
        document.removeEventListener("mouseup", handleMouseUp, true);
        document.removeEventListener("mousemove", handleMouseMove, true);
    };

    const handleMouseMove = useCallback(e => {
        let newHeight = e.clientY - draggerRef.current.offsetTop
        if (newHeight > minHeight && newHeight < maxHeight) {
            setHeight(newHeight);
        }
    }, []);

    const columns = getColumns(data)

    return (
        <>
            <div className="ag-theme-alpine" style={{ height: height, marginBottom: '2rem', marginTop: '2rem' }} ref={draggerRef}>
                <AgGridReact ref={gridRef} enableCharts={true} rowDragManaged={true} suppressRowClickSelection={true} rowData={data} columnDefs={columns} enableRangeSelection={true} onRangeSelectionChanged={rangeSelectionChanged} keepLastSelected={false}></AgGridReact>
                <div onMouseDown={e => handleMouseDown(e)} className={classes.dragger}></div>
            </div>
            
        </>
    )

}