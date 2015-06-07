killall node 2>/dev/null
cd /proj/Reactor/software_load_balancer/client
node measureCPU.js &
node sysinfo.js &
node --expose-gc webserver.js &