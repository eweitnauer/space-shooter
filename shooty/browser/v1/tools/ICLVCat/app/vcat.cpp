#include <ICLQuick/Common.h>


int main(int n, char **ppc){
  painit(n,ppc,"[m]-input-files|-i(...) -o(filename)");
  
  ImgQ image(Size(0,0),4);
  for(int i=0;i<pa("-i").n();++i){
    image = image % load(pa("-i",i));
  }
  
  if(!pa("-o")){
    show(image);
  }else{
    save(cvt8u(image),*pa("-o"));
  }
  
  
}

