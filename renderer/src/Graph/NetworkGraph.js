import { Button } from '@mui/material';
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


const ColourSelector = ({ c, label, attribute, setStylesheet }) => {
    const [colour, setColour] = useState(c)

    useEffect(() => {
        if (colour !== c) {
            setColour(c)
            c.forEach((newColour, i) => {
                let l = label[i]
                if (attribute == "Constant") {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                        if (indexes.length >= 0) {
                            indexes.forEach((index) => {
                                let style = { ...copy[index]["style"] }
                                let selector = copy[index]["selector"]
                                style["background-color"] = newColour
                                copy[index] = {
                                    selector: selector,
                                    style: style
                                }
                            })
                        } else {
                            copy.push({
                                selector: 'node',
                                style: {
                                    'background-color': newColour
                                }
                            })
                        }
                        console.log(copy)
                        return copy
                    })
                } else {
                    setStylesheet(pstylesheet => {
                        let copy = [...pstylesheet]
                        let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                        if (index >= 0) {
                            let style = { ...copy[index]["style"] }
                            style["background-color"] = newColour
                            copy[index] = {
                                selector: `node[${attribute} = "${l}"]`,
                                style: style
                            }
                        } else {
                            copy.push({
                                selector: `node[${attribute} = "${l}"]`,
                                style: {
                                    'background-color': newColour
                                }
                            })
                        }
                        console.log(copy)
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
                let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        style["background-color"] = newColour.css.backgroundColor
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: 'node',
                        style: {
                            'background-color': newColour.css.backgroundColor
                        }
                    })
                }
                console.log(copy)
                return copy
            })
        } else {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                if (index >= 0) {
                    let style = { ...copy[index]["style"] }
                    style["background-color"] = newColour.css.backgroundColor
                    copy[index] = {
                        selector: `node[${attribute} = "${l}"]`,
                        style: style
                    }
                } else {
                    copy.push({
                        selector: `node[${attribute} = "${l}"]`,
                        style: {
                            'background-color': newColour.css.backgroundColor
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
                                <p>{l !== null ? l : "Nodes with no valid value"}</p>
                            </Grid>
                        </Grid>
                    )
                })
            }
        </>
    )

}

