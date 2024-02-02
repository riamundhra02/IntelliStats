import { Button, Switch } from '@mui/material';
import { useState, useEffect } from 'react'
import CytoscapeComponent from 'react-cytoscapejs';
import HomeIcon from '@mui/icons-material/Home';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ColorPicker } from 'material-ui-color'
import Grid from "@mui/material/Grid"
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

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
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>circle-multiple-outline</title><path d="M15,4A8,8 0 0,1 23,12A8,8 0 0,1 15,20A8,8 0 0,1 7,12A8,8 0 0,1 15,4M15,18A6,6 0 0,0 21,12A6,6 0 0,0 15,6A6,6 0 0,0 9,12A6,6 0 0,0 15,18M3,12C3,14.61 4.67,16.83 7,17.65V19.74C3.55,18.85 1,15.73 1,12C1,8.27 3.55,5.15 7,4.26V6.35C4.67,7.17 3,9.39 3,12Z" /></svg>')`,
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
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>chart-line-variant</title><path d="M3.5,18.5L9.5,12.5L13.5,16.5L22,6.92L20.59,5.5L13.5,13.5L9.5,9.5L2,17L3.5,18.5Z" /></svg>')`,
        },
    },
    '& .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
        borderRadius: 20 / 2,
    },
}));
const reset = (attribute, type, setStylesheet) => {
    setStylesheet(pstylesheet => {
        let copy = [...pstylesheet]
        let indexes = copy.map((obj, index) => { if (obj.selector.includes(type)) return index }).filter(item => item !== undefined);
        indexes.forEach((index) => {
            let style = { ...copy[index]["style"] }
            let selector = copy[index]["selector"]
            if (attribute == "colour") {
                delete style[`${type == "node" ? "background" : "line"}-color`]
                if (type == "edge") {
                    delete style["target-arrow-color"]
                }
                copy[index] = {
                    selector: selector,
                    style: style
                }
            } else {
                if (type == "node") {
                    delete style["height"]
                }
                delete style["width"]
                copy[index] = {
                    selector: selector,
                    style: style
                }
            }

        })

        return copy
    })
}

const MarkovModal = ({ expand, setExpand, inflate, setInflate, markovOpen, setMarkovOpen }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal
            open={markovOpen}
            onClose={(ev) => setMarkovOpen(false)}
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2"> Set Markov Clustering Parameters</Typography>
                <FormControl>
                    <TextField type='number' label="Inflate parameter" value={inflate} onChange={(ev) => setInflate(ev.target.value)} />
                    <br />
                    <br />
                    <TextField type='number' label="Expand parameter" value={expand} onChange={(ev) => setExpand(ev.target.value)} />
                </FormControl>
            </Box>
        </Modal>
    )
}


