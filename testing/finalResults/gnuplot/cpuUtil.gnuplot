set terminal png size 800, 400 transparent lw 2
set key autotitle columnhead
set datafile separator ','
set key left top

set xlabel "Number of requests sent"
set ylabel "CPU utilization (in percentage)"
set output "../cpuUtil.png"
plot '../M-S/nolbtestCpu' using 1:2 with lines title "No LB", \
	 '../M-S/singlelbtestCpu' using 1:2 with lines title "Single M-S LB", \
	 '../M-S/meercattestCpu' using 1:2 with lines title "2 M-S LBs", \
	 '../P2P/singlelbtestCpu' using 1:2 with lines title "Single P2P LB", \
	 '../P2P/meercattestCpu' using 1:2 with lines title "2 P2P LBs"