const SizeSelector = ({ setStylesheet, attribute, label }) => {
    console.log(label)
    const [min, setMin] = useState(10)
    const [max, setMax] = useState(50)
    const [constant, setConstant] = useState(20)

    const getSize = (l, min, max) => {
        let minimumLabel = Math.min(...label)
        let maximumLabel = Math.max(...label)
        if (minimumLabel == maximumLabel) {
            return (max-min)/2
        } else {
            let step = (max - min) / (maximumLabel - minimumLabel)
            return (l - minimumLabel) * step + min
        }

    }

    useEffect(() => {
        if (attribute == "Constant") {
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        style["height"] = `${constant}px`
                        style["width"] = `${constant}px`
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: 'node',
                        style: {
                            'height': `${constant}px`,
                            'width': `${constant}px`
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
                    console.log(index, size)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = `${size}px`
                        style["width"] = `${size}px`
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': `${size}px`,
                                'width': `${size}px`
                            }
                        })
                    }
                })

                return copy
            })
        }
    }, [label, attribute])

    const handleSizeChange = (ev, type) => {
        if (type == "constant") {
            setConstant(ev.target.value)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                let indexes = copy.map((obj, index) => { if (obj.selector.includes('node')) return index }).filter(item => item !== undefined);
                if (indexes.length >= 0) {
                    indexes.forEach((index) => {
                        let style = { ...copy[index]["style"] }
                        let selector = copy[index]["selector"]
                        style["height"] = `${ev.target.value}px`
                        style["width"] = `${ev.target.value}px`
                        copy[index] = {
                            selector: selector,
                            style: style
                        }
                    })
                } else {
                    copy.push({
                        selector: 'node',
                        style: {
                            'height': `${ev.target.value}px`,
                            'width': `${ev.target.value}px`
                        }
                    })
                }
                return copy
            })
        } else if (type == "min") {
            setMin(ev.target.value)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                    let size = getSize(l, ev.target.value, max)
                    console.log(index, size)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = `${size}px`
                        style["width"] = `${size}px`
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': `${size}px`,
                                'width': `${size}px`
                            }
                        })
                    }
                })

                return copy
            })
        } else if (type == "max") {
            setMax(ev.target.value)
            setStylesheet(pstylesheet => {
                let copy = [...pstylesheet]
                label.forEach((l) => {
                    let index = copy.findIndex((obj) => obj.selector == `node[${attribute} = "${l}"]`)
                    let size = getSize(l, min, ev.target.value)
                    console.log(index, size)
                    if (index >= 0) {
                        let style = { ...copy[index]["style"] }
                        style["height"] = `${size}px`
                        style["width"] = `${size}px`
                        copy[index] = {
                            selector: `node[${attribute} = "${l}"]`,
                            style: style
                        }
                    } else {
                        copy.push({
                            selector: `node[${attribute} = "${l}"]`,
                            style: {
                                'height': `${size}px`,
                                'width': `${size}px`
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
                <TextField label="Size for all nodes" type="number" value={constant} onChange={(ev) => handleSizeChange(ev, "constant")} /> :
                <>
                    <TextField label="Min" type="number" value={min} onChange={(ev) => handleSizeChange(ev, "min")} />
                    <br />
                    <TextField label="Max" type="number" value={max} onChange={(ev) => handleSizeChange(ev, "max")} />
                </>}


        </FormControl>
    )
}

export default function NetworkGraph({ elements, directed }) {
    const [stylesheet, setStylesheet] = useState([
        {
            selector: "node",
            style: {
                "label": "data(id)",
                "text-valign": "center",
                "text-halign": "center",
                "height": "60px",
                "width": "60px",
                'background-color': "gray"
            }
        },
        {
            selector: "edge",
            style: {
                "target-arrow-shape": directed ? "triangle" : "none",
                "curve-style": "bezier",
                "arrow-scale": 1.5,
                'background-color': "gray"
            }
        },
        {
            selector: "edge[label]",
            style: {
                "label": "data(label)",
                "text-rotation": "autorotate",
                "text-margin-x": "0x",
                "text-margin-y": "0px",
                "text-valign": 'top',
                "text-background-color": 'white',
                "text-background-opacity": 1,
                "text-background-padding": '3px'
            }
        },
    ])

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
    const [cy, setCy] = useState(undefined)
    const [open, setOpen] = useState(false);
    const [colourAttribute, setColourAttribute] = useState("")
    const [sizeAttribute, setSizeAttribute] = useState("")
    const [colourLabels, setColourLabels] = useState([])
    const [sizeLabels, setSizeLabels] = useState([])
    const [inflate, setInflate] = useState(2)
    const [expand, setExpand] = useState(2)
    const [markovOpen, setMarkovOpen] = useState(false)

    function generateColours(quantity) {
        let colours = [];
        for (let i = 0; i < quantity; i++) {
            colours.push(`hsl(${(360 / quantity) * (quantity - i)}, 80%, 50%)`);
        }

        return colours;
    }

    const [c, setC] = useState()

    useEffect(() => {
        cy?.resize()
    }, [])

    useEffect(() => {
        setColourLabels(colourAttribute == "Constant" ? ["Colour for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
            return (ele.json().data[colourAttribute])
        }))))
    }, [colourAttribute, cy])

    useEffect(() => {
        setSizeLabels(sizeAttribute == "Constant" ? ["Size for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
            console.log(ele.json().data[sizeAttribute])
            return (ele.json().data[sizeAttribute])
        }))))
    }, [sizeAttribute, cy])

    useEffect(() => {
        setC(generateColours(colourLabels.length))
    }, [colourLabels])

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleAttributeChange = (text, ev) => {
        if (text == "Set Colour From") {
            setColourAttribute(ev.target.value)
        } else {
            setSizeAttribute(ev.target.value)
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
    }

    useEffect(() => {
        cy?.layout({ name: 'cose' }).run()
        cy?.center()
        cy?.fit()
    }, [cy, elements])

    useEffect(() => {
        setColourAttribute("")
        setSizeAttribute("")
        cy?.nodes().removeData()
    }, [elements])

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
            <Typography variant='h6' align='center'>Filter</Typography>
            <Divider />
            <Typography variant='h6' align='center'>Style</Typography>
            <List>
                {["Set Colour From", "Set Size From"].map((text, index) => (
                    <>
                        <ListItem key={text} disablePadding sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='overline' sx={{ width: '100%' }}>{text}</Typography>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Attribute</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={text == "Set Colour From" ? colourAttribute : sizeAttribute}
                                    label={text + " Attribute"}
                                    onChange={(ev) => { handleAttributeChange(text, ev) }}
                                >
                                    <MenuItem value="Constant">{text == "Set Colour From" ? "Constant Colour" : "Constant Size"}</MenuItem>
                                    {Object.keys(cy?.nodes()[0]?.json().data ? cy?.nodes()[0]?.json().data : {}).map((key, i) => {
                                        if (cy?.nodes()[0]?.json().data[key] != null) {
                                            if (text == "Set Colour From") {
                                                return <MenuItem value={key}>{key == 'id' ? "Input Label" : key.split("_").join(" ")}</MenuItem>
                                            } else {
                                                if (isNumerical[key]) {
                                                    return <MenuItem value={key}>{key == 'id' ? "Input Label" : key.split("_").join(" ")}</MenuItem>
                                                }
                                            }

                                        }

                                    })}

                                </Select>
                            </FormControl>
                        </ListItem>
                        {text == "Set Colour From" ?
                            colourAttribute != "" ? <ColourSelector setStylesheet={setStylesheet} attribute={colourAttribute} key={colourAttribute} label={colourLabels} c={c} /> : <></>
                            : sizeAttribute != "" ? <SizeSelector setStylesheet={setStylesheet} attribute={sizeAttribute} label={sizeLabels} /> : <></>}
                        <br />
                    </>
                ))}
            </List>
        </Drawer>

        <CytoscapeComponent cy={setCy} layout={{ name: 'cose' }} elements={[...elements]} style={{ width: '90%', height: '400px' }}
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