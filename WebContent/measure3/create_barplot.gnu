reset

files = 'minimal-data-deflate.xml big-data-deflate.xml'

#outtypes = 'default png tikz'
outtypes = 'default png tikz'

do for [outtype in outtypes]{


  if(strstrt(outtype, "default")==1) {
    print "enabling ".outtype
    load 'create_'.outtype.'_enable.gnu'
  }
  
  do for [file in files]{
  
    if(strstrt(outtype, "default")==0) {
      print "enabling ".outtype
      load 'create_'.outtype.'_enable.gnu'
    }

    
    print "working on ".file. " 

    load 'create_barplot_dowork.gnu'
    
    if(strstrt(outtype, "default")==0) {
      load 'create_'.outtype.'_disable.gnu'
      print "disabled ".outtype
    }
    

  }
  
  if(strstrt(outtype, "default")==1) {
    load 'create_'.outtype.'_disable.gnu'
    print "disabled ".outtype
  }
  
  

}

set terminal wxt
set output