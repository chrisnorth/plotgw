# plotgw

The websites here show the plotting of gravitational wave data based on LIGO results, along with other measurements.

## GW Calatalogue

A plot of the detections of compact binary systems (binary black holes/neutron stars) by LIGO. Additional information appears on the right. Use the cog icon in the top-right of the graph to change the variables plotted on the graph.

## BHBubble: Known Stellar-mass black holes

All known black holes, plotted as a bubble plot. By default, the circle areas represent the sizes of the black holes (specifically the Schwarzschild radii), though it can be changed to scale by mass. By default, only the initial black holes in merging binary systems are shown, but the controls allow the user to show the final mergers.

The two scalings (by size and mass) scale the area of the displayed circles.
* Scale by size: scale area of circle by cross sectional area of black hole (i.e. circle radius scaled by black hole radius).
* Scale by mass: scale area of circle by mass of black hole.

### Translations
BHBubble is also available in:
* [French](http://chrisnorth.github.io/plotgw/bhbubble?lang=fr) [translation credit: Nicolas Arnaud)]
* [German](http://chrisnorth.github.io/plotgw/bhbubble?lang=fr) [translation credit: Benjamin Knispel]
* [Hungarian](http://chrisnorth.github.io/plotgw/bhbubble?lang=hu) [translation credit: Szölgyén Ákos, Dálya Gergely, Raffai Péter]
* [Odia (Oriya)](http://chrisnorth.github.io/plotgw/bhbubble?lang=or) [translation credit: ]
* [Welsh](http://chrisnorth.github.io/plotgw/bhbubble?lang=cy) [translation credit: Gwen Williams]
* [Chinese (Hong Kong)](http://chrisnorth.github.io/plotgw/bhbubble?lang=zhhk)

To provide further translations, translate the text on the right side of [bhbubble-lang/en.json](https://github.com/chrisnorth/plotgw/blob/master/bhbubble-lang/en.json). For non-Roman alphabets the contents should use HTML codes.

### Data sources

* LIGO data: [LIGO Open Science Centre](http://losc.ligo.org)
* X-ray binary data: Files stored at [stellarcollapse.org](https://stellarcollapse.org/sites/default/files/table.pdf)

### Technical details

The plots use [d3](https://d3js.org/) to plot data stored in csv files. The display should be responsive on screen resizing. Language translations are read from json files. I should acknowledge Stuart Lowe, as portions of these pages were developed from repositories he largely contributed to.

Note that the analytics.js file used for usage tracking is not stored within this repository, and is only present on the live server.

