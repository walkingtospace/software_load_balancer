cd /proj/Reactor/software_load_balancer/client
git pull
#Stress can be induced on server by commention out the following line
#node stress.js 50 10000 0
node sysinfo.js &
node --expose-gc --max-old-space-size=15000 webserver.js &