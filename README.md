# Meercat

**Meercat** is a software L7 load balancer for data center to expressively perform request
routing / load balancing in Node.JS.  Meercat is implemented to proof the assumption that the overwall performance of network would be faster than before if a LB can loadbalance by CPU/Memory usage of its hosts.

##Directory Structure
- directory naming and structure follows MVC patterns 
- run.js is init file : "node run"

## How to use

## Features
- A Meercat communicate with all other n-1 Meercats to distribute traffic efficiently  
- Leverages the well-tested `node-http-proxy`.
- Simplicity of Express.
- Compatible with connect middleware (eg: qs parser, cookie decoder).
- Middleware makes sticky/session load balancing trivial to write.

## Behaviors


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
