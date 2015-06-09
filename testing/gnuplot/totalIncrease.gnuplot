set terminal svg size 900, 300
set key autotitle columnhead
set datafile separator ','

set output "totalIncrease.svg"
plot 'nolbtestresults' using 1:2 with lines title "No LB", \
	 'singlelbtestresults' using 1:2 with lines title "Single CPU/MEM LB"

