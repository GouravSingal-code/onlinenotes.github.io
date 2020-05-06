import Highway from '@dogstudio/highway';
import {TimelineLite} from 'gsap';

class effect extends Highway.Transition {
    
    in({from , to , trigger , done}){
      const lt = new TimelineLite();
    
      lt.fromTo( to , 0.5 , {left:"-100%" , top:"50%"} , {left:"0%"})
        .fromTo(to , 0.5 , {height:"10px"} , {height:"100%" , top:"0%" ,  onComplete: function(){
          from.remove();
          done();
      }})
      
    }
    
    out({from , trigger , done}){
     done(); 
    }
    
}

export default effect;