set terminal png size 800, 400 transparent lw 2
set key autotitle columnhead
set datafile separator ','
set key left top

set xlabel "Rate of requests sent"
set ylabel "Time in seconds"
set output "../rateIncrease.png"
plot '../M-S/nolbtestRate' using 1:2 with lines title "No LB", \
	 '../M-S/singlelbtestRate' using 1:2 with lines title "Single M-S LB", \
	 '../M-S/meercattestRate' using 1:2 with lines title "2 M-S LBs", \
	 '../P2P/singlelbtestRate' using 1:2 with lines title "Single P2P LB", \
	 '../P2P/meercattestRate' using 1:2 with lines title "2 P2P LBs"

