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
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ColorPicker } from 'material-ui-color'
import Grid from "@mui/material/Grid"

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const ColourSelector = ({ c, label }) => {
    const [colour, setColour] = useState(c)

    const handleChange = (newColour, i) => {
        console.log(newColour)
        setColour(pcolour => {
            let copy = [...pcolour]
            copy[i] = newColour
            return copy
        })
    }

    return (
        <>

            {
                label?.map((l, i) => {
                    return (
                        <Grid container columns={4} alignContent="center" alignItems="center" key={l}>
                            <Grid item xs={1}>
                                <ColorPicker value={colour[i]} hideTextfield disableAlpha onChange={(ev) => handleChange(ev, i)} />
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

export default function NetworkGraph({ elements, directed }) {
    const [cy, setCy] = useState(undefined)
    const [open, setOpen] = useState(false);
    const [colourAttribute, setColourAttribute] = useState("")
    const [sizeAttribute, setSizeAttribute] = useState("")
    const [colourLabels, setColourLabels] = useState(colourAttribute == "Constant" ? ["Colour for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
        return (ele.json().data[colourAttribute])
    }))))

    useEffect(() => {
        cy?.resize()
    }, [])

    useEffect(() => {
        setColourLabels(colourAttribute == "Constant" ? ["Colour for all nodes"] : Array.from(new Set(cy?.nodes().map((ele, i) => {
            return (ele.json().data[colourAttribute])
        }))))
        console.log(cy?.nodes().map((ele, i) => {
            return (ele.json().data)
        }))
    }, [colourAttribute, cy])


    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleAttributeChange = (text, ev) => {
        console.log(ev)
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
                ele.data("In Degree", degree)
            });
        }
    }

    const getOutDegrees = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.degreeCentrality({ root: ele, directed: true }).outdegree
                ele.data("Out Degree", degree)
            });
        }
    }

    const getDegrees = (ev) => {
        let eles = cy?.$()
        let nodes = cy?.nodes()
        if (eles && nodes) {
            nodes.forEach(ele => {
                let degree = eles.degreeCentrality({ root: ele }).degree
                ele.data(directed ? "Total Degree" : "Degree", degree)

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
                ele.data("Page Rank", rank)


            })
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
        'Page Rank': getPageRank
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
                {(directed ? ['In Degree', 'Out Degree', 'Total Degree', 'Page Rank'] : ['Degree', 'Page Rank']).map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton onClick={mapButtonsToFuncs[text]}>
                            <ListItemText primary={text} align="center" />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <Typography variant='h6' align='center'>Cluster</Typography>
            <List>
                {['Markov', "K means", "Heirarchical", "Affinity Propagation"].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={text} align="center" />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
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
                                            return <MenuItem value={key}>{key == 'id' ? "Input Label" : key}</MenuItem>

                                        }

                                    })}

                                </Select>
                            </FormControl>
                        </ListItem>
                        {text == "Set Colour From" ?
                            colourAttribute != "" ? <ColourSelector label={colourLabels} c={Array(colourLabels.length).fill("white")} /> : <></>
                            : <></>}
                        <br />
                    </>
                ))}
            </List>
        </Drawer>

        <CytoscapeComponent cy={setCy} layout={{ name: 'cose' }} elements={[...elements]} style={{ width: '90%', height: '400px' }}
            stylesheet={[
                {
                    selector: "node",
                    style: {
                        "label": "data(id)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "height": "60px",
                        "width": "60px"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "target-arrow-shape": directed ? "triangle" : "none",
                        "curve-style": "bezier",
                        "arrow-scale": 1.5
                    }
                },
                {
                    selector: "edge[label]",
                    style: {
                        "label": "data(label)",
                        "text-rotation": "autorotate",
                        "text-margin-x": "0px",
                        "text-margin-y": "0px",
                        "text-valign": 'top',
                        "text-background-color": 'white',
                        "text-background-opacity": 1,
                        "text-background-padding": '3px'
                    }
                },
            ]} />
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