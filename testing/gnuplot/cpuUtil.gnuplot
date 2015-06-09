set terminal svg size 900, 300
set key autotitle columnhead
set datafile separator ','

set xlabel 'Number of Requests'
show xlabel
set ylabel 'Utilization'
show ylabel
set output "cpuUtil.svg"
plot 'nolbtestresultsTotal' using 1:8 with lines title "No LB", \
	 'singlelbtestresultsTotal' using 1:8 with lines title "Single CPU/MEM LB",

