for T in *.png ; do 
    convert -normalize -colorspace gray $T $(echo $T | sed "s|\.png|-gray\.png|g") ; 
done