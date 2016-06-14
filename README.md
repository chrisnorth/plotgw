# plotgw

The websites here show the plotting of gravitational wave data based on LIGO results, along with other measurements.

## GW Calatalogue

A plot of the detections of compact binary systems (binary black holes/neutron stars) by LIGO. Additional information appears on the right. Use the cog icon in the top-right of the graph to change the variables plotted on the graph.

## BHBubble: Known Stellar-mass black holes

All known black holes, plotted as a bubble plot. By default, the circle areas represent the sizes of the black holes (specifically the Schwarzschild radii), though it can be changed to scale by mass. By default, only the initial black holes in merging binary systems are shown, but the controls allow the user to show the final mergers.

## Translations
BHBubble is also available in:
* [French](http://gravity.astro.cf.ac.uk/plotgw/BHBubble.html?lang=fr)
* [Odia (Oriya)](http://gravity.astro.cf.ac.uk/plotgw/BHBubble.html?lang=or)

To provide further translations, translate the text on the right side of [bhbubble-lang/en.json](https://github.com/chrisnorth/plotgw/blob/master/bhbubble-lang/en.json). For non-Roman alphabets the contents should use HTML codes. The current recommendation is to use [this (unrelated) page](http://lcogt.net/starinabox/translate.html) to translate to HTML codes.

## Technical details

The plots use d3 to plot data in csv files. The display should be responsive on screen resizing. Language translations are read from json files. I should acknowledge Stuart Lowe, as portions of these pages were developed from repositories he largely contributed to.

