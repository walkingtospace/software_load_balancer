set terminal svg size 900, 300
set key autotitle columnhead
set datafile separator ','

set output "rateIncrease.svg"
plot 'nolbtestresultsRate' using 1:2 with lines title "No LB", \
	 'singlelbtestresultsRate' using 1:2 with lines title "Single CPU/MEM LB"