const ColourSelector = ({ c, label, attribute, setStylesheet, type }) => {
    const [colour, setColour] = useState(c)

    useEffect(() => {
        if (colour !== c) {
            setColour(c)
            reset("colour", type, setStylesheet)
            c.forEach((newColour, i) => {
                let l = label[i]
                if (attribute == "Constant") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes(type)) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style[`${type == "node" ? "background" : "line"}-color`] = newColour
                                if (type == "edge") {
                                    style["target-arrow-color"] = newColour
                                }
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: type,
                                style: type == "node" ? {
                                    'background-color': newColour
                                } : {
                                        'line-color': newColour,
                                        'target-arrow-color': newColour
                                    }
                            })
                        }
                        return copy
                    })
                } else {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let index = copy.findIndex((obj) => obj.selector == (l ? `${type}[${type == "node" ? attribute : "label"} = "${l}"]` : `${type}[^${attribute}]`))
                        if (index >= 0) {
                            let style = { ...copy[index]["style"] }
                            let selector = copy[index]["selector"]
                            style[`${type == "node" ? "background" : "line"}-color`] = newColour
                            if (type == "edge") {
                                style["target-arrow-color"] = newColour
                            }
                            copy[index] = {
                                selector: selector,
                                style: style
                            }
                        } else {
                            copy.push({
                                selector: l ? `${type}[${type == "node" ? attribute : "label"} = "${l}"]` : `${type}[^${attribute}]`,
                                style: type == "node" ? {
                                    'background-color': newColour
                                } : {
                                        'line-color': newColour,
                                        'target-arrow-color': newColour
                                    }
                            })
                        }
                        return copy
                    })
                }
            })
        }
    }, [c, attribute, label])

    const handleChange = (newColour, i, l) => {
        setColour(pcolour => {
            let copy = [...pcolour]
            copy[i] = newColour
            return copy
        })

        if (attribute == "Constant") {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let indexes = copy.map((obj, index) => { if (obj.selector.includes(type)) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        style[`${type == "node" ? "background" : "line"}-color`] = newColour.css.backgroundColor
                        if (type == "edge") {
                            style["target-arrow-color"] = newColour.css.backgroundColor
                        }
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: type,
                        style: type == "node" ? {
                            'background-color': newColour.css.backgroundColor
                        } : {
                                'line-color': newColour.css.backgroundColor,
                                'target-arrow-color': newColour.css.backgroundColor
                            }
                    })
                }
                return copy
            })
        } else {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let index = copy.findIndex((obj) => obj.selector == (l ? `${type}[${type == "node" ? attribute : "label"} = "${l}"]` : `${type}[^${attribute}]`))
                console.log(copy[index].selector == (l ? `${type}[${type == "node" ? attribute : "label"} = "${l}"]` : `${type}[^${attribute}]`))
                if (index >= 0) {
                    let style = { ...copy[index]["style"] }
                    let selector = copy[index]["selector"]
                    style[`${type == "node" ? "background" : "line"}-color`] = newColour.css.backgroundColor
                    if (type == "edge") {
                        style["target-arrow-color"] = newColour.css.backgroundColor
                    }
                    copy[index] = {
                        selector: selector,
                        style: style
                    }
                } else {
                    copy.push({
                        selector: l ? `${type}[${type == "node" ? attribute : "label"} = "${l}"]` : `${type}[^${attribute}]`,
                        style: type == "node" ? {
                            'background-color': newColour.css.backgroundColor
                        } : {
                                'line-color': newColour.css.backgroundColor,
                                'target-arrow-color': newColour.css.backgroundColor
                            }
                    })
                }
                console.log(copy)
                return copy
            })
        }

    }

    return (
        <>

            {
                label?.map((l, i) => {
                    return (
                        <Grid container columns={4} alignContent="center" alignItems="center" key={l}>
                            <Grid item xs={1}>
                                <ColorPicker value={colour[i]} hideTextfield disableAlpha onChange={(ev) => handleChange(ev, i, l)} />
                            </Grid>
                            <Grid item xs={3}>
                                <p>{l !== undefined ? l : `${type}s with no valid value`}</p>
                            </Grid>
                        </Grid>
                    )
                })
            }
        </>
    )

}

