import { transform } from "echarts-stat";
import { ScatterChart, LineChart } from "echarts/charts";
import {
    TransformComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LegendComponent,
    ToolboxComponent,
} from "echarts/components";
import { CanvasRenderer } from 'echarts/renderers'
import { init, getInstanceByDom, use, registerTransform } from "echarts/core";
import { useRef, useEffect, useState } from "react";
// import { Expression, GraphingCalculator} from "desmos-react";
import * as Desmos from 'desmos'

// Register the required components
use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    LegendComponent,
    ToolboxComponent,
    CanvasRenderer,
    ScatterChart,
    LineChart, // In order to plot regression lines
    TransformComponent, // Built-in transform (filter, sort)
]);

registerTransform(transform.regression); // No missing module error due to module augmentation as done above


export function ScatterPlotChart({ expr, points }) {
    const xdata = points.map((xi, i) => { return xi.map((pair, i) => { return pair[0] }) })
    const ydata = points[0].map((pair, i) => { return pair[1] })
    const calcRef = useRef()
    const [calculator, setCalculator] = useState(null)
    // const pointsExpr = points[0].map((point, i) => `(${point.join(",")})`).join(',')

    useEffect(() => {
        if (calculator) {
            for (let i = 1; i < xdata.length; i++) {
                calculator.setExpression({ latex: `x_${i + 1} = ${Math.min(...xdata[i])}`, sliderBounds: { min: `${Math.min(...xdata[i])}`, max: `${Math.max(...xdata[i])}` } })
            }
            calculator.setExpression({
                type: 'table',
                id: 'points1',
                columns: [
                    {
                        latex: "x_1",
                        values: xdata[0]
                    },
                    {
                        latex: "y",
                        values: ydata
                    },
                    {
                        latex: expr.slice(4),
                        columnMode: Desmos.ColumnModes.LINES
                    }
                ]
            });

            calculator.setMathBounds({
                left: Math.min(...xdata[0]),
                right: Math.max(...xdata[0]),
                bottom: Math.min(...ydata),
                top: Math.max(...ydata)
            });

        } else {
            let calc = Desmos.GraphingCalculator(calcRef.current, { keypad: false })
            for (let i = 1; i < xdata.length; i++) {
                calc.setExpression({ latex: `x_${i + 1} = ${Math.min(...xdata[i])}`, sliderBounds: { min: `${Math.min(...xdata[i])}`, max: `${Math.max(...xdata[i])}` } })
            }
            calc.setExpression({
                type: 'table',
                id: 'points1',
                columns: [
                    {
                        latex: "x_1",
                        values: xdata[0]
                    },
                    {
                        latex: "y",
                        values: ydata
                    },
                    {
                        latex: expr.slice(4),
                        columnMode: Desmos.ColumnModes.LINES
                    }
                ]
            });
            calc.setMathBounds({
                left: Math.min(...xdata),
                right: Math.max(...xdata),
                bottom: Math.min(...ydata),
                top: Math.max(...ydata)
            });
            setCalculator(calc)
        }
        return () => {
            calculator?.setBlank()
        }
    }, [expr, points])

    // const chartRef = useRef(null);

    // useEffect(() => {
    //     // Initialize chart
    //     let chart
    //     if (chartRef.current !== null) {
    //         chart = init(chartRef.current, theme);
    //     }

    //     // Add chart resize listener
    //     // ResizeObserver is leading to a bit janky UX
    //     function resizeChart() {
    //         chart?.resize();
    //     }
    //     window.addEventListener("resize", resizeChart);

    //     // Return cleanup function
    //     return () => {
    //         chart?.dispose();
    //         window.removeEventListener("resize", resizeChart);
    //     };
    // }, [theme]);

    // useEffect(() => {
    //     // Update chart
    //     if (chartRef.current !== null) {
    //         const chart = getInstanceByDom(chartRef.current);
    //         chart?.setOption(option, settings);
    //     }
    // }, [option, settings, theme]);

    // useEffect(() => {
    //     // Update chart
    //     if (chartRef.current !== null) {
    //         const chart = getInstanceByDom(chartRef.current);
    //         // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //         loading === true ? chart?.showLoading() : chart?.hideLoading();
    //     }
    // }, [loading, theme]);


    return (
        <>
            <br />
            <br />
            
            <div ref={calcRef} style={{ width: '100%', height: '400px' }}></div>
        </>
    );
}