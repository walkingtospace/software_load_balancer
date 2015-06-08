ssh -oStrictHostKeyChecking=no thalley@node-1.singlelbtest.reactor /proj/Reactor/software_load_balancer/emulab/SingleLBtest/clientstartupscript.sh &
ssh thalley@lb.singlelbtest.reactor /proj/Reactor/software_load_balancer/emulab/SingleLBtest/lbstartupscript.sh &
