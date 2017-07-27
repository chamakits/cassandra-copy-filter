* July 27, 2017
  + Started a couple of machines to setup a cassandra cluster.
  + Was using a pretty good ansible script (forked: https://github.com/chamakits/ansible-cassandra) to set it up. Took some doing though.
    + Had to force on a couple of the 'stop' steps a '|| true', because it was trying to stop something that wasn't up
    + The documentation clearly said to specify IP, and I didn't. I specified the machine's name in my ssh config file, which each machine doesn't have.
    + For some reason, each node fails the first time trying to read the log, waiting for cassandra to be up. Maybe adding a random wait will help? No idea.
    + I have to ssh at least once to the machine first, so that it won't prompt me telling "Hey I never heard of this machine before, going to allow it okay?"
    + I haven't really pushed those changes just yet, cause they are straight up hacks, and I'd like to know why it's happening.
    + The machines I used were 3 of them, and they each had 4 gigs of RAM.