set terminal svg size 900, 300
set key autotitle columnhead
set datafile separator ','

set xlabel 'Number of requests per second'
show xlabel
set ylabel 'Time in seconds'
show ylabel
set output "rateIncrease.svg"
plot 'nolbtestresultsRate' using 1:2 with lines title "No LB", \
	 'singlelbtestresultsRate' using 1:2 with lines title "Single CPU/MEM LB", \
	 'meercattestresultsRate' using 1:2 with lines title "2 CPU/MEM LB" 

