#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char** argv) {
    int max = 1000;
    int sleep_interval = 100;
    int mb = 0;
    char* buffer;

    if(argc > 1)
        max = atoi(argv[1]);
    if(argc > 2)
        sleep_interval = atoi(argv[2]);

    while((buffer=malloc(1024*1024)) != NULL && mb != max) {
        memset(buffer, 0, 1024*1024);
        mb++;
        printf("Allocated %d MB\n", mb);
    }
    if(argc < 2)
        while(1)
            sleep(sleep_interval);

    printf("sleeping for %d\n",sleep_interval);
    sleep(sleep_interval);
    return 0;
}