# Meercat

**Meercat** is a software L7 load balancer for data center to expressively perform request
routing / load balancing in Node.JS.  Meercat is implemented to proof the assumption that the overall performance of a network would be faster than before if a LB can loadbalance traffic by depending on CPU/Memory usage of its hosts.

##Directory Structure
- Directory naming and structure follow the MVC pattern 
- Initiating file : runs.js at root (do "node run")

## Features
- A Meercat communicate with all other n-1 Meercats to distribute traffic efficiently  
- Leverages the well-tested `node-http-proxy`.
- Simplicity of Express.
- Compatible with connect middleware (eg: qs parser, cookie decoder).
- Middleware makes sticky/session load balancing trivial to write.

## Round Robin Test
- Two hosts are on running AWS instances by 'forever' (https://www.npmjs.com/package/forever).
- host1 address: http://52.8.15.202:3000/
- host2 address: http://52.8.72.3:3000/
- roundrobin request : 1) download Meercat, 2) node.js, 3)npm install 4) "node run" 5)enter "http://rootaddress/route/roundrobin" into url, then it shows the load balancing results by the round robin

## License 

(The MIT License)

Copyright (c) 2011 Guillermo Rauch &lt;guillermo@learnboost.com&gt;

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
