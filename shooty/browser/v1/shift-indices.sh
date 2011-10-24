#!/bin/bash

SRC_BASE_NAME=$1
DST_BASE_NAME=$2
SRC_START_INDEX=$3
SRC_END_INDEX=$4
SUFFIX=${5-.png}

function usage () {
    echo "usage: shift-indices.sh SRC_BASE_NAME DST_BASE_NAME SRC_START_INDEX SRC_END_INDEX <SUFFIX=.png>" 
    exit -1;
}

if [ "$SRC_BASE_NAME" = "" ] ; then usage ; fi
if [ "$DST_BASE_NAME" = "" ] ; then usage ; fi
if [ "$SRC_START_INDEX" = "" ] ; then usage ; fi
if [ "$SRC_END_INDEX" = "" ] ; then usage ; fi


echo "SRC_BASE_NAME:  $SRC_BASE_NAME" 
echo "DST_BASE_NAME:  $DST_BASE_NAME" 
echo "SUFFIX:     $SUFFIX" 

NUM_IMAGES=$(echo "$SRC_END_INDEX - $SRC_START_INDEX" | bc -l)
echo "NUM_IMAGES: $NUM_IMAGES"

if [ $NUM_IMAGES -gt 99 ] ; then
    DIGITS=3;
elif [ $NUM_IMAGES -gt 9 ] ; then
    DIGITS=2;
else
    DIGITS=1;
fi

if [ $SRC_END_INDEX -gt 99 ] ; then
    SRC_DIGITS=3;
elif [ $SRC_END_INDEX -gt 9 ] ; then
    SRC_DIGITS=2;
else
    SRC_DIGITS=1;
fi

echo "DIGITS:     $DIGITS"

function fill_number () {
    N=$1;
    if [ "$N" = "" ] ; then
        echo "error in fill_number:  missing input parameter" > /dev/stdout;
        exit -1;
    fi
    NUMBER_DIGITS=$(echo $(echo $N | wc -c) -1 | bc -l);
    #echo "fill_number: N: $N"
    #echo "fill_number: NUMBER_DIGITS $NUMBER_DIGITS"
    #echo "fill_number: DIGITS: $DIGITS"
    if [ "$1" = "src" ] ; then
        USE_DIGITS=$SRC_DIGITS
    else
        USE_DIGITS=$DIGITS
    fi

    for (( i=$NUMBER_DIGITS ; $i<$USE_DIGITS ; i++ )) ; do
        #cho "  -- adding 0"
        N="0$N"
    done
    echo $N
}
DST_INDEX=0

for (( i=$SRC_START_INDEX ; $i <= $SRC_END_INDEX ; i++ )) ; do
    TMP1=$(fill_number $DST_INDEX dst)
    TMP2=$(fill_number $i src)
    SRC="$SRC_BASE_NAME$TMP2$SUFFIX";
    #echo "TMP: $TMP"
    DST="$DST_BASE_NAME$TMP1$SUFFIX"
    echo "moving $SRC to $DST"
    mv $SRC $DST
    DST_INDEX=$(echo "$DST_INDEX+1" | bc -l)
done

