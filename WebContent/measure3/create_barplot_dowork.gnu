# set terminal pngcairo  transparent enhanced font "arial,10" fontscale 1.0 size 500, 350 
# set output 'histograms.6.png'


#set style line 1 linetype 1 linecolor rgb "cyan"
#set  palette gray

#set style increment user
set style line 2 lc rgb "yellow"


# set style line 1 lc rgb "yellow"
 
 
 
set border 3 front linetype -1 linewidth 1.000
set boxwidth 0.9 relative
set style fill solid 1.00 border lt -1
set grid nopolar
set grid noxtics nomxtics ytics nomytics noztics nomztics \
 nox2tics nomx2tics noy2tics nomy2tics nocbtics nomcbtics
set grid layerdefault   linetype 0 linewidth 1.000,  linetype 0 linewidth 1.000
set key outside right top vertical Left reverse noenhanced autotitles columnhead box linetype -1 linewidth 1.000
 
 
 
set style histogram columnstacked title  offset character 0, 0, 0
#set style histogram title  offset character 0, 0, 0
##!!## set datafile missing '-'

#set style histogram columnstacked
set style data histograms
#
#
#


set xtics border in scale 1,0.5 nomirror norotate  offset character 0, 0, 0 autojustify
set xtics  norangelimit
set xtics rotate by -30

set xtics ("xmlParsing" 0, "svgRender" 1, "drawOverlay" 2)

set ytics border in scale 0,0 mirror norotate  offset character 0, 0, 0 autojustify

##default: 1000
#set ytics 1000
##if min --> 100
#isoff = strstrt(file, "min")
#if(isoff!=0) {set ytics 100;}

set ztics border in scale 0,0 nomirror norotate  offset character 0, 0, 0 autojustify
set cbtics border in scale 0,0 mirror norotate  offset character 0, 0, 0 autojustify
set rtics axis in scale 0,0 nomirror norotate  offset character 0, 0, 0 autojustify
#set title file 
set xlabel "Device" 
set ylabel "Execution time [ms]" 
set yrange [ 0.00000 : * ] noreverse nowriteback

isbig = strstrt(file, "big")
print "########### isbig" . isbig
if(isbig!=0) {set ytics 2500;}
if(isbig==0) {set ytics 100;}


i = 23
set style fill pattern 

#plot file.'.dat' using (0):2, '' using 3 ti col, '' using 4 ti col, '' using 5 ti col, '' using 6:key(1) ti col, \
#  file.'.dat' using 2 ti col, '' using 3 ti col, '' using 4 ti col, '' using 5 ti col, '' using 6 ti col;



set key autotitle columnheader


#ORDER OF STACKED BARS:
first_device_col = "7"
device_cols = "6 3 11 12 4 5 8 10 9"


str = "plot file.'.dat' using ".first_device_col.":key(1)"

do for [device_col in device_cols]{
#do for [device_col=3:10] {
  #if(!(device_col == 4 || device_col == 7 || device_col == 10)) {
    
    str = str .  ", file.'.dat' using ".device_col;
  #}
  
}


#set boxwidth 0.5 absolute
#set style fill   pattern 0 border
#set samples 11, 11
#set noxtics
#set noytics
#set title "A demonstration of boxes in mono with style fill pattern" 


#plot  "minimal-data-deflate.xml.dat"  using 2:key(1) , "" using 3 title column, "" using 4 title column

print str
eval(str);