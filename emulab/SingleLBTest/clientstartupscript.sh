cd /proj/Reactor/software_load_balancer/client
#Stress can be induced on server by commention out the following line
# node stress.js 0 10000 &
node sysinfo.js &
node --expose-gc webserver.js &