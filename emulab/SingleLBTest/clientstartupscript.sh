cd /proj/Reactor/software_load_balancer/client
node measureCPUjs &
node sysinfo.js &
node --expose-gc webserver.js &