const SizeSelector = ({ setStylesheet, attribute, label, type }) => {
    const [min, setMin] = useState(10)
    const [max, setMax] = useState(50)
    const [constant, setConstant] = useState()
    const [undefinedVal, setUndefinedVal] = useState(30)

    useEffect(() => {
        if (type == "node") {
            setConstant(30)
        } else {
            setConstant(5)
        }
    }, [])

    const getSize = (l, min, max) => {
        let minimumLabel = Math.min(...(label.filter(l => l !== undefined)))
        let maximumLabel = Math.max(...(label.filter(l => l !== undefined)))
        if (minimumLabel == maximumLabel) {
            return ((max - min) / 2) + min
        } else {
            let step = (max - min) / (maximumLabel - minimumLabel)
            return (l - minimumLabel) * step + min
        }

    }

    useEffect(() => {
        reset("size", type, setStylesheet)
        if (attribute == "Constant") {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let indexes = copy.map((obj, index) => { if (obj.selector.includes(type)) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        if (type == "node") {
                            style["height"] = constant
                        }
                        style["width"] = constant
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: type,
                        style: type == "node" ? {
                            'height': constant,
                            'width': constant
                        } : {
                                'width': constant
                            }
                    })
                }
                return copy
            })
        } else {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                    let size = getSize(l, min, max)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = size
                        style["width"] = size
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': size,
                                'width': size
                            }
                        })
                    }
                })

                return copy
            })
        }
    }, [label, attribute, type])

    const handleSizeChange = (ev, eventType) => {
        if (eventType == "constant") {
            setConstant(ev.target.value)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let indexes = copy.map((obj, index) => { if (obj.selector.includes(type)) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        if (type == "node") {
                            style["height"] = ev.target.value
                        }
                        style["width"] = ev.target.value
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: type,
                        style: type == "node" ? {
                            'height': ev.target.value,
                            'width': ev.target.value
                        } : {
                                'width': ev.target.value
                            }
                    })
                }
                return copy
            })
        } else if (eventType == "min") {

            let num = parseInt(ev.target.value)
            num = num > 0 ? num < max ? num : max : 0
            setMin(num)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                    let size = getSize(l, num, max)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = size
                        style["width"] = size
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': size,
                                'width': size
                            }
                        })
                    }
                })
                return copy
            })
        } else if (eventType == "max") {

            let num = parseInt(ev.target.value)
            num = num > min ? num : min
            setMax(num)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                    let size = getSize(l, min, num)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = size
                        style["width"] = size
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': size,
                                'width': size
                            }
                        })
                    }
                })

                return copy
            })
        } else if (eventType == "undefined") {
            let num = parseInt(ev.target.value)
            setUndefinedVal(num)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[^${attribute}]`)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = num
                        style["width"] = num
                        copy[index] = {
                            selector: `node[^${attribute}]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[^${attribute}]`,
                            style: {
                                'height': num,
                                'width': num
                            }
                        })
                    }
                })

                return copy
            })
        }
    }

    return (
        <FormControl sx={{ p: 1 }}>
            {attribute == "Constant" ?
                <TextField label={label} type="number" value={constant} onChange={(ev) => handleSizeChange(ev, "constant")} /> :
                <>
                    <TextField label="Min" type="number" value={min} onChange={(ev) => handleSizeChange(ev, "min")} />
                    <br />
                    <TextField label="Max" type="number" value={max} onChange={(ev) => handleSizeChange(ev, "max")} />
                    <br />
                    <TextField label="Size for nodes with no defined value" type="number" value={undefinedVal} onChange={(ev) => handleSizeChange(ev, "undefined")} />
                </>}


        </FormControl>
    )
}

export default function NetworkGraph({ elements, directed, stylesheet, setStylesheet, setSource, setTarget }) {

    const [cy, setCy] = useState(undefined)
    const [open, setOpen] = useState(false);
    const [nodeColourAttribute, setNodeColourAttribute] = useState("")
    const [nodeSizeAttribute, setNodeSizeAttribute] = useState("")
    const [nodeLabelAttribute, setNodeLabelAttribute] = useState("")
    const [nodeLabelSizeAttribute, setNodeLabelSizeAttribute] = useState("")
    const [edgeColourAttribute, setEdgeColourAttribute] = useState("")
    const [edgeSizeAttribute, setEdgeSizeAttribute] = useState("")
    const [edgeLabelAttribute, setEdgeLabelAttribute] = useState("")
    const [edgeLabelSizeAttribute, setEdgeLabelSizeAttribute] = useState("")
    const [nodeColourLabels, setNodeColourLabels] = useState([])
    const [edgeColourLabels, setEdgeColourLabels] = useState([])
    const [nodeSizeLabels, setNodeSizeLabels] = useState([])
    const [edgeSizeLabels, setEdgeSizeLabels] = useState([])
    const [labelValue, setLabelValue] = useState("")
    const [edgeLabelValue, setEdgeLabelValue] = useState("")
    const [nodeLabelSize, setNodeLabelSize] = useState()
    const [edgeLabelSize, setEdgeLabelSize] = useState()
    const [inflate, setInflate] = useState(2)
    const [expand, setExpand] = useState(2)
    const [markovOpen, setMarkovOpen] = useState(false)
    const [switchChecked, setSwitchChecked] = useState(true)
    const [length, setLength] = useState(elements.length)
    const [layoutAlgo, setlayoutAlgo] = useState("cose")

    useEffect(() => {
        setStylesheet(pstylesheet => {
            let copy = [...pstylesheet].filter(obj => obj.selector !== 'edge')
            copy.push({
                selector: "edge",
                style: {
                    "target-arrow-shape": directed ? "triangle" : "none",
                    "curve-style": "bezier",
                    "arrow-scale": 1.5,
                    'background-color': "gray"
                }
            })
            return copy
        })
    }, [directed])

    function generateColours(quantity) {
        let colours = [];
        for (let i = 0; i < quantity; i++) {
            colours.push(`hsl(${(360 / quantity) * (quantity - i)}, 80%, 50%)`);
        }

        return colours;
    }

    const [nodeC, setNodeC] = useState()
    const [edgeC, setEdgeC] = useState()

    useEffect(() => {
        cy?.resize()
    }, [])

    useEffect(() => {
        setNodeColourLabels(nodeColourAttribute == "Constant" ? ["Colour for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
            return (ele.json().data[nodeColourAttribute])
        }))))
    }, [nodeColourAttribute, cy, elements])

    useEffect(() => {
        setEdgeColourLabels(edgeColourAttribute == "Constant" ? ["Colour for all edges"] : edgeColourAttribute == "id" ? Array.from(new Set(cy?.$("edge").map((ele, i) => {
            return (ele.json().data["label"])
        }))) : [])
    }, [edgeColourAttribute, cy, elements])

    useEffect(() => {
        setNodeSizeLabels(nodeSizeAttribute == "Constant" ? ["Size for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
            return (ele.json().data[nodeSizeAttribute])
        }))))
    }, [nodeSizeAttribute, cy])

    useEffect(() => {
        setEdgeSizeLabels(edgeSizeAttribute == "Constant" ? ["Size for all edges"] : [])
    }, [edgeSizeAttribute, cy])

    useEffect(() => {
        setNodeC(generateColours(nodeColourLabels.length))
    }, [nodeColourLabels])

    useEffect(() => {
        setEdgeC(generateColours(edgeColourLabels.length))
    }, [edgeColourLabels])

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleLayoutChange = (ev) => {
        setlayoutAlgo(ev.target.value)
    }

    const handleAttributeChange = (text, ev, label, isNode) => {
        if (isNode) {
            if (text == "Set Colour From") {
                setNodeColourAttribute(ev.target.value)
            } else if (text == "Set Size From") {
                setNodeSizeAttribute(ev.target.value)
            } else if (text == "Set Label From") {
                setNodeLabelAttribute(ev.target.value)
                setStylesheet(pstylesheet => {
                    let copy = [...pstylesheet]
                    let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                    if (indexes.length >= 0) {
                        indexes.forEach((index) => {
                            let style = { ...copy[index]["style"] }
                            let selector = copy[index]["selector"]
                            style["label"] = `${ev.target.value == "Constant" ? label : ev.target.value == "none" ? "" : `data(${ev.target.value})`}`
                            copy[index] = {
                                selector: selector,
                                style: style
                            }
                        })
                    } else {
                        copy.push({
                            selector: 'node',
                            style: {
                                'label': `${ev.target.value == "Constant" ? label : ev.target.value == "none" ? "" : `data(${ev.target.value})`}`
                            }
                        })
                    }
                    return copy
                })

            } else {
                setNodeLabelSizeAttribute(ev.target.value)
                setStylesheet(pstylesheet => {
                    let copy = [...pstylesheet]
                    let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                    if (indexes.length >= 0) {
                        indexes.forEach((index) => {
                            let style = { ...copy[index]["style"] }
                            let selector = copy[index]["selector"]
                            style["font-size"] = ev.target.value == "Constant" ? label : function (ele) { return (ele.numericStyle('height') * 0.4) }
                            copy[index] = {
                                selector: selector,
                                style: style
                            }
                        })
                    } else {
                        copy.push({
                            selector: 'node',
                            style: {
                                'font-size': ev.target.value == "Constant" ? label : function (ele) { return (ele.numericStyle('height') * 0.4) }
                            }
                        })
                    }
                    return copy
                })


            }
        } else {
            if (text == "Set Colour From") {
                setEdgeColourAttribute(ev.target.value)
                if (ev.target.value == "source") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes("edge")) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style["line-color"] = function (ele) { return (ele.source()[0].style("background-color")) }
                                style["target-arrow-color"] = function (ele) { return (ele.source()[0].style("background-color")) }
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: 'edge',
                                style: {
                                    'line-color': function (ele) { return (ele.source()[0].style("background-color")) },
                                    'target-arrow-color': function (ele) { return (ele.source()[0].style("background-color")) }
                                }
                            })
                        }
                        return copy
                    })
                } else if (ev.target.value == "target") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes("edge")) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style["line-color"] = function (ele) { return (ele.target()[0].style("background-color")) }
                                style["target-arrow-color"] = function (ele) { return (ele.target()[0].style("background-color")) }
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: 'edge',
                                style: {
                                    'line-color': function (ele) { return (ele.target()[0].style("background-color")) },
                                    'target-arrow-color': function (ele) { return (ele.target()[0].style("background-color")) }
                                }
                            })
                        }
                        return copy
                    })
                }
            } else if (text == "Set Size From") {
                setEdgeSizeAttribute(ev.target.value)
                if (ev.target.value == "source") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes("edge")) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style["width"] = function (ele) { return (ele.source()[0].numericStyle("width") * 0.1) }
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: 'edge',
                                style: {
                                    'width': function (ele) { return (ele.source()[0].numericStyle("width") * 0.1) },
                                }
                            })
                        }
                        return copy
                    })
                } else if (ev.target.value == "target") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes("edge")) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style["width"] = function (ele) { return (ele.target()[0].numericStyle("width") * 0.1) }
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: 'edge',
                                style: {
                                    'width': function (ele) { return (ele.target()[0].numericStyle("width") * 0.1) },
                                }
                            })
                        }
                        return copy
                    })
                }
            } else if (text == "Set Label From") {
                setEdgeLabelAttribute(ev.target.value)
                setStylesheet(pstylesheet => {
                    let copy = [...pstylesheet]
                    let indexes = copy.map((obj, index) => { if (obj.selector.includes('edge')) return index }).filter(item => item !== undefined);
                    if (indexes.length >= 0) {
                        indexes.forEach((index) => {
                            let style = { ...copy[index]["style"] }
                            let selector = copy[index]["selector"]
                            style["label"] = `${ev.target.value == "Constant" ? label : ev.target.value == "none" ? "" : `data(label)`}`
                            copy[index] = {
                                selector: selector,
                                style: style
                            }
                        })
                    } else {
                        copy.push({
                            selector: 'edge',
                            style: {
                                'label': `${ev.target.value == "Constant" ? label : ev.target.value == "none" ? "" : `data(label)`}`
                            }
                        })
                    }
                    return copy
                })

            } else {
                setEdgeLabelSizeAttribute(ev.target.value)
                setStylesheet(pstylesheet => {
                    let copy = [...pstylesheet]
                    let indexes = copy.map((obj, index) => { if (obj.selector.includes('edge')) return index }).filter(item => item !== undefined);
                    if (indexes.length >= 0) {
                        indexes.forEach((index) => {
                            let style = { ...copy[index]["style"] }
                            let selector = copy[index]["selector"]
                            style["font-size"] = ev.target.value == "Constant" ? label : function (ele) { return (ele.numericStyle('width') * 3) }
                            copy[index] = {
                                selector: selector,
                                style: style
                            }
                        })
                    } else {
                        copy.push({
                            selector: 'edge',
                            style: {
                                'font-size': ev.target.value == "Constant" ? label : function (ele) { return (ele.numericStyle('width') * 3) }
                            }
                        })
                    }
                    return copy
                })


            }
        }
    }



    const getInDegrees = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.degreeCentrality({ root: ele, directed: true }).indegree
                ele.data("In_Degree", `${degree}`)
            });
        }
        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["In_Degree"]
                return ({ ...node, 'In_Degree': degree })
            })

            return copy
        })


        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["In_Degree"]
                return ({ ...node, 'In_Degree': degree })

            })

            return copy
        })
    }

    const getOutDegrees = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.degreeCentrality({ root: ele, directed: true }).outdegree
                ele.data("Out_Degree", `${degree}`)
            });
        }

        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Out_Degree"]
                return ({ ...node, 'Out_Degree': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Out_Degree"]
                return ({ ...node, 'Out_Degree': degree })

            })

            return copy
        })
    }

    const getDegrees = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.degreeCentrality({ root: ele }).degree
                ele.data(directed ? "Total_Degree" : "Degree", `${degree}`)

            });
        }

        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Total_Degree"]
                return ({ ...node, 'Total_Degree': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Total_Degree"]
                return ({ ...node, 'Total_Degree': degree })

            })

            return copy
        })
    }

    const getPageRank = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            let rankFunction = eles.pageRank().rank
            nodes.forEach(ele => {
                let rank = rankFunction(ele)
                ele.data("Page_Rank", `${rank}`)


            })
        }
        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Page_Rank"]
                return ({ ...node, 'Page_Rank': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Page_Rank"]
                return ({ ...node, 'Page_Rank': degree })

            })

            return copy
        })
    }


    const getMarkovCluster = (ev) => {
        let eles = cy?.$()
        if (eles) {
            setMarkovOpen(true)
            let clusters = eles.markovClustering({
                attributes: [
                    function (edge) { return 1 }
                ],
                expandFactor: expand,
                inflateFactor: inflate
            })
            clusters.forEach((cluster, i) => {
                cluster.forEach((ele) => {
                    ele.data("Cluster", `${i}`)
                })
            })
        }

        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Cluster"]
                return ({ ...node, 'Cluster': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Cluster"]
                return ({ ...node, 'Cluster': degree })

            })

            return copy
        })
    }


    const getBetweennessCentrality = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            let betweenness = eles.betweennessCentrality({ directed: directed }).betweenness
            nodes.forEach(ele => {
                ele.data("Betweenness_Centrality", `${betweenness(ele)}`)

            });
        }
        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Betweenness_Centrality"]
                return ({ ...node, 'Betweenness_Centrality': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Betweenness_Centrality"]
                return ({ ...node, 'Betweenness_Centrality': degree })

            })

            return copy
        })
    }


    const getClosenessCentrality = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.closenessCentrality({ root: ele })
                ele.data("Closeness_Centrality", `${degree}`)

            });
        }
        setSource(psource => {
            let copy = { ...psource }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Closeness_Centrality"]
                return ({ ...node, 'Closeness_Centrality': degree })

            })

            return copy
        })

        setTarget(ptarget => {
            let copy = { ...ptarget }
            copy.data = copy.data.map((node, i) => {
                let degree = cy?.getElementById(`${node.id}`).data()["Closeness_Centrality"]
                return ({ ...node, 'Closeness_Centrality': degree })

            })

            return copy
        })
    }

    useEffect(() => {
        if (elements.length != length) {
            cy?.layout({ name: layoutAlgo }).run()
            cy?.center()
            cy?.fit()
            setLength(elements.length)
        }
    }, [cy, elements, layoutAlgo])

    const mapButtonsToFuncs = {
        'In Degree': getInDegrees,
        'Out Degree': getOutDegrees,
        'Total Degree': getDegrees,
        'Degree': getDegrees,
        'Page Rank': getPageRank,
        "Markov Clustering": getMarkovCluster,
        "Betweenness Centrality": getBetweennessCentrality,
        "Closeness Centrality": getClosenessCentrality
    }

    const isNumerical = {
        'In_Degree': true,
        'Out_Degree': true,
        'Total_Degree': true,
        'Degree': true,
        'Page_Rank': true,
        "Markov_Clustering": true,
        "Betweenness_Centrality": true,
        "Closeness_Centrality": true,
        "id": false
    }

    return <div style={{ textAlign: 'left', alignItems: 'flex-start', display: 'flex', outlineColor: 'lightgray', outlineWidth: '2px', outlineStyle: 'solid' }}>
        <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ ml: 0.6, mt: 0.2, width: '5%' }}
        >
            <MenuIcon />
        </IconButton>
        <Drawer
            sx={{
                display: open ? "" : "none",
                position: 'absolute',
                zIndex: 100
            }}
            variant="persistent"
            anchor="left"
            open={open}
            PaperProps={{ style: { position: 'relative', height: '400px' } }}
            BackdropProps={{ style: { position: 'relative', height: '400px' } }}
            SlideProps={{
                onExiting: (node) => {
                    node.style.transform = 'scaleX(0)'
                    node.style.transformOrigin = 'top left'

                },
                onEntering: (node) => {
                    node.style.transform = 'scaleX(1)'
                    node.style.transformOrigin = 'top left'

                },
            }}
        >
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Typography variant='h6' align='center'>Calculate</Typography>
            <List>
                {(directed ? ['In Degree', 'Out Degree', 'Total Degree', 'Page Rank', "Betweenness Centrality", "Closeness Centrality", "Markov Clustering"] : ['Degree', 'Page Rank', "Betweenness Centrality", "Closeness Centrality", "Markov Clustering"]).map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={mapButtonsToFuncs[text]}>
                            <ListItemText primary={text} align="center" />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <MarkovModal inflate={inflate} setInflate={setInflate} expand={expand} setExpand={setExpand} markovOpen={markovOpen} setMarkovOpen={setMarkovOpen} />
            <Divider />
            <Typography variant='h6' align='center'>Layout</Typography>
            <br />
            <List>
                <ListItem disablePadding sx={{ display: 'flex', flexDirection: 'column', pl: 1, pr: 1 }}>
                    <FormControl sx={{ width: '100%'}}>
                        <InputLabel id="demo-simple-select-label">Select Algorithm</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={layoutAlgo}
                            label="layout algorithm"
                            onChange={(ev) => { handleLayoutChange(ev) }}
                        >
                            {["cose", "random", "grid", "circle", "concentric", "breadthfirst"].map((layout, i) => <MenuItem value={layout}>{layout}</MenuItem>)}
                        </Select>
                    </FormControl>
                </ListItem>
            </List>

            <Divider />
            <Typography variant='h6' align='center'>Style</Typography>
            <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1">Edges</Typography>
                <MaterialUISwitch checked={switchChecked} onChange={(ev) => setSwitchChecked(ev.target.checked)} />
                <Typography variant="body1">Nodes</Typography>
            </FormControl>
            {switchChecked ?
                <List>
                    {["Set Colour From", "Set Size From", 'Set Label From'].map((text, index) => (
                        <>
                            <ListItem key={text} disablePadding sx={{ display: 'flex', flexDirection: 'column', pl: 1, pr: 1 }}>
                                <Typography variant='overline' sx={{ width: '100%' }}>{text}</Typography>
                                <FormControl sx={{ width: '100%' }}>
                                    <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={text == "Set Colour From" ? nodeColourAttribute : text == "Set Size From" ? nodeSizeAttribute : nodeLabelAttribute}
                                        label={text + " Attribute"}
                                        onChange={(ev) => { handleAttributeChange(text, ev, labelValue, true) }}
                                    >
                                        <MenuItem value="Constant">{text == "Set Colour From" ? "Constant Colour" : text == "Set Size From" ? "Constant Size" : "A Constant Label"}</MenuItem>
                                        {Object.keys(cy?.nodes()[0]?.json().data ? cy?.nodes()[0]?.json().data : {}).map((key, i) => {
                                            if (cy?.nodes()[0]?.json().data[key] != null) {
                                                if (text == "Set Colour From" || text == "Set Label From") {
                                                    return <MenuItem value={key}>{key == 'id' ? "Input Label" : key.split("_").join(" ")}</MenuItem>
                                                } else {
                                                    if (isNumerical[key]) {
                                                        return <MenuItem value={key}>{key == 'id' ? "Input Label" : key.split("_").join(" ")}</MenuItem>
                                                    }
                                                }

                                            }

                                        })}
                                        {text == "Set Label From" ? <MenuItem value="none">No label</MenuItem> : []}
                                    </Select>
                                </FormControl>
                            </ListItem>

                            {text == "Set Colour From" ?
                                nodeColourAttribute != "" ? <ColourSelector key="node" setStylesheet={setStylesheet} attribute={nodeColourAttribute} key={nodeColourLabels} label={nodeColourLabels} c={nodeC} type="node" /> : <></>
                                : text == "Set Size From" ?
                                    nodeSizeAttribute != "" ? <SizeSelector key="node" setStylesheet={setStylesheet} attribute={nodeSizeAttribute} label={nodeSizeLabels} type="node" /> : <></>
                                    : nodeLabelAttribute == "Constant" ? <FormControl sx={{ p: 1 }}><TextField label='Label for all nodes' value={labelValue} onChange={(ev) => { setLabelValue(ev.target.value); handleAttributeChange("Set Label From", { target: { value: "Constant" } }, ev.target.value, true) }} /></FormControl> : <></>}
                            <br />
                        </>
                    ))}
                    <ListItem key="Set Label Size From" disablePadding sx={{ display: 'flex', flexDirection: 'column', pl: 1, pr: 1 }}>
                        <Typography variant='overline' sx={{ width: '100%' }}>Set Label Size From</Typography>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={nodeLabelSizeAttribute}
                                label={"Set Label Size From Attribute"}
                                onChange={(ev) => { handleAttributeChange("Set Label Size From", ev, nodeLabelSize, true) }}
                            >
                                <MenuItem value="Constant">A Constant Size</MenuItem>
                                <MenuItem value="Node_Size">Node Size</MenuItem>

                            </Select>
                        </FormControl>
                    </ListItem>
                    {nodeLabelSizeAttribute == "Constant" ? <FormControl sx={{ p: 1 }}><TextField label='Size for all labels' value={nodeLabelSize} onChange={(ev) => { setNodeLabelSize(ev.target.value); handleAttributeChange("Set Label Size From", { target: { value: "Constant" } }, ev.target.value, true) }} type="number" /></FormControl> : <></>}
                </List>
                : <List>
                    {["Set Colour From", "Set Size From", 'Set Label From'].map((text, index) => (
                        <>
                            <ListItem key={text} disablePadding sx={{ display: 'flex', flexDirection: 'column', pl: 1, pr: 1 }}>
                                <Typography variant='overline' sx={{ width: '100%' }}>{text}</Typography>
                                <FormControl sx={{ width: '100%' }}>
                                    <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={text == "Set Colour From" ? edgeColourAttribute : text == "Set Size From" ? edgeSizeAttribute : edgeLabelAttribute}
                                        label={text + " Attribute"}
                                        onChange={(ev) => { handleAttributeChange(text, ev, edgeLabelValue, false) }}
                                    >
                                        <MenuItem value="Constant">{text == "Set Colour From" ? "Constant Colour" : text == "Set Size From" ? "Constant Size" : "A Constant Label"}</MenuItem>
                                        {text == "Set Colour From" || text == "Set Label From" ? <MenuItem value="id">Input Label</MenuItem> : []}
                                        {text == "Set Colour From" || text == "Set Size From" ? <MenuItem value="source">Source Node</MenuItem> : []}
                                        {text == "Set Colour From" || text == "Set Size From" ? <MenuItem value="target">Target Node</MenuItem> : []}
                                        {text == "Set Label From" ? <MenuItem value="none">No label</MenuItem> : []}
                                    </Select>
                                </FormControl>
                            </ListItem>
                            {text == "Set Colour From" ?
                                edgeColourAttribute == "id" || edgeColourAttribute == "Constant" ? <ColourSelector key="edge" setStylesheet={setStylesheet} attribute={edgeColourAttribute} key={edgeColourLabels} label={edgeColourLabels} c={edgeC} type="edge" /> : <></>
                                : text == "Set Size From" ? edgeSizeAttribute == "Constant" ? <SizeSelector key="edge" setStylesheet={setStylesheet} attribute={edgeSizeAttribute} label={edgeSizeLabels} type="edge" /> : <></>
                                    : text == "Set Label From" ? edgeLabelAttribute == "Constant" ? <FormControl sx={{ p: 1 }}><TextField label='Label for all nodes' value={edgeLabelValue} onChange={(ev) => { setEdgeLabelValue(ev.target.value); handleAttributeChange("Set Label From", { target: { value: "Constant" } }, ev.target.value, false) }} /></FormControl> : <></> : <></>}
                            <br />
                        </>
                    ))}
                    <ListItem key="Set Label Size From" disablePadding sx={{ display: 'flex', flexDirection: 'column', pl: 1, pr: 1 }}>
                        <Typography variant='overline' sx={{ width: '100%' }}>Set Label Size From</Typography>
                        <FormControl sx={{ width: '100%' }}>
                            <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={edgeLabelSizeAttribute}
                                label={"Set Label Size From Attribute"}
                                onChange={(ev) => { handleAttributeChange("Set Label Size From", ev, edgeLabelSize, false) }}
                            >
                                <MenuItem value="Constant">A Constant Size</MenuItem>
                                <MenuItem value="Edge_Size">Edge Size</MenuItem>

                            </Select>
                        </FormControl>
                    </ListItem>
                    {edgeLabelSizeAttribute == "Constant" ? <FormControl sx={{ p: 1 }}><TextField label='Size for all labels' value={edgeLabelSize} onChange={(ev) => { setEdgeLabelSize(ev.target.value); handleAttributeChange("Set Label Size From", { target: { value: "Constant" } }, ev.target.value, false) }} type="number" /></FormControl> : <></>}
                </List>
            }
        </Drawer>

        <CytoscapeComponent cy={setCy} layout={{ name: layoutAlgo }} elements={[...elements]} style={{ width: '90%', height: '400px' }}
            stylesheet={stylesheet} />
        <div style={{ display: 'flex', flexDirection: 'column', width: '5%', alignItems: 'center' }}>
            <Button onClick={(ev) => { cy?.center(); cy?.fit() }}><HomeIcon /></Button>
            <Button onClick={(ev) => {
                ev.stopPropagation()
                cy?.zoom({
                    level: cy?.zoom() * 1.05, // the zoom level
                    postion: { x: cy?.container().offsetWidth / 2, y: 200 }
                });
            }}><ZoomInIcon /></Button>
            <Button onClick={(ev) => {
                ev.stopPropagation()
                cy?.zoom({
                    level: cy?.zoom() * 1 / 1.05, // the zoom level
                    postion: { x: cy?.container().offsetWidth / 2, y: 200 }
                });
            }
            }><ZoomOutIcon /></Button>
        </div>
    </div >;

}