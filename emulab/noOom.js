//Make sure that webserver isn't killed
var exec = require('child_process').execSync;
var pid = (exec("pgrep -f webserver").toString()) - "\n";
exec("sudo echo -17 > /proc/" + pid + "/oom_adj");