set terminal png size 900, 300
set key autotitle columnhead
set datafile separator ','

set xlabel 'Number of Requests'
show xlabel
set ylabel 'Utilization'
show ylabel
set output "cpuUtil.svg"
plot '../results/nolbtestresultsCPU' using 1:8 with lines title "No LB", \
	 '../results/singlelbtestresultsCPU' using 1:8 with lines title "Single M-S LB", \
	 '../results/singlelbtestresultsCPU' using 1:8 with lines title "Two M-S LB", \
	 '../results/singlelbtestresultsCPU' using 1:8 with lines title "Single M-S LB", \
	 '../results/singlelbtestresultsCPU' using 1:8 with lines title "Two M-S LB"

