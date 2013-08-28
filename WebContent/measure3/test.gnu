set style histogram columnstacked 
set style data histograms
set key autotitle columnheader
plot for [i=2:6] 'test.dat' using i
