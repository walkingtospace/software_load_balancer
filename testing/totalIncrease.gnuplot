set terminal svg size 900, 300
set key autotitle columnhead
set datafile separator ','

set xlabel 'Number of Requests'
show xlabel
set ylabel 'Time in seconds'
show ylabel
set output "totalIncrease.svg"
plot 'nolbtestresultsTotal' using 1:2 with lines title "No LB", \
	 'singlelbtestresultsTotal' using 1:2 with lines title "Single CPU/MEM LB", \
	 'meercattestresultsTotal' using 1:2 with lines title "2 CPU/MEM LB" 

