set terminal png size 800, 400 transparent lw 2
set key autotitle columnhead
set datafile separator ','
set key left top

set xlabel "Number of requests sent"
set ylabel "Time in seconds"
set output "../totalIncrease.png"
plot '../M-S/nolbtestTotal' using 1:2 with lines title "No LB", \
	 '../M-S/singlelbtestTotal' using 1:2 with lines title "Single M-S LB", \
	 '../M-S/meercattestTotal' using 1:2 with lines title "2 M-S LBs", \
	 '../P2P/singlelbtestTotal' using 1:2 with lines title "Single P2P LB", \
	 '../P2P/meercattestTotal' using 1:2 with lines title "2 P2P LBs"

