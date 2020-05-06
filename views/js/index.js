import Highway from '@dogstudio/highway';
import effect from './transition';

const H = new Highway.Core({
    transitions:{
        default:effect;
    }
})