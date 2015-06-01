# Meercat

**Meercat** is a software L7 load balancer for data center to expressively perform request
routing / load balancing in Node.JS.  Meercat is implemented to proof the research assumption that the overall performance of a network would be improved if a load balancer can distribute traffic upon CPU/Memory resource of hosts.

##Directory Structure
- Directory naming and structure follow the MVC pattern 
- Initiating file : runs.js at root ("sudo node run")

## Features
- Loadbalancing: A Meercat communicate with all other n-1 Meercats to distribute traffic efficiently
- Hierachy : A meercat system consists of one master and multi slaves which are connected to each other. 
- Failover : A meercat system takes advantages of multi loadbalancer system. When a master fails (power-off or error) while on running, one of the other slaves automatically takes over the role. 
- Routing : A meercat supports two routing algorithms; Round-Robin and CPU/MEM-usage-based routing. 
- A master checks all CPU/MEM resource usage of hosts and propagates to slaves. 
- All slaves ping to the master every seconds; if no response, the next slave becomes a master.

## Round-Robin algorithm test
- Running dummy hosts ("sudo node /client/webserver.js").
- Running two resource-check processes on those hosts ("sudo node /client/sysinfo.js")
- Dummy host is accessible from outside via port 3000 (http://xxx.xxx.xxx.xxx:3000/)
- Roundrobin load balancing request : 1) download Meercat, 2) install node.js, 3) "npm install" 4) "node run" 5) enter "http://xxx.xxx.xxx.xxx[rootaddress]/route/roundrobin" into url, then it shows the load balancing results by the round robin

## CPU/MEM-usage-based algorithm test
- Running dummy hosts, resource-check processes and meercats as mentioned above (Round-Roubin algorithm test 1~4)
- CPU usage-based redirection request : "http://xxx.xxx.xxx.xxx/route/resourcebase/CPU" into url, then it shows the load balancing results by hosts' CPU usage
- MEM usage-based redirection request : "http://xxx.xxx.xxx.xxx[rootaddress]/route/resourcebase/MEM" into url, then it shows the load balancing results by hosts' MEM usage

## Performance Measurement

## License 

(The MIT License)

Copyright (c) 2015 Honam Bhang &lt;hobang@ucsd.edu&gt;, Emil "Thalley" Gydesen &lt;mrthalley@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